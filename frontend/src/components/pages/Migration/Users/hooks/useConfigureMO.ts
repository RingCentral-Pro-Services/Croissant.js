import { Extension } from "../../../../../models/Extension"
import { Greeting } from "../../../../../models/Greetings"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { MessageOnlyDataBundle } from "../models/MessageOnlyDataBundle"

const useConfigureMO = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, emailSuffix: string) => {
    const baseNotificationsSettingsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/ruleId'
    const baseCustomGreetingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/greeting'
    const baseWaitingPeriod = 250

    const configureMO = async (bundle: MessageOnlyDataBundle, originalExtensions: Extension[], targetExtensions: Extension[]) => {
        if (bundle.hasEncounteredFatalError) return
        
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await setNotifications(bundle, accessToken)
        await setVoicemailRecipient(bundle, originalExtensions, targetExtensions, accessToken)
        if (bundle.extendedData?.greeting && bundle.extendedData.greeting.custom) {
            await setCustomGreeting(bundle, 'business-hours-rule', bundle.extendedData!.greeting, accessToken)
        }
    }

    const setNotifications = async (bundle: MessageOnlyDataBundle, token: string) => {
        if (bundle.extension.prettyType() !== 'Message-Only') return
        
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            if (bundle.extendedData?.notifications?.emailAddresses) {
                for (let i = 0; i < bundle.extendedData!.notifications!.emailAddresses.length; i++) {
                    bundle.extendedData!.notifications!.emailAddresses[i] = `${bundle.extendedData?.notifications?.emailAddresses[i]}${emailSuffix}`
                }
            }

            if (bundle.extendedData?.notifications?.voicemails.advancedEmailAddresses) {
                for (let i = 0; i < bundle.extendedData!.notifications!.voicemails.advancedEmailAddresses.length; i++) {
                    bundle.extendedData!.notifications!.voicemails.advancedEmailAddresses[i] = `${bundle.extendedData?.notifications?.voicemails.advancedEmailAddresses[i]}${emailSuffix}`
                }
            }

            if (bundle.extendedData?.notifications?.inboundFaxes.advancedEmailAddresses) {
                for (let i = 0; i < bundle.extendedData!.notifications!.inboundFaxes.advancedEmailAddresses.length; i++) {
                    bundle.extendedData!.notifications!.inboundFaxes.advancedEmailAddresses[i] = `${bundle.extendedData?.notifications?.inboundFaxes.advancedEmailAddresses[i]}${emailSuffix}`
                }
            }

            if (bundle.extendedData?.notifications?.missedCalls.advancedEmailAddresses) {
                for (let i = 0; i < bundle.extendedData!.notifications!.missedCalls.advancedEmailAddresses.length; i++) {
                    bundle.extendedData!.notifications!.missedCalls.advancedEmailAddresses[i] = `${bundle.extendedData?.notifications?.missedCalls.advancedEmailAddresses[i]}${emailSuffix}`
                }
            }

            if (bundle.extendedData?.notifications?.inboundTexts.advancedEmailAddresses) {
                for (let i = 0; i < bundle.extendedData!.notifications!.inboundTexts.advancedEmailAddresses.length; i++) {
                    bundle.extendedData!.notifications!.inboundTexts.advancedEmailAddresses[i] = `${bundle.extendedData?.notifications?.inboundTexts.advancedEmailAddresses[i]}${emailSuffix}`
                }
            }

            if (bundle.extendedData?.notifications?.outboundFaxes.advancedEmailAddresses) {
                for (let i = 0; i < bundle.extendedData!.notifications!.outboundFaxes.advancedEmailAddresses.length; i++) {
                    bundle.extendedData!.notifications!.outboundFaxes.advancedEmailAddresses[i] = `${bundle.extendedData?.notifications?.outboundFaxes.advancedEmailAddresses[i]}${emailSuffix}`
                }
            }

            fixNotifications(bundle)

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

    // Sometimes users have invalid (missing) advanced email addresses. This function will fix them
    const fixNotifications = (bundle: MessageOnlyDataBundle) => {
        let didFixEmails = false
        if (bundle.extendedData?.notifications?.advancedMode) {
            if (!bundle.extendedData.notifications.inboundFaxes.advancedEmailAddresses || bundle.extendedData.notifications.inboundFaxes.advancedEmailAddresses.length === 0) {
                bundle.extendedData.notifications.inboundFaxes.advancedEmailAddresses = [bundle.extension.data.contact.email]
                didFixEmails = true
            }
            if (!bundle.extendedData.notifications.inboundTexts.advancedEmailAddresses || bundle.extendedData.notifications.inboundTexts.advancedEmailAddresses.length === 0) {
                bundle.extendedData.notifications.inboundTexts.advancedEmailAddresses = [bundle.extension.data.contact.email]
                didFixEmails = true
            }
            if (!bundle.extendedData.notifications.missedCalls.advancedEmailAddresses || bundle.extendedData.notifications.missedCalls.advancedEmailAddresses.length === 0) {
                bundle.extendedData.notifications.missedCalls.advancedEmailAddresses = [bundle.extension.data.contact.email]
                didFixEmails = true
            }
            if (!bundle.extendedData.notifications.outboundFaxes.advancedEmailAddresses || bundle.extendedData.notifications.outboundFaxes.advancedEmailAddresses.length === 0) {
                bundle.extendedData.notifications.outboundFaxes.advancedEmailAddresses = [bundle.extension.data.contact.email]
                didFixEmails = true
            }
            if (!bundle.extendedData.notifications.voicemails.advancedEmailAddresses || bundle.extendedData.notifications.voicemails.advancedEmailAddresses.length === 0) {
                bundle.extendedData.notifications.voicemails.advancedEmailAddresses = [bundle.extension.data.contact.email]
                didFixEmails = true
            }
        }

        if (didFixEmails) {
            postMessage(new Message(`Fixed invalid advanced email addresses for ${bundle.extension.data.name} Ext. ${bundle.extension.data.extensionNumber}`, 'warning'))
        }

    }

    const setVoicemailRecipient = async (bundle: MessageOnlyDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        if (bundle.extension.prettyType() !== 'Message-Only') return
        
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${bundle.extendedData?.vmRecipientID}`)
            if (!originalExtension) {
                postMessage(new Message(`Failed to set voicemail recipient for ${bundle.extension.data.name}. Original ID not found`, 'warning'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set voicemail recipient', 'Original ID not found']))
            }

            const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension?.data.name && ext.prettyType() === originalExtension.prettyType())
            if (!newExtension) {
                postMessage(new Message(`Failed to set voicemail recipient for ${bundle.extension.data.name}. New ID not found`, 'warning'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set voicemail recipient', 'New ID not found']))
            }

            const body = {
                voicemail: {
                    recipient: {
                        id: newExtension?.data.id
                    }
                }
            }

            const response = await RestCentral.put(baseCallHandlingURL.replace('extensionId', `${bundle.extension.data.id}`).replace('ruleId', 'business-hours-rule'), headers, body)

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

    const setCustomGreeting = async (bundle: MessageOnlyDataBundle, ruleID: string, greeting: Greeting, token: string) => {
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

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {configureMO}
}

export default useConfigureMO