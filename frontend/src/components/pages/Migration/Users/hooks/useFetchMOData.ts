import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { CallHandling, Notifications, PhoneNumber } from "../../User Data Download/models/UserDataBundle";
import { MessageOnlyDataBundle } from "../models/MessageOnlyDataBundle";

const useFetchMOData = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseDataURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'
    const baseNotificationsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'
    const basePhoneNumbersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/phone-number?usageType=DirectNumber&perPage=1000'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/ruleId'
    const baseCustomGreetingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/greeting/greetingId'
    const baseWaitingPeriod = 250

    const fetchMOData = async (extension: Extension) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const newExtension = await fetchBaseData(extension, accessToken)
        if (!newExtension) {
            postMessage(new Message(`Failed to fetch base data for ${extension.data.name}`, 'error'))
            postError(new SyncError(extension.data.name, extension.data.extensionNumber, ['Failed to fetch base data', '']))
            return
        }

        const notifications = await fetchNotificationSettings(newExtension, accessToken)
        const directNumbers = await fetchDirectNumbers(newExtension, accessToken)
        const callHandling = await fetchCallHandling(newExtension, accessToken)
        let voicemailGreeting = undefined
        if (callHandling?.greetings) voicemailGreeting = callHandling?.greetings[0]
        if (voicemailGreeting && voicemailGreeting.custom) {
            // This is a custom greeting
            const greetingData = await getCustomGreetingURL(newExtension, voicemailGreeting.custom.id, accessToken)
            if (greetingData) {
                const audioData = await getCustomGreetingData(newExtension, greetingData[0], accessToken)
                voicemailGreeting.custom.data = audioData
                voicemailGreeting.custom.contentType = greetingData[1]
            }
        }
        return new MessageOnlyDataBundle(newExtension, {notifications: notifications, directNumbers: directNumbers, vmRecipientID: callHandling?.voicemail?.recipient?.id ?? '', greeting: voicemailGreeting})
    }

    const fetchBaseData = async (extension: Extension, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseDataURL.replace('extensionId', `${extension.data.id}`), headers)
            const newExtension = new Extension(response.data)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return newExtension
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get base data`)
            console.log(e)
            postMessage(new Message(`Failed to get base data for ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to fetch base data', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchNotificationSettings = async (extension: Extension, token: string) => {
        if (extension.prettyType() !== 'Message-Only') return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseNotificationsURL.replace('extensionId', `${extension.data.id}`), headers)
            const notifications = response.data as Notifications

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return notifications
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get notification settings`)
            console.log(e)
            postMessage(new Message(`Failed to get notification settings for ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to fetch notification settings', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchDirectNumbers = async (extension: Extension, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(basePhoneNumbersURL.replace('extensionId', `${extension.data.id}`), headers)
            const numbers = response.data.records as PhoneNumber[]
            const directNumbers = numbers.filter((number) => !number.extension)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return directNumbers
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get direct numbers`)
            console.log(e)
            postMessage(new Message(`Failed to get direct numbers for ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to fetch direct numbers', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchCallHandling = async (extension: Extension, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCallHandlingURL.replace('extensionId', `${extension.data.id}`).replace('ruleId', 'business-hours-rule'), headers)
            const callHandling = response.data as CallHandling

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return callHandling
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get business hours call handling`)
            console.log(e)
            postMessage(new Message(`Failed to get business hours call handling for ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to fetch business hours call handling', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const getCustomGreetingURL = async (extension: Extension, greetingID: string, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCustomGreetingURL.replace('extensionId', `${extension.data.id}`).replace('greetingId', greetingID), headers)
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return [response.data.contentUri, response.data.contentType]
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get custom greeting URL`)
            console.log(e)
            postMessage(new Message(`Failed to get custom greeting URL for ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to get custom greeting URL', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const getCustomGreetingData = async (extension: Extension, url: string, token: string) => {
        try {
            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            // const blob = new Blob([response.data])
            const buffer = await res.arrayBuffer()

            return buffer
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get custom greeting URL`)
            console.log(e)
            postMessage(new Message(`Failed to get custom greeting URL for ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to get custom greeting URL', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {fetchMOData}
}

export default useFetchMOData