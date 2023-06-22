import { CallQueueManager } from "../../../../../models/CallQueueManager"
import { Extension } from "../../../../../models/Extension"
import { Greeting } from "../../../../../models/Greetings"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { CalledNumber, CallHandling, CustomRule } from "../../User Data Download/models/UserDataBundle"
import { CallQueueDataBundle, MemberPresenseStatus, QueueManager } from "../models/CallQueueDataBundle"

interface PickupMemberPayload {
    id: string
    configurePresenseLine: boolean
}

const useConfigureQueue = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseNotificationsSettingsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/ruleId'
    const baseCustomGreetingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/greeting'
    const baseScheduleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/business-hours'
    const baseMembersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId/bulk-assign'
    const baseManagersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId/permissions-bulk-assign'
    const baseOtherSettingsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId'
    const basePickupMemberURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId/pickup-members'
    const baseMemberStatusURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId/presence'
    const baseCustomRuleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule'
    const baseWaitingPeriod = 250

    const configureQueue = async (bundle: CallQueueDataBundle, originalExtensions: Extension[], targetExtensions: Extension[]) => {
        // Don't bother trying to configure the queue if it wasn't created
        if (bundle.hasEncounteredFatalError) return

        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await setSchedule(bundle, accessToken)
        await setMembers(bundle, originalExtensions, targetExtensions, accessToken)
        await setManagers(bundle, originalExtensions, targetExtensions, accessToken)
        await setNotifications(bundle, originalExtensions, targetExtensions, accessToken)
        await setOtherSettings(bundle, accessToken)
        await setPickupMembers(bundle, originalExtensions, targetExtensions, accessToken)
        await setMemberPresenseStatus(bundle, originalExtensions, targetExtensions, accessToken)

        for (let customRule of bundle.extendedData!.customRules!) {
            let adjsutedRule = adjustCustomRule(bundle, customRule, originalExtensions, targetExtensions)
            console.log('Adjusted custom rule')
            console.log(adjsutedRule)
            await addCustomRule(bundle, customRule, accessToken)
        }

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

        if (Object.keys(bundle.extendedData!.businessHours!.schedule).length !== 0) {
            const adjustedAfterHoursCallHandling = adjustCallHandling(bundle, bundle.extendedData!.afterHoursCallHandling!, originalExtensions, targetExtensions)
            if (adjustedAfterHoursCallHandling) {
                await setAfterHoursCallHandling(bundle, adjustedAfterHoursCallHandling, accessToken)
            }
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

    const setManagers = async (bundle: CallQueueDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const foundManagers: QueueManager[] = []
            for (let manager of bundle.extendedData!.managers!) {
                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${manager.extension.id}`)
                if (!originalExtension) {
                    postMessage(new Message(`${manager.extension.name} could not be set as a manager of queue ${bundle.extension.data.name} because its original ID could not be found`, 'warning'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set queue manager', `${manager.extension.name}`], undefined, manager))
                    continue
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
                if (!newExtension) {
                    postMessage(new Message(`${manager.extension.name} could not be set as a manager of queue ${bundle.extension.data.name} because its new ID could not be found`, 'warning'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set queue manager', `${manager.extension.name}`], undefined, manager))
                    continue
                }

                manager.extension.id = `${newExtension.data.id}`
                delete manager.extension.extensionNumber
                delete manager.extension.name
                delete manager.extension.site
                foundManagers.push(manager)
            }

            if (foundManagers.length === 0) return

            const payload: CallQueueManager[] = []
            for (const manager of foundManagers) {
                const queueManager: CallQueueManager = {
                    id: manager.extension.id,
                    permission: manager.permission
                }
                payload.push(queueManager)
            }

            const body = {
                updatedExtensions: payload
            }

            const response = await RestCentral.post(baseManagersURL.replace('groupId', `${bundle.extension.data.id}`), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set managers`)
            console.log(e)
            postMessage(new Message(`Failed to set managers for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set managers', ''], e.error ?? ''))
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
                delete bundle.extendedData.notifications.emailRecipients
            }

            if (bundle.extendedData?.notifications?.emailAddresses) {
                for (let i = 0; i < bundle.extendedData!.notifications!.emailAddresses.length; i++) {
                    bundle.extendedData!.notifications!.emailAddresses[i] = `${bundle.extendedData?.notifications?.emailAddresses[i]}.ps.ringcentral.com`
                }
            }

            if (bundle.extendedData?.notifications?.voicemails.advancedEmailAddresses) {
                for (let i = 0; i < bundle.extendedData!.notifications!.voicemails.advancedEmailAddresses.length; i++) {
                    bundle.extendedData!.notifications!.voicemails.advancedEmailAddresses[i] = `${bundle.extendedData?.notifications?.voicemails.advancedEmailAddresses[i]}.ps.ringcentral.com`
                }
            }

            if (bundle.extendedData?.notifications?.inboundFaxes.advancedEmailAddresses) {
                for (let i = 0; i < bundle.extendedData!.notifications!.inboundFaxes.advancedEmailAddresses.length; i++) {
                    bundle.extendedData!.notifications!.inboundFaxes.advancedEmailAddresses[i] = `${bundle.extendedData?.notifications?.inboundFaxes.advancedEmailAddresses[i]}.ps.ringcentral.com`
                }
            }

            if (bundle.extendedData?.notifications?.missedCalls.advancedEmailAddresses) {
                for (let i = 0; i < bundle.extendedData!.notifications!.missedCalls.advancedEmailAddresses.length; i++) {
                    bundle.extendedData!.notifications!.missedCalls.advancedEmailAddresses[i] = `${bundle.extendedData?.notifications?.missedCalls.advancedEmailAddresses[i]}.ps.ringcentral.com`
                }
            }

            if (bundle.extendedData?.notifications?.inboundTexts.advancedEmailAddresses) {
                for (let i = 0; i < bundle.extendedData!.notifications!.inboundTexts.advancedEmailAddresses.length; i++) {
                    bundle.extendedData!.notifications!.inboundTexts.advancedEmailAddresses[i] = `${bundle.extendedData?.notifications?.inboundTexts.advancedEmailAddresses[i]}.ps.ringcentral.com`
                }
            }

            if (bundle.extendedData?.notifications?.outboundFaxes.advancedEmailAddresses) {
                for (let i = 0; i < bundle.extendedData!.notifications!.outboundFaxes.advancedEmailAddresses.length; i++) {
                    bundle.extendedData!.notifications!.outboundFaxes.advancedEmailAddresses[i] = `${bundle.extendedData?.notifications?.outboundFaxes.advancedEmailAddresses[i]}.ps.ringcentral.com`
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
            const nonCustomGreetings = callHandling.greetings.filter((greeting) => !greeting.custom)
            callHandling.greetings = nonCustomGreetings
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

    const setAfterHoursCallHandling = async (bundle: CallQueueDataBundle, callHandling: CallHandling, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const nonCustomGreetings = callHandling.greetings.filter((greeting) => !greeting.custom)
            callHandling.greetings = nonCustomGreetings
            const response = await RestCentral.put(baseCallHandlingURL.replace('extensionId', `${bundle.extension.data.id}`).replace('ruleId', 'after-hours-rule'), headers, callHandling)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set after hours call handling`)
            console.log(e)
            postMessage(new Message(`Failed to set after hours call handling for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set after hours call handling', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setOtherSettings = async (bundle: CallQueueDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.put(baseOtherSettingsURL.replace('groupId', `${bundle.extension.data.id}`), headers, bundle.extendedData?.otherSettings)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set editable member status`)
            console.log(e)
            postMessage(new Message(`Failed to set editable member status ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set editable member status', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setPickupMembers = async (bundle: CallQueueDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        if (!bundle.extendedData?.pickupMembers || bundle.extendedData.pickupMembers.length === 0) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const foundPickupMembers: PickupMemberPayload[] = []
            for (const member of bundle.extendedData!.pickupMembers!) {
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

                const payload: PickupMemberPayload = {
                    id: `${newExtension.data.id}`,
                    configurePresenseLine: true
                }

                foundPickupMembers.push(payload)
            }

            const body = {
                addedMembers: foundPickupMembers
            }

            const response = await RestCentral.post(basePickupMemberURL.replace('groupId', `${bundle.extension.data.id}`), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set queue pickup members`)
            console.log(e)
            postMessage(new Message(`Failed to set pickup members ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set pickup members', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setMemberPresenseStatus = async (bundle: CallQueueDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const foundMembers: MemberPresenseStatus[] = []
            for (const member of bundle.extendedData!.memberPresense!) {
                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${member.member.id}`)
                if (!originalExtension) {
                    postMessage(new Message(`Could not set queue status for ${member.member.name} on queue ${bundle.extension.data.name} because the original ID could not be found`, 'warning'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Could not set queue member status', `${member.member.name}`]))
                    continue
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension?.data.name && `${ext.data.extensionNumber}` === `${originalExtension.data.extensionNumber}`)
                if (!newExtension) {
                    postMessage(new Message(`Could not set queue status for ${member.member.name} on queue ${bundle.extension.data.name} because the new ID could not be found`, 'warning'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Could not set queue member status', `${member.member.name}`]))
                    continue
                }

                let foundMember = {...member}
                foundMember.member.id = `${newExtension.data.id}`
                delete foundMember.member.name
                delete foundMember.member.site
                delete foundMember.member.extensionNumber
                delete foundMember.acceptQueueCalls
                foundMembers.push(foundMember)
            }

            // Member presence is not enabled for every account. Check to see if members have acceptCurrentQueueCalls propery.
            // If not, skip this step
            if (foundMembers.filter((member) => member.acceptCurrentQueueCalls !== undefined).length === 0) return

            const body = {
                records: foundMembers
            }

            const response = await RestCentral.put(baseMemberStatusURL.replace('groupId', `${bundle.extension.data.id}`), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set member status`)
            console.log(e)
            postMessage(new Message(`Failed to set member statuses for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set member status', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    // This should probably be split into multiple functions
    const adjustCallHandling = (bundle: CallQueueDataBundle, callHandling: CallHandling, originalExtensions: Extension[], targetExtensions: Extension[]) => {

        if (callHandling.callHandlingAction === 'TransferToExtension' || callHandling.callHandlingAction === 'PlayAnnouncementOnly' || callHandling.callHandlingAction === 'UnconditionalForwarding') delete callHandling.voicemail

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
            const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${callHandling.voicemail?.recipient.id}`)
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

    const addCustomRule = async (bundle: CallQueueDataBundle, customRule: CustomRule, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.post(baseCustomRuleURL.replace('extensionId', `${bundle.extension.data.id}`), headers, customRule)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to add custom rule`)
            console.log(e)
            postMessage(new Message(`Failed to add custom rule ${customRule.name} on ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to add custom rule', customRule.name], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const adjustCustomRule = (bundle: CallQueueDataBundle, customRule: CustomRule, originalExtensions: Extension[], targetExtensions: Extension[]) => {
        try {
            delete customRule.id
            delete customRule.uri
            delete customRule.queue

            if (customRule.calledNumbers && customRule.calledNumbers.length !== 0) {
                const goodNumbers: CalledNumber[] = []
                for (const number of customRule.calledNumbers) {
                    const tempNumber = bundle.phoneNumberMap?.get(number.phoneNumber)
                    if (!tempNumber) {
                        postMessage(new Message(`Failed to find temp number for called number ${number.phoneNumber} on custom rule ${customRule.name} on queue ${bundle.extension.data.name}`, 'warning'))
                        postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to find temp number for custom rule', number.phoneNumber]))
                        continue
                    }

                    goodNumbers.push({phoneNumber: tempNumber})
                }
                customRule.calledNumbers = goodNumbers
            }

            if (customRule.callHandlingAction === 'TakeMessagesOnly') {

                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === customRule.voicemail?.recipient.id)
                if (!originalExtension) {
                    postMessage(new Message(`Failed to adjust voicemail recipient for custom rule ${customRule.name} on queue ${bundle.extension.data.name}`, 'error'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to adjust custom rule', customRule.name]))
                    return customRule
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
                if (!newExtension) {
                    postMessage(new Message(`Failed to adjust voicemail recipient for custom rule ${customRule.name} on queue ${bundle.extension.data.name}`, 'error'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to adjust custom rule', customRule.name]))
                    return customRule
                }

                customRule.voicemail!.recipient.id = `${newExtension.data.id}`
                delete customRule.forwarding
                delete customRule.greetings
                delete customRule.unconditionalForwarding
                delete customRule.uri
                delete customRule.transfer

                return customRule
            }
            else if (customRule.callHandlingAction === 'TransferToExtension' || customRule.callHandlingAction === 'Bypass') {

                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${customRule.transfer?.extension.id}`)
                if (!originalExtension) {
                    postMessage(new Message(`Failed to adjust transfer extension for custom rule ${customRule.name} on queue ${bundle.extension.data.name}`, 'error'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to adjust custom rule', customRule.name]))
                    return customRule
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
                if (!newExtension) {
                    postMessage(new Message(`Failed to adjust transfer extension for custom rule ${customRule.name} on queue ${bundle.extension.data.name}`, 'error'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to adjust custom rule', customRule.name]))
                    return customRule
                }

                customRule.transfer!.extension.id = `${newExtension.data.id}`
                delete customRule.forwarding
                delete customRule.greetings
                delete customRule.unconditionalForwarding
                delete customRule.uri
                delete customRule.voicemail

                return customRule
            }

            else if (customRule.callHandlingAction === 'PlayAnnouncementOnly') {
                delete customRule.forwarding
                delete customRule.greetings
                delete customRule.unconditionalForwarding
                delete customRule.uri
                delete customRule.voicemail

                return customRule
            }
            else if (customRule.callHandlingAction === 'UnconditionalForwarding') {
                delete customRule.forwarding
                delete customRule.greetings
                delete customRule.uri
                delete customRule.voicemail
                delete customRule.transfer

                return customRule
            }
        } 
        catch (e) {
            postMessage(new Message(`Failed to adjust custom rule ${customRule.name} on queue ${bundle.extension.data.name}`, 'error'))
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {configureQueue}
}

export default useConfigureQueue