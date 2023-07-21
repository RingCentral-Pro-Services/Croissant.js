import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { PERL, PhoneNumber, Role, UserDataBundle } from "../models/UserDataBundle"
const FileSaver = require('file-saver');

const useFetchUserData = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, callback: () => void) => {
    const baseDataURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'
    const baseDevicesURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/device'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/ruleId?showInactiveNumbers=true'
    const baseNotificationsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'
    const baseCallerIDURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/caller-id'
    const baseBlockedCallsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/caller-blocking'
    const blockedPhoneNumbersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/caller-blocking/phone-numbers?status=Blocked'
    const basePresenseLineURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/presence/line'
    const basePresenseSettingsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/presence'
    const basePresenseAllowedUsersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/presence/permission'
    const baseIntercomURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/intercom'
    const baseIntercomUsersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/intercom/permissions'
    const baseDelegatesURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/delegates'
    const basePERLURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/emergency-locations?perPage=1000'
    const baseRoleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/assigned-role'
    const baseIncommingCallInfoURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/incoming-call-info'
    const baseBusinessHoursURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/business-hours'
    const basePhoneNumbersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/phone-number?usageType=DirectNumber&perPage=1000'
    const baseForwardAllCallsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/forward-all-calls'
    const basePMIURL = 'https://platform.ringcentral.com/rcvideo/v2/account/~/extension/extensionId/bridges/default'
    const baseCustomGreetingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/greeting/greetingId'
    const baseCustomRulesURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule?perPage=1000&type=Custom&view=Detailed'
    const baseWaitingPeriod = 250

    const fetchUserData = async (userDataBundle: UserDataBundle, extensions: Extension[], shouldFetchDelegates: boolean = true) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await fetchBaseData(userDataBundle, accessToken)
        await fetchDevices(userDataBundle, accessToken)
        await fetchBusinessHours(userDataBundle, accessToken)
        await fetchBusinessHoursCallHandling(userDataBundle, extensions, accessToken)
        await fetchAfterHoursCallHandling(userDataBundle, extensions, accessToken)
        await fetchNotificationSettings(userDataBundle, accessToken)
        await fetchCallerID(userDataBundle, accessToken)
        await fetchBlockedCallSettings(userDataBundle, accessToken)
        await fetchBlockedPhoneNumbers(userDataBundle, accessToken)
        await fetchPresenseLines(userDataBundle, extensions, accessToken)
        await fetchPresenseSettings(userDataBundle, accessToken)
        await fetchPresenseAllowedUsers(userDataBundle, extensions, accessToken)
        await fetchIntercomStatus(userDataBundle, accessToken)
        await fetchIntercomUsers(userDataBundle, accessToken)
        if (shouldFetchDelegates) {
            await fetchDelegates(userDataBundle, accessToken)
        }
        await fetchPERLs(userDataBundle, accessToken)
        await fetchRoles(userDataBundle, accessToken)
        await fetchIncommingCallInfo(userDataBundle, accessToken)
        await fetchDirectNumbers(userDataBundle, accessToken)
        await fetchForwardAllCalls(userDataBundle, accessToken)
        await fetchPMI(userDataBundle, accessToken)
        await fetchCustomRules(userDataBundle, accessToken)

        for (let i = 0; i < userDataBundle.extendedData!.businessHoursCallHandling!.greetings.length; i++) {
            if (userDataBundle.extendedData?.businessHoursCallHandling?.greetings[i].custom) {
                const url = await getCustomGreetingURL(userDataBundle, userDataBundle.extendedData.businessHoursCallHandling.greetings[i].custom!.id, accessToken)
                if (!url) continue
                const data = await getCustomGreetingData(userDataBundle, url![0], accessToken)
                if (!data) continue
                userDataBundle.extendedData.businessHoursCallHandling.greetings[i].custom!.data = data
                userDataBundle.extendedData.businessHoursCallHandling.greetings[i].custom!.contentType = url![1]
            }
        }

        if (userDataBundle.extendedData?.afterHoursCallHandling) {
            for (let i = 0; i < userDataBundle.extendedData!.afterHoursCallHandling!.greetings.length; i++) {
                if (userDataBundle.extendedData?.afterHoursCallHandling?.greetings[i].custom) {
                    const url = await getCustomGreetingURL(userDataBundle, userDataBundle.extendedData.afterHoursCallHandling.greetings[i].custom!.id, accessToken)
                    if (!url) continue
                    const data = await getCustomGreetingData(userDataBundle, url![0], accessToken)
                    if (!data) continue
                    userDataBundle.extendedData.afterHoursCallHandling.greetings[i].custom!.data = data
                    userDataBundle.extendedData.afterHoursCallHandling.greetings[i].custom!.contentType = url![1]
                }
            }
        }
        callback()
    }

    const fetchBaseData = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseDataURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extension = new Extension(response.data)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get base data`)
            console.log(e)
            postMessage(new Message(`Failed to get base data for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch base data', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchDevices = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseDevicesURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData = {
                devices: response.data.records
            }

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get devices`)
            console.log(e)
            postMessage(new Message(`Failed to get devices for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch devices', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchBusinessHoursCallHandling = async (userDataBundle: UserDataBundle, extensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCallHandlingURL.replace('extensionId', `${userDataBundle.extension.data.id}`).replace('ruleId', 'business-hours-rule'), headers)
            userDataBundle.extendedData!.businessHoursCallHandling = response.data

            if (userDataBundle.extendedData?.businessHoursCallHandling?.missedCall && userDataBundle.extendedData.businessHoursCallHandling.missedCall.actionType === 'ConnectToExtension') {
                const extensionID = userDataBundle.extendedData.businessHoursCallHandling.missedCall.extension.id
                const extension = extensions.find((ext) => `${ext.data.id}` === `${extensionID}`)
                if (extension) {
                    userDataBundle.extendedData.businessHoursCallHandling.missedCall.extension.id = `${extension.data.name} - ${extension.data.extensionNumber}`
                }
            }

            if (userDataBundle.extendedData?.businessHoursCallHandling?.voicemail) {
                const extensionID = userDataBundle.extendedData.businessHoursCallHandling.voicemail.recipient.id
                const extension = extensions.find((ext) => `${ext.data.id}` === `${extensionID}`)
                if (extension) {
                    userDataBundle.extendedData.businessHoursCallHandling.voicemail.recipient.displayName = `${extension.data.name} - ${extension.data.extensionNumber}`
                }
            }

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get business hours call handling`)
            console.log(e)
            postMessage(new Message(`Failed to get business hours call handling for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch business hours call handling', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchAfterHoursCallHandling = async (userDataBundle: UserDataBundle, extensions: Extension[], token: string) => {
        if (Object.keys(userDataBundle.extendedData!.businessHours!.schedule).length === 0) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCallHandlingURL.replace('extensionId', `${userDataBundle.extension.data.id}`).replace('ruleId', 'after-hours-rule'), headers)
            userDataBundle.extendedData!.afterHoursCallHandling = response.data

            if (userDataBundle.extendedData?.afterHoursCallHandling?.missedCall && userDataBundle.extendedData.afterHoursCallHandling.missedCall.actionType === 'ConnectToExtension') {
                const extensionID = userDataBundle.extendedData.afterHoursCallHandling.missedCall.extension.id
                const extension = extensions.find((ext) => `${ext.data.id}` === `${extensionID}`)
                if (extension) {
                    userDataBundle.extendedData.afterHoursCallHandling.missedCall.extension.displayName = `${extension.data.name} - ${extension.data.extensionNumber}`
                }
            }

            if (userDataBundle.extendedData?.afterHoursCallHandling?.voicemail) {
                const extensionID = userDataBundle.extendedData.afterHoursCallHandling.voicemail.recipient.id
                const extension = extensions.find((ext) => `${ext.data.id}` === `${extensionID}`)
                if (extension) {
                    userDataBundle.extendedData.afterHoursCallHandling.voicemail.recipient.displayName = `${extension.data.name} - ${extension.data.extensionNumber}`
                }
            }

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get after hours call handling`)
            console.log(e)
            postMessage(new Message(`Failed to get after hours call handling for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch after hours call handling', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchNotificationSettings = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseNotificationsURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.notifications = response.data

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get notification settings`)
            console.log(e)
            postMessage(new Message(`Failed to get notification settings for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch notification settings', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchCallerID = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCallerIDURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.callerID = response.data

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get caller id settings`)
            console.log(e)
            postMessage(new Message(`Failed to get Caller ID settings for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch Caller ID settings', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchBlockedCallSettings = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseBlockedCallsURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.blockedCallSettings = response.data

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get blocked call settings`)
            console.log(e)
            postMessage(new Message(`Failed to get blocked call settings for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch blocked call settings', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchBlockedPhoneNumbers = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(blockedPhoneNumbersURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.blockedPhoneNumbers = response.data.records

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get blocked phone numbers`)
            console.log(e)
            postMessage(new Message(`Failed to get blocked phone numbers for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch blocked phone numbers', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchPresenseLines = async (userDataBundle: UserDataBundle, extensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(basePresenseLineURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.presenseLines = response.data.records

            for (let i = 0; i < userDataBundle.extendedData!.presenseLines!.length; i++) {
                const extensionID = userDataBundle.extendedData!.presenseLines![i].extension.id
                const extension = extensions.find((ext) => `${ext.data.id}` === `${extensionID}`)
                if (!extension) continue
                userDataBundle.extendedData!.presenseLines![i].extension.extensionName = extension.data.name
            }

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get presense lines`)
            console.log(e)
            postMessage(new Message(`Failed to get presense lines for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch presense lines', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchPresenseSettings = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(basePresenseSettingsURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.presenseSettings = response.data

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get presense settings`)
            console.log(e)
            postMessage(new Message(`Failed to get presense settings for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch presense settings', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchPresenseAllowedUsers = async (userDataBundle: UserDataBundle, extensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(basePresenseAllowedUsersURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.presenseAllowedUsers = response.data.records

            for (let i = 0; i < userDataBundle.extendedData!.presenseAllowedUsers!.length; i++) {
                const extensionID = userDataBundle.extendedData!.presenseAllowedUsers![i].id
                const extension = extensions.find((ext) => `${ext.data.id}` === `${extensionID}`)
                if (!extension) continue
                userDataBundle.extendedData!.presenseAllowedUsers![i].extensionName = extension.data.name
            }

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get presense permissions`)
            console.log(e)
            postMessage(new Message(`Failed to get presense permissions for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch presense permissions', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchIntercomStatus = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseIntercomURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.intercomStatus = response.data

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get intercom status`)
            console.log(e)
            postMessage(new Message(`Failed to get intercom status for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch intercom status', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchIntercomUsers = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseIntercomUsersURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.intercomUsers = response.data.extensions || []

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get intercom users`)
            console.log(e)
            postMessage(new Message(`Failed to get intercom allowed users for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch intercom allowed users', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchDelegates = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseDelegatesURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.delegates = response.data.records

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            // postMessage(new Message(`Failed to get delegates for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            // postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch delegates', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchPERLs = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(basePERLURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            const responseLocations = response.data.records as PERL[]
            const personalResponseLocations = responseLocations.filter((erl) => erl.visibility === 'Private')
            userDataBundle.extendedData!.pERLs = personalResponseLocations
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get PERLs`)
            console.log(e)
            postMessage(new Message(`Failed to get PERLs for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch PERLs', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchRoles = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseRoleURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            const roles = response.data.records as Role[]
            userDataBundle.extendedData!.roles = roles
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get role`)
            console.log(e)
            postMessage(new Message(`Failed to get role for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch role', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchIncommingCallInfo = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseIncommingCallInfoURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.incommingCallInfo = response.data
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get incomming call info`)
            console.log(e)
            postMessage(new Message(`Failed to get incomming call info for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch incomming call info', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchBusinessHours = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseBusinessHoursURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.businessHours = response.data
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get business hours`)
            console.log(e)
            postMessage(new Message(`Failed to get business hours for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch business hours', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchDirectNumbers = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(basePhoneNumbersURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            const numbers = response.data.records as PhoneNumber[]
            const deviceNumbers = userDataBundle.extendedData!.devices.map((device) => device.phoneLines && device.phoneLines.length !== 0 && device.phoneLines[0].phoneInfo.phoneNumber)
            const nonDeviceNumbers = numbers.filter((number) => !deviceNumbers.includes(number.phoneNumber))
            const directNumbers = nonDeviceNumbers.filter((number) => !number.extension)

            userDataBundle.extendedData!.directNumbers = directNumbers
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get direct numbers`)
            console.log(e)
            postMessage(new Message(`Failed to get direct numbers for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch direct numbers', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchForwardAllCalls = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseForwardAllCallsURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.forwardAllCalls = response.data
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get forward all calls settings`)
            console.log(e)
            postMessage(new Message(`Failed to get forward all calls settings for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch forward all calls settings', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchPMI = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(basePMIURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.defaultBridge = response.data

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get PMI`)
            console.log(e)
            // postMessage(new Message(`Failed to get PMI for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            // postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch PMI', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const getCustomGreetingURL = async (bundle: UserDataBundle, greetingID: string, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCustomGreetingURL.replace('extensionId', `${bundle.extension.data.id}`).replace('greetingId', greetingID), headers)
            

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
            postMessage(new Message(`Failed to get custom greeting URL for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to get custom greeting URL', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const getCustomGreetingData = async (bundle: UserDataBundle, url: string, token: string) => {
        try {
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            // const response = await RestCentral.get(url, headers)
            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            // const blob = new Blob([response.data])
            const buffer = await res.arrayBuffer()

            // if (response.rateLimitInterval > 0) {
            //     postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            // }
            
            // response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return buffer
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get custom greeting URL`)
            console.log(e)
            postMessage(new Message(`Failed to get custom greeting URL for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to get custom greeting URL', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchCustomRules = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCustomRulesURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData!.customRules = response.data.records

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get custom rules`)
            console.log(e)
            postMessage(new Message(`Failed to get custom rules for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch custom rules', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {fetchUserData}
}

export default useFetchUserData