import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { UserDataBundle } from "../models/UserDataBundle"

const useFetchUserData = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, callback: () => void) => {
    const baseDataURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'
    const baseDevicesURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/device'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/ruleId'
    const baseNotificationsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'
    const baseCallerIDURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/caller-id'
    const baseBlockedCallsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/caller-blocking'
    const blockedPhoneNumbersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/caller-blocking/phone-numbers?status=Blocked'
    const basePresenseLineURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/presence/line'
    const basePresenseSettingsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/presence'
    const basePresenseAllowedUsersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/presence/permission'
    const baseIntercomURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/intercom'
    const baseDelegatesURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/delegates'
    const baseWaitingPeriod = 250

    const fetchUserData = async (userDataBundle: UserDataBundle, extensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await fetchBaseData(userDataBundle, accessToken)
        await fetchDevices(userDataBundle, accessToken)
        await fetchBusinessHoursCallHandling(userDataBundle, accessToken)
        await fetchAfterHoursCallHandling(userDataBundle, accessToken)
        await fetchNotificationSettings(userDataBundle, accessToken)
        await fetchCallerID(userDataBundle, accessToken)
        await fetchBlockedCallSettings(userDataBundle, accessToken)
        await fetchBlockedPhoneNumbers(userDataBundle, accessToken)
        await fetchPresenseLines(userDataBundle, extensions, accessToken)
        await fetchPresenseSettings(userDataBundle, accessToken)
        await fetchPresenseAllowedUsers(userDataBundle, extensions, accessToken)
        await fetchIntercomStatus(userDataBundle, accessToken)
        await fetchDelegates(userDataBundle, accessToken)
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

    const fetchBusinessHoursCallHandling = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCallHandlingURL.replace('extensionId', `${userDataBundle.extension.data.id}`).replace('ruleId', 'business-hours-rule'), headers)
            userDataBundle.extendedData!.businessHoursCallHandling = response.data

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

    const fetchAfterHoursCallHandling = async (userDataBundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCallHandlingURL.replace('extensionId', `${userDataBundle.extension.data.id}`).replace('ruleId', 'after-hours-rule'), headers)
            userDataBundle.extendedData!.afterHoursCallHandling = response.data

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
            console.log(`Failed to get delegates`)
            console.log(e)
            postMessage(new Message(`Failed to get delegates for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch delegates', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {fetchUserData}
}

export default useFetchUserData