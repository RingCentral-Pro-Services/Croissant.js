import { wait } from "../../../../../helpers/rcapi"
import { Greeting } from "../../../../../models/Greetings"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { CallHandling, Device, Notifications, PhoneNumber } from "../../../Migration/User Data Download/models/UserDataBundle"
import { ConvertSettings } from "../ConvertCallQueues"
import { RingGroup } from "../models/RingGroup"
import { StandardGreeting } from "./useStandardGreetings"

const translateMissedCallAction = (action: string) => {
    switch (action) {
        case 'TransferToExtension':
            return 'ConnectToExtension'
        case 'UnconditionalForwarding':
            return 'ConnectToExternalNumber'
        case 'PlayAnnouncementOnly':
            return 'PlayAnnouncementOnly'
        default:
            return 'TakeMessagesOnly'
    }
}

export const useCreateRingGroup = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseCreateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const baseForwardingNumberURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/forwarding-number'
    const baseBusinessHoursURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/business-hours'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/ruleId'
    const baseCustomGreetingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/greeting'
    const baseNotificationsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'
    const basePhoneNumberURL = 'https://platform.ringcentral.com/restapi/v2/accounts/~/phone-numbers/phoneNumberId'
    const baseWaitingPeriod = 250

    const createRingGroup = async (group: RingGroup, queueGreetings: StandardGreeting[], userGreetings: StandardGreeting[], settings: ConvertSettings) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        if (settings.deleteOldExtension) {
            await deleteOldExtension(group, accessToken)
        }
        await createExtension(group, settings, accessToken)
        await setBusinessHours(group, accessToken)
        await setGreetings(group, queueGreetings, userGreetings, accessToken)
        await setNoAnswerCallHandling(group, accessToken)
        await addDeviceForwardng(group, accessToken)
        await setAfterHoursCallHandling(group, accessToken)
        await setNotificationSettings(group, accessToken)

        if (group.businessHoursCallHandling?.queue?.transferMode === 'Rotating' || group.businessHoursCallHandling?.queue?.transferMode === 'FixedOrder') {
            await setRingMode(group, accessToken)
        }

        if (settings.reassignPhoneNumber) {
            await assignPhoneNumbers(group, accessToken)
        }
    }

    const deleteOldExtension = async (group: RingGroup, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.delete(`${baseCreateURL}/${group.originalExtensionId}`, headers)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            postMessage(new Message(`Failed to set delete original call queue ${group.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to detele original call queue', group.name], e.error ?? ''))            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const createExtension = async (group: RingGroup, settings: ConvertSettings, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                contact: {
                    firstName: group.name,
                    lastName: 'Ring Group',
                    email: settings.deleteOldExtension ? group.email : `${group.email}.ps.ringcentral.com`,
                },
                ...(settings.deleteOldExtension && {extensionNumber: group.extensionNumber}),
                type: group.type,
                status: 'NotActivated',
                regionalSettings: group.regionalSettings,
                subType: group.subType,
                site: group.site,
            }

            const response = await RestCentral.post(baseCreateURL, headers, body)
            group.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            group.hasFatalError = true
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            postMessage(new Message(`Failed to create ring group ${group.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to create ring group', group.name], e.error ?? '', group))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setBusinessHours = async (group: RingGroup, token: string) => {
        if (group.hasFatalError || !group.id) {
            return
        }

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.put(baseBusinessHoursURL.replace('extensionId', group.id), headers, group.businessHours)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            postMessage(new Message(`Failed to set business hours for ring group ${group.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to set business hours', group.name], e.error ?? '', group))            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const getCallHandling = async (group: RingGroup, token: string) => {
        if (group.hasFatalError || !group.id) {
            return
        }

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.get(baseCallHandlingURL.replace('ruleId', 'business-hours-rule').replace('extensionId', group.id), headers)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return response.data as CallHandling
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            postMessage(new Message(`Failed to get call handling for ring group ${group.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to get call handling', group.name], e.error ?? '', group))            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setRingMode = async (group: RingGroup, token: string) => {
        if (group.hasFatalError || !group.id) {
            return
        }

        const currentCallHandling = await getCallHandling(group, token)
        if (!currentCallHandling || !currentCallHandling.forwarding || !group.businessHoursCallHandling?.queue?.agentTimeout) {
            return
        }

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const forwarding = currentCallHandling.forwarding
            forwarding.notifyMySoftPhones = false
            forwarding.ringingMode = 'Sequentially'

            for (let i = 0; i < forwarding.rules.length; i++) {
                forwarding.rules[i].ringCount = group.businessHoursCallHandling?.queue?.agentTimeout / 5
            }

            const body = {
                forwarding: forwarding
            }

            const response = await RestCentral.put(baseCallHandlingURL.replace('ruleId', 'business-hours-rule').replace('extensionId', group.id), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            postMessage(new Message(`Failed to set business hours for ring group ${group.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to set business hours', group.name], e.error ?? '', group))            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setNoAnswerCallHandling = async (group: RingGroup, token: string) => {
        if (group.hasFatalError || !group.id) {
            return
        }

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const rawAction = group.businessHoursCallHandling?.queue?.holdTimeExpirationAction ?? ''
            const missedCallAction = translateMissedCallAction(rawAction)

            if (missedCallAction === 'TakeMessagesOnly') {
                console.log('Voicemail. Skipping')
                return
            }

            
            let transferDestination = ''
            if (missedCallAction === 'ConnectToExtension') {
                transferDestination = group.businessHoursCallHandling?.queue?.transfer?.find((t) => t.action === 'HoldTimeExpiration')?.extension?.id ?? ''
            }
            else if (missedCallAction === 'ConnectToExternalNumber') {
                transferDestination = group.businessHoursCallHandling?.queue?.unconditionalForwarding?.find((t) => t.action === 'HoldTimeExpiration')?.phoneNumber ?? ''
            }

            const body = {
                voicemail: {
                    enabled: false
                },
                missedCall: {
                    actionType: translateMissedCallAction(group.businessHoursCallHandling?.queue?.holdTimeExpirationAction ?? ''),
                    ... (missedCallAction === 'ConnectToExtension' && { extension: { id: transferDestination } }),
                    ...(missedCallAction === 'ConnectToExternalNumber' && { externalNumber: { phoneNumber: transferDestination } })
                }
            }

            const response = await RestCentral.put(baseCallHandlingURL.replace('ruleId', 'business-hours-rule').replace('extensionId', group.id), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            postMessage(new Message(`Failed to set missed call action for ring group ${group.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to set missed call action', group.name], e.error ?? '', group))            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setAfterHoursCallHandling = async (group: RingGroup, token: string) => {
        if (group.hasFatalError || !group.id || !group.afterHoursCallHandling) {
            console.log('No after hours call handling')
            return
        }

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const rawAction = group.afterHoursCallHandling.callHandlingAction ?? ''
            const missedCallAction = translateMissedCallAction(rawAction)

            if (missedCallAction === 'TakeMessagesOnly') {
                console.log('Voicemail. Skipping')
                return
            }

            let transferDestination = ''
            if (missedCallAction === 'ConnectToExtension') {
                transferDestination = group.afterHoursCallHandling?.queue?.transfer?.find((t) => t.action === 'HoldTimeExpiration')?.extension?.id ?? ''
            }
            else if (rawAction === 'UnconditionalForwarding') {
                transferDestination = group.afterHoursCallHandling?.unconditionalForwarding?.phoneNumber ?? ''
            }

            const body = {
                callHandlingAction: rawAction,
                ...(missedCallAction === 'ConnectToExternalNumber' && { 'unconditionalForwarding': { 'phoneNumber': transferDestination } }),
                ...(missedCallAction === 'ConnectToExtension' && { 'transfer': { 'extension': {'id': transferDestination } } }),
            }

            const response = await RestCentral.put(baseCallHandlingURL.replace('ruleId', 'after-hours-rule').replace('extensionId', group.id), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            postMessage(new Message(`Failed to set after hours call handling for ring group ${group.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to set after hours call handling', group.name], e.error ?? '', group))            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setGreetings = async (group: RingGroup, queueGreetings: StandardGreeting[], userGreetings: StandardGreeting[], token: string) => {
        try {
            const customGreetings = await setNonCustomGreetings(group, queueGreetings, userGreetings, token)
            if (!customGreetings) {
                return
            }
            for (let i = 0; i < customGreetings.length; i++) {
                await setCustomGreeting(group, 'business-hours-rule', customGreetings[i], token)
            }
        }
        catch (e) {
            console.log(`Failed to set greetings`)
        }
    }

    const setNonCustomGreetings = async (group: RingGroup, queueGreetings: StandardGreeting[], userGreetings: StandardGreeting[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const greetings = group.businessHoursCallHandling?.greetings

            if (!greetings) {
                return
            }

            const nonCustomGreetings = greetings?.filter((greeting) => greeting.preset && greeting.type !== 'InterruptPrompt')
            const customGreetings = greetings?.filter((greeting) => !greeting.preset)

            for (let i = 0; i < nonCustomGreetings?.length; i++) {
                const userCounterpart = userGreetings.find((greeting) => greeting.name === nonCustomGreetings[i].preset?.name && greeting.type === nonCustomGreetings[i].type)
                if (!userCounterpart) {
                    continue
                }
                nonCustomGreetings[i].preset.id = userCounterpart.id
            }

            const body = {
                greetings: nonCustomGreetings
            }

            const response = await RestCentral.put(baseCallHandlingURL.replace('extensionId', `${group.id}`).replace('ruleId', 'business-hours-rule'), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return customGreetings
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set business hours greetings`)
            console.log(e)
            postMessage(new Message(`Failed to set business hours greetings for ${group.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(group.name, parseInt(group.extensionNumber), ['Failed to set business hours greetings', ''], e.error ?? '', group))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setCustomGreeting = async (group: RingGroup, ruleID: string, greeting: Greeting, token: string) => {
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

            const response = await RestCentral.post(baseCustomGreetingURL.replace('extensionId', `${group.id}`), headers, formData)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set custom ${greeting.type} greeting`)
            console.log(e)
            postMessage(new Message(`Failed to set custom ${greeting.type} greeting for ${group.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(group.name, parseInt(group.extensionNumber), ['Failed to set custom greeting', ''], e.error ?? '', greeting))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setNotificationSettings = async (group: RingGroup, token: string) => {
        if (group.hasFatalError || !group.id || !group.notificationSettings) {
            return
        }

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const settings: Partial<Notifications> = group.notificationSettings
            if (settings.emailRecipients) {
                const emailAddresses = settings.emailRecipients.filter((recipient) => recipient.emailAddresses).map((recipient) => recipient.emailAddresses) ?? []
                if (emailAddresses) {
                    settings.emailAddresses = emailAddresses.flat()
                }
                delete settings.emailRecipients
            }

            const response = await RestCentral.put(baseNotificationsURL.replace('extensionId', group.id), headers, group.notificationSettings)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            postMessage(new Message(`Failed to set notification settings for ring group ${group.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to set notification settings', group.name], e.error ?? '', group))            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const assignPhoneNumbers = async (group: RingGroup, token: string) => {
        if (group.hasFatalError || !group.id) {
            return
        }

        for (const phoneNumber of group.directNumbers ?? []) {
            await assignPhoneNumbersToGroup(group, phoneNumber, token)
        }
    }

    const assignPhoneNumbersToGroup = async (group: RingGroup, phoneNumber: PhoneNumber, token: string) => {
        if (group.hasFatalError || !group.id) {
            return
        }

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                usageType: 'DirectNumber',
                extension: {
                    id: group.id
                }
            }

            const response = await RestCentral.patch(basePhoneNumberURL.replace('phoneNumberId', phoneNumber.id), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            postMessage(new Message(`Failed to reassign phone number ${phoneNumber.phoneNumber} to ring group ${group.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to reassign phone number', phoneNumber.phoneNumber], e.error ?? '', phoneNumber))            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const addDeviceForwardng = async (group: RingGroup, token: string) => {
        if (group.hasFatalError || !group.id) {
            return
        }

        for (let i = 0; i < group.devices.length; i++) {
            await addForwardingDevice(group, group.devices[i], i + 1, token)
        }
    }

    const addForwardingDevice = async (group: RingGroup, device: Device, flipNumber: number, token: string) => {
        if (group.hasFatalError || !group.id) {
            return
        }

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                flipNumber: flipNumber,
                label: `Ext. ${device.extension?.extensionNumber}`,
                type: 'PhoneLine',
                device: {
                    id: device.id
                }
            }

            const response = await RestCentral.post(baseForwardingNumberURL.replace('extensionId', group.id), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            postMessage(new Message(`Failed to add forwarding device ${device.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to add forwarding device', device.name], e.error ?? '', group))            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return { createRingGroup }
}