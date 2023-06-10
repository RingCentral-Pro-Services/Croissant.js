import { Extension } from "../../../../../models/Extension"
import { Greeting } from "../../../../../models/Greetings"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { CallHandling } from "../../User Data Download/models/UserDataBundle"
import { CallQueueDataBundle } from "../models/CallQueueDataBundle"

const useConfigureQueue = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseNotificationsSettingsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/ruleId'
    const baseCustomGreetingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/greeting'
    const baseScheduleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/business-hours'
    const baseMembersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId/bulk-assign'
    const baseWaitingPeriod = 250

    const configureQueue = async (bundle: CallQueueDataBundle, originalExtensions: Extension[], targetExtensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await setSchedule(bundle, accessToken)
        await setMembers(bundle, originalExtensions, targetExtensions, accessToken)
        await setNotifications(bundle, originalExtensions, targetExtensions, accessToken)
        const customBusinessHoursGreetings = await setDuringHoursGreetings(bundle, accessToken)
        const customAfterHoursGreetings = await setAfterHoursGreetings(bundle, accessToken)
        if (customBusinessHoursGreetings) {
            for (const greeting of customBusinessHoursGreetings) {
                console.log('setting custom greeting')
                await setCustomGreeting(bundle, 'business-hours-rule', greeting, accessToken)
            }
        }
        if (customAfterHoursGreetings) {
            for (const greeting of customAfterHoursGreetings) {
                console.log('setting custom greeting')
                await setCustomGreeting(bundle, 'after-hours-rule', greeting, accessToken)
            }
        }
        const adjustedBusinessHoursCallHandling = adjustCallHandling(bundle, bundle.extendedData!.businessHoursCallHandling!, originalExtensions, targetExtensions)
        if (adjustedBusinessHoursCallHandling) {
            await setCallHandling(bundle, adjustedBusinessHoursCallHandling, accessToken)
        }
    }

    const setSchedule = async (bundle: CallQueueDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.put(baseScheduleURL.replace('extensionId', `${bundle.extension.data.id}`), headers, bundle.extendedData?.businessHours)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set schedule`)
            console.log(e)
            postMessage(new Message(`Failed to set schedule for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set schedule', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setNotifications = async (bundle: CallQueueDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            if (bundle.extendedData?.notifications?.emailRecipients) {
                for (let index = 0; index < bundle.extendedData.notifications.emailRecipients.length; index++) {
                    let recipient = bundle.extendedData?.notifications?.emailRecipients[index]

                    const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${recipient.extensionId}`)
                    if (!originalExtension) {
                        postMessage(new Message(`Failed to set email recipients for queue ${bundle.extension.data.name}. Old ID for ${recipient.fullName} not found`, 'warning'))
                    }

                    const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension?.data.name && `${ext.data.extensionNumber}` === `${originalExtension.data.extensionNumber}`)
                    if (!newExtension) {
                        postMessage(new Message(`Failed to set email recipients for queue ${bundle.extension.data.name}. New ID for ${recipient.fullName} not found`, 'warning'))
                    }

                    recipient.extensionId = `${newExtension?.data.id}`
                }
            }

            const response = await RestCentral.put(baseNotificationsSettingsURL.replace('extensionId', `${bundle.extension.data.id}`), headers, bundle.extendedData?.notifications)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set notifications`)
            console.log(e)
            postMessage(new Message(`Failed to set notifications ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set notifications', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setMembers = async (bundle: CallQueueDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const foundMembers: string[] = []
            for (const member of bundle.extendedData!.members!) {
                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${member.id}`)
                if (!originalExtension) {
                    postMessage(new Message(`Ext ${member.extensionNumber} was removed from queue ${bundle.extension.data.name} because it's original ID could not be found`, 'warning'))
                    continue
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension?.data.name && `${ext.data.extensionNumber}` === `${originalExtension.data.extensionNumber}`)
                if (!newExtension) {
                    postMessage(new Message(`Ext ${member.extensionNumber} was removed from queue ${bundle.extension.data.name} because it's new ID could not be found`, 'warning'))
                    continue
                }

                foundMembers.push(`${newExtension.data.id}`)
            }

            if (foundMembers.length === 0) return

            const body = {addedExtensionIds: foundMembers}
            const response = await RestCentral.post(baseMembersURL.replace('groupId', `${bundle.extension.data.id}`), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set members`)
            console.log(e)
            postMessage(new Message(`Failed to add queue members ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to add queue members', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setDuringHoursGreetings = async (bundle: CallQueueDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const greetings = bundle.extendedData?.businessHoursCallHandling?.greetings
            const nonCustomGreetings = greetings?.filter((greeting) => greeting.preset)
            const customGreetings = greetings?.filter((greeting) => !greeting.preset)

            const body = {
                greetings: nonCustomGreetings
            }

            const response = await RestCentral.put(baseCallHandlingURL.replace('extensionId', `${bundle.extension.data.id}`).replace('ruleId', 'business-hours-rule'), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return customGreetings
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set business hours greetings`)
            console.log(e)
            postMessage(new Message(`Failed to set business hours greetings for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set business hours greetings', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setAfterHoursGreetings = async (bundle: CallQueueDataBundle, token: string) => {
        if (Object.keys(bundle.extendedData!.businessHours!.schedule).length === 0) return
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const greetings = bundle.extendedData?.afterHoursCallHandling?.greetings
            const nonCustomGreetings = greetings?.filter((greeting) => greeting.preset)
            const customGreetings = greetings?.filter((greeting) => !greeting.preset)

            const body = {
                greetings: nonCustomGreetings
            }

            const response = await RestCentral.put(baseCallHandlingURL.replace('extensionId', `${bundle.extension.data.id}`).replace('ruleId', 'after-hours-rule'), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return customGreetings
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set after hours greetings`)
            console.log(e)
            postMessage(new Message(`Failed to set after hours greetings for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set after hours greetings', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setCustomGreeting = async (bundle: CallQueueDataBundle, ruleID: string, greeting: Greeting, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "multipart/form-data",
                "Content-Disposition": `attachment; filename="greeting.mp3"`,
                "Authorization": `Bearer ${token}`
            }

            const formData = new FormData()
            const filename = `audio.${greeting.custom?.contentType === 'audio/mpeg' ? 'mp3' : 'wav'}`
            const file = new File([greeting.custom?.data], filename, {
                type: greeting.custom?.contentType === 'audio/mpeg' ? 'audio/mpeg' : 'audio/wav'
            })
            formData.append('type', greeting.type)
            formData.append('answeringRuleId', ruleID)
            formData.append('binary', file, file.name)

            const response = await RestCentral.post(baseCustomGreetingURL.replace('extensionId', `${bundle.extension.data.id}`), headers, formData)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set custom ${greeting.type} greeting`)
            console.log(e)
            postMessage(new Message(`Failed to set custom ${greeting.type} greeting for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set custom greeting', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setCallHandling = async (bundle: CallQueueDataBundle, callHandling: CallHandling, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.put(baseCallHandlingURL.replace('extensionId', `${bundle.extension.data.id}`).replace('ruleId', 'business-hours-rule'), headers, callHandling)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set call handling`)
            console.log(e)
            postMessage(new Message(`Failed to set call handling for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set call handling', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const adjustCallHandling = (bundle: CallQueueDataBundle, callHandling: CallHandling, originalExtensions: Extension[], targetExtensions: Extension[]) => {

        // Adjust transfer extension
        if (callHandling.transfer) {
            const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${callHandling.transfer.extension.id}`)
            if (!originalExtension) {
                postMessage(new Message(`Could not set call handling for ${bundle.extension.data.name} because the original transfer extension wasn't found`, 'error'))
                return
            }

            const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
            if (!newExtension) {
                postMessage(new Message(`Could not set call handling for ${bundle.extension.data.name} because the new transfer extension wasn't found`, 'error'))
                return
            }

            callHandling.transfer.extension.id = `${newExtension.data.id}`
            delete callHandling.transfer.extension.extensionNumber
            delete callHandling.transfer.extension.uri
        }

        // Adjust voicemail recipient
        if (callHandling.voicemail && callHandling.voicemail.enabled) {
            const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${callHandling.voicemail.recipient.id}`)
            if (!originalExtension) {
                postMessage(new Message(`Could not set call handling for ${bundle.extension.data.name} because the original voicemail recipient wasn't found`, 'error'))
                return
            }

            const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
            if (!newExtension) {
                postMessage(new Message(`Could not set call handling for ${bundle.extension.data.name} because the new voicemail recipient wasn't found`, 'error'))
                return
            }

            callHandling.voicemail.recipient.id = `${newExtension.data.id}`
            delete callHandling.voicemail.recipient.displayName
            delete callHandling.voicemail.recipient.uri
        }

        // Adjust missed call destination
        if (callHandling.missedCall && callHandling.missedCall.extension && callHandling.missedCall.extension.id) {
            const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${callHandling.missedCall.extension.id}`)
            if (!originalExtension) {
                postMessage(new Message(`Could not set call handling for ${bundle.extension.data.name} because the original missed call destination wasn't found`, 'error'))
                return
            }

            const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
            if (!newExtension) {
                postMessage(new Message(`Could not set call handling for ${bundle.extension.data.name} because the new missed call destination wasn't found`, 'error'))
                return
            }

            callHandling.missedCall.extension.id = `${newExtension.data.id}`
            delete callHandling.missedCall.extension.displayName
        }

        // Adjust queue-specific things
        if (callHandling.queue) {
            if (callHandling.queue.transfer) {

                // Adjust transer extensions
                for (let i = 0; i < callHandling.queue.transfer?.length; i++) {
                    let transfer = callHandling.queue.transfer[i]

                    const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${transfer.extension.id}`)
                    if (!originalExtension) {
                        postMessage(new Message(`Could not set call handling for ${bundle.extension.data.name} because the original transfer destination wasn't found`, 'error'))
                        return
                    }

                    const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
                    if (!newExtension) {
                        postMessage(new Message(`Could not set call handling for ${bundle.extension.data.name} because the new transfer destination wasn't found`, 'error'))
                        return
                    }

                    transfer.extension.id = `${newExtension.data.id}`
                    delete transfer.extension.extensionNumber
                    delete transfer.extension.name
                }
            }

            // Adjust fixed order agents
            if (callHandling.queue.fixedOrderAgents) {
                for (let i = 0; i < callHandling.queue.fixedOrderAgents.length; i++) {
                    let agent = callHandling.queue.fixedOrderAgents[i]

                    const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${agent.extension.id}`)
                    if (!originalExtension) {
                        postMessage(new Message(`Could not set call handling for ${bundle.extension.data.name} because the original transfer destination wasn't found`, 'error'))
                        return
                    }

                    const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
                    if (!newExtension) {
                        postMessage(new Message(`Could not set call handling for ${bundle.extension.data.name} because the new transfer destination wasn't found`, 'error'))
                        return
                    }

                    agent.extension.id = `${newExtension.data.id}` 
                }
            }
        }

        return callHandling
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {configureQueue}
}

export default useConfigureQueue