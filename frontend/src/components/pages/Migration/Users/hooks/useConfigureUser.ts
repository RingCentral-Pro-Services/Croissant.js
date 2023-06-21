import { Bundle } from "typescript";
import { Extension } from "../../../../../models/Extension";
import { Greeting } from "../../../../../models/Greetings";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { ERL } from "../../../Automatic Location Updates/models/ERL";
import { BlockedPhoneNumber, CalledNumber, CallHandling, CallHandlingForwardingNumber, CallHandlingForwardingRule, CustomRule, Device, ForwardingNumber, PERL, PresenseLine, UserDataBundle } from "../../User Data Download/models/UserDataBundle";
import { Role } from "../models/Role";

interface DeviceModelPayload {
    deviceId: string
    model: {
        id: string
    }
    serial: string
}

interface DeviceData {
    newDeviceID: string
    device: Device
}

const useConfigureUser = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseScheduleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/business-hours'
    const baseRoleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/assigned-role'
    const baseDeviceModelURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/device/bulk-update'
    const baseDeviceListURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/device'
    const baseDeviceUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/device/deviceId'
    const baseDeviceAddressURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/device/deviceId'
    const basePresenseLineURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/presence/line'
    const basePresenceSettingsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/presence'
    const baseNotificationsSettingsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'
    const baseIntercomURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/intercom'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/ruleId?showInactiveNumbers=true'
    const baseBlockedCallsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/caller-blocking'
    const baseBlockedPnoneNumbersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/caller-blocking/phone-numbers'
    const baseForwardingNumbersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/forwarding-number'
    const baseForwardAllCallsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/forward-all-calls'
    const basePERLURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/emergency-locations'
    const baseCustomGreetingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/greeting'
    const baseCustomRuleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule'
    const baseWaitingPeriod = 250

    const configureUser = async (bundle: UserDataBundle, companyERLs: ERL[], originalExtensions: Extension[], targetExtensions: Extension[], roles: Role[]) => {
        
        // Don't bother trying to configure the user if they weren't created
        if (bundle.hasEncounteredFatalError) return

        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await setRole(bundle, roles, accessToken)
        await setSchedule(bundle, accessToken)
        const deviceIDs = await getDeviceIDs(bundle, accessToken)
        const deviceData = await setDeviceModels(bundle, deviceIDs, accessToken)
        for (let i = 0; i < bundle.extendedData!.pERLs!.length; i++) {
            await addPERL(bundle, bundle.extendedData!.pERLs![i], accessToken)
            console.log('Adding pERL')
        }
        if (deviceData) {
            for (const data of deviceData) {
                await setDeviceName(bundle, data, accessToken)
                await setDeviceERL(bundle, data, companyERLs, bundle.extendedData!.pERLs!, accessToken)
                await addForwardingDevice(bundle, data.newDeviceID, accessToken)
            }
        }

        const forwardingNumbers = bundle.extendedData?.businessHoursCallHandling?.forwarding?.rules?.flatMap((rule) => rule.forwardingNumbers).filter((forwardingNumber) => forwardingNumber.type !== 'PhoneLine')
        console.log('Forwarding Numbers')
        console.log(forwardingNumbers)

        if (forwardingNumbers) {
            for (const number of forwardingNumbers) {
                await addForwardingNumber(bundle, number, accessToken)
            }
        }

        await setPresenseLines(bundle, originalExtensions, targetExtensions, accessToken)
        await setPresenseStatus(bundle, accessToken)
        await setNotifications(bundle, accessToken)
        if (deviceIDs && deviceIDs.length > 0) {
            await enableIntercom(bundle, deviceIDs[0], accessToken)
        }

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

        await setBlockedCallSettings(bundle, accessToken)
        for (const number of bundle.extendedData!.blockedPhoneNumbers!) {
            await addBlockedNumber(bundle, number, accessToken)
        }
        await setForwardAllCalls(bundle, originalExtensions, targetExtensions, accessToken)
        await wait(10000)

        const currentCallHandling = await getBusinessHoursCallHandling(bundle, accessToken)
        if (currentCallHandling) {
            const adjustedCallHandling = adjustCallHandling(bundle, currentCallHandling, originalExtensions, targetExtensions)
            if (adjustedCallHandling) {
                await setBusinessHoursCallHandling(bundle, adjustedCallHandling, accessToken)
            }
        }

        if (Object.keys(bundle.extendedData!.businessHours!.schedule).length !== 0) {
            const currentAfterHoursCallHandling = await getAfterHoursCallHandling(bundle, accessToken)
            if (currentAfterHoursCallHandling) {
                const adjustedCallHandling = adjustAfterHoursCallHandling(bundle, currentAfterHoursCallHandling, originalExtensions, targetExtensions)
                if (adjustedCallHandling) {
                    await setAfterHoursCallHandling(bundle, adjustedCallHandling, accessToken)
                }
            }    
        }

        // for (const erl of bundle.extendedData!.pERLs!) {
        //     await addPERL(bundle, erl, accessToken)
        // }
    }

    const setRole = async (bundle: UserDataBundle, roles: Role[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const originalRole = bundle.extendedData!.roles![0]
            const newRole = roles.find((role) => role.displayName === originalRole.displayName)
            if (!newRole) {
                postMessage(new Message(`Failed to set role for ${bundle.extension.data.name}`, 'error'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set role', `${originalRole.displayName}`]))
                return
            }

            const body = {
                records: [
                    {
                        id: newRole?.id
                    }
                ]
            }

            const response = await RestCentral.put(baseRoleURL.replace('extensionId', `${bundle.extension.data.id}`), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set role`)
            console.log(e)
            postMessage(new Message(`Failed to set role for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set role', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setSchedule = async (bundle: UserDataBundle, token: string) => {
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

    const getDeviceIDs = async (bundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseDeviceListURL.replace('extensionId', `${bundle.extension.data.id}`), headers)
            console.log('Device response')
            console.log(response.data)
            const deviceIDs = response.data.records.map((record: any) => record.id)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
            return deviceIDs
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get device IDs`)
            console.log(e)
            postMessage(new Message(`Failed to get device IDs for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to get device IDs', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setDeviceModels = async (bundle: UserDataBundle, deviceIDs: string[], token: string) => {
        if (!deviceIDs || deviceIDs.length === 0) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const devices: DeviceModelPayload[] = []
            const deviceData: DeviceData[] = []
            const existingDevices = bundle.extendedData!.devices

            for (let i = 0; i < deviceIDs.length; i++) {
                const deviceID = deviceIDs[i]
                if (i >= existingDevices.length || !existingDevices[i].model) continue
                
                const device: DeviceModelPayload = {
                    deviceId: deviceID,
                    serial: `N${existingDevices[i].serial}`,
                    model: {
                        id: existingDevices[i].model.id
                    }
                }

                const data: DeviceData = {
                    newDeviceID: deviceID,
                    device: existingDevices[i]
                }
                deviceData.push(data)
                devices.push(device)
            }

            if (devices.length === 0) return

            const body = {
                records: devices
            }
            console.log(body)

            const response = await RestCentral.post(baseDeviceModelURL, headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return deviceData
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set device serial numbers`)
            console.log(e)
            postMessage(new Message(`Failed to set device serial numbers for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set device serial numbers', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return []
        }
    }

    const setDeviceName = async (bundle: UserDataBundle, deviceData: DeviceData, token: string) => {
        console.log('setting device name')
        console.log(deviceData.device.name)
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                name: deviceData.device.name
            }

            const response = await RestCentral.put(baseDeviceUpdateURL.replace('deviceId', deviceData.newDeviceID), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set device name`)
            console.log(e)
            postMessage(new Message(`Failed to set device name for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set device name', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setDeviceERL = async (bundle: UserDataBundle, deviceData: DeviceData, companyERLs: ERL[], personalERLs: PERL[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const erl = companyERLs.find((erl) => erl.name === deviceData.device.emergency.location?.name && erl.visibility === deviceData.device.emergency.visibility)
            const perl = personalERLs.find((erl) => erl.name === deviceData.device.emergency.location?.name)
            if (!erl && !perl) {
                postMessage(new Message(`ERL for ${bundle.extension.data.name} was not found. ERL not set`, 'error'))
                return
            }

            const body = {
                emergency: {
                    location: {
                        id: erl?.id ?? perl?.id
                    }
                }
            }

            const response = await RestCentral.put(baseDeviceAddressURL.replace('deviceId', deviceData.newDeviceID), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set device address`)
            console.log(e)
            postMessage(new Message(`Failed to set device address for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set device address', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setPresenseLines = async (bundle: UserDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            if (!bundle.extendedData || !bundle.extendedData.presenseLines) return
            const goodPresenseLines: PresenseLine[] = []
            const badPresenseLines: PresenseLine[] = []

            for (let i = 0; i < bundle.extendedData!.presenseLines!.length; i++) {
                let presenseLine = bundle.extendedData.presenseLines[i]

                // Search for the original extension
                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${presenseLine.extension.id}`)

                // If the original extension couldn't be found, post error and skip
                if (!originalExtension) {
                    badPresenseLines.push(presenseLine)
                    continue
                }

                // Search for the new extension
                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())

                if (!newExtension) {
                    badPresenseLines.push(presenseLine)
                    continue
                }

                delete presenseLine.uri
                delete presenseLine.notEditableOnHud
                delete presenseLine.extension.extensionName
                delete presenseLine.extension.extensionNumber
                delete presenseLine.extension.type
                delete presenseLine.extension.uri
                presenseLine.extension.id = `${newExtension.data.id}`
                goodPresenseLines.push(presenseLine)
            }

            if (badPresenseLines.length !== 0) {
                postMessage(new Message(`${badPresenseLines.length} extensions were removed from ${bundle.extension.data.name}'s presence because they could not be found`, 'warning'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Extensions removed from presence', badPresenseLines.map((line) => line.id).join(', ')]))
            }

            const response = await RestCentral.put(basePresenseLineURL.replace('extensionId', `${bundle.extension.data.id}`), headers, goodPresenseLines)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set presence lines`)
            console.log(e)
            postMessage(new Message(`Failed to set presence lines for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set presence lines', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setPresenseStatus = async (bundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.put(basePresenceSettingsURL.replace('extensionId', `${bundle.extension.data.id}`), headers, bundle.extendedData?.presenseSettings)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set presense settings`)
            console.log(e)
            postMessage(new Message(`Failed to set presense settings for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set presense settings', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setNotifications = async (bundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
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

    const enableIntercom = async (bundle: UserDataBundle, deviceID: string, token: string) => {
        if (!bundle.extendedData?.intercomStatus?.enabled) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                enabled: true,
                device: {
                    id: deviceID
                }
            }

            const response = await RestCentral.put(baseIntercomURL.replace('extensionId', `${bundle.extension.data.id}`), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to enable intercom`)
            console.log(e)
            postMessage(new Message(`Failed to enable intercom for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to enable intercom', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setDuringHoursGreetings = async (bundle: UserDataBundle, token: string) => {
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

    const setAfterHoursGreetings = async (bundle: UserDataBundle, token: string) => {
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

    const setBlockedCallSettings = async (bundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.put(baseBlockedCallsURL.replace('extensionId', `${bundle.extension.data.id}`), headers, bundle.extendedData?.blockedCallSettings)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set blocked call settings`)
            console.log(e)
            postMessage(new Message(`Failed to set blocked call settings for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set blocked call settings', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const addBlockedNumber = async (bundle: UserDataBundle, number: BlockedPhoneNumber, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            delete number.id
            delete number.uri

            const response = await RestCentral.post(baseBlockedPnoneNumbersURL.replace('extensionId', `${bundle.extension.data.id}`), headers, number)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to add blocked / allowed number`)
            console.log(e)
            postMessage(new Message(`Failed to add blocked / allowed number for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to add blocked / allowed number', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setForwardAllCalls = async (bundle: UserDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const forwardAllCalls = bundle.extendedData!.forwardAllCalls
            if (!forwardAllCalls?.enabled) {
                return
            }

            if (forwardAllCalls?.extension) {
                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === forwardAllCalls.extension?.id)

                if (!originalExtension) {
                    postMessage(new Message(`Failed to find old forward all calls extension ID for user ${bundle.extension.data.name}`, 'error'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set forward all calls', ''], '', forwardAllCalls))
                    return
                }

                const newExtension = targetExtensions.find((ext) => `${ext.data.name}` === `${originalExtension.data.name}`)

                if (!newExtension) {
                    postMessage(new Message(`Failed to find target forward all calls extension ID for user ${bundle.extension.data.name}`, 'error'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set forward all calls', ''], '', forwardAllCalls))
                    return
                }

                forwardAllCalls.extension.id = `${newExtension.data.id}`
            }

            if (forwardAllCalls.externalNumber) {
                forwardAllCalls.phoneNumber = {
                    phoneNumber: forwardAllCalls.externalNumber.phoneNumber
                }
                delete forwardAllCalls.externalNumber
            }

            const response = await RestCentral.patch(baseForwardAllCallsURL.replace('extensionId', `${bundle.extension.data.id}`), headers, forwardAllCalls)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set forward all calls`)
            console.log(e)
            postMessage(new Message(`Failed to set forward all calls for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set forward all calls', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const addForwardingDevice = async (bundle: UserDataBundle, deviceID: string, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                type: "PhoneLine",
                device: {
                    id: deviceID
                }
            }

            const response = await RestCentral.post(baseForwardingNumbersURL.replace('extensionId', `${bundle.extension.data.id}`), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to add forwarding device`)
            console.log(e)
            // postMessage(new Message(`Failed to add forwarding device to ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            // postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to add forwarding device', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const addForwardingNumber = async (bundle: UserDataBundle, forwardingNumber: ForwardingNumber, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                type: forwardingNumber.type,
                label: forwardingNumber.label,
                phoneNumber: forwardingNumber.phoneNumber
            }

            const response = await RestCentral.post(baseForwardingNumbersURL.replace('extensionId', `${bundle.extension.data.id}`), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to add forwarding number`)
            console.log(e)
            postMessage(new Message(`Failed to add forwarding number to ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to add forwarding number', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const getBusinessHoursCallHandling = async (bundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCallHandlingURL.replace('extensionId', `${bundle.extension.data.id}`).replace('ruleId', 'business-hours-rule'), headers)
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
            console.log(`Failed to set schedule`)
            console.log(e)
            postMessage(new Message(`Failed to set schedule for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set schedule', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const getAfterHoursCallHandling = async (bundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCallHandlingURL.replace('extensionId', `${bundle.extension.data.id}`).replace('ruleId', 'after-hours-rule'), headers)
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
            console.log(`Failed to get after hours call handling`)
            console.log(e)
            postMessage(new Message(`Failed to get after hours call handling for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to get after hours call handling', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const addPERL = async (bundle: UserDataBundle, erl: PERL, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.post(basePERLURL.replace('extensionId', `${bundle.extension.data.id}`), headers, erl)
            erl.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to add pERL`)
            console.log(e)
            postMessage(new Message(`Failed to add pERL to ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to add pERL', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setBusinessHoursCallHandling = async (bundle: UserDataBundle, callHandling: CallHandling, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const body = {
                forwarding: callHandling.forwarding,
                missedCall: callHandling.missedCall,
                voicemail: callHandling.voicemail,
                screening: callHandling.screening
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
            console.log(`Failed to set business hours call handling`)
            console.log(e)
            postMessage(new Message(`Failed to set business hours call handling for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set business hours call handling', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setAfterHoursCallHandling = async (bundle: UserDataBundle, callHandling: CallHandling, token: string) => {
        // Don't try to set call handling if user is set to 24/7
        if (Object.keys(bundle.extendedData!.businessHours!.schedule).length === 0) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const body = {
                forwarding: callHandling.forwarding,
                missedCall: callHandling.missedCall,
                voicemail: callHandling.voicemail,
                screening: callHandling.screening
            }

            const response = await RestCentral.put(baseCallHandlingURL.replace('extensionId', `${bundle.extension.data.id}`).replace('ruleId', 'after-hours-rule'), headers, body)

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

    const adjustCallHandling = (bundle: UserDataBundle, currentCallHandling: CallHandling, originalExtensions: Extension[], targetExtensions: Extension[]) => {
        let result = currentCallHandling
        let originalCallHandling = bundle.extendedData!.businessHoursCallHandling
        if (!originalCallHandling) return

        // Adjust call forwarding
        // Need to swap out phone numbers and IDs to that of the newly created extension
        if (originalCallHandling.forwarding && originalCallHandling.forwarding.rules) {
            let originalRules = originalCallHandling.forwarding.rules
            const currentRules = result.forwarding?.rules
            if (!currentRules || !originalRules) return
            const currentForwardingNumbers = currentRules.flatMap((rule) => rule.forwardingNumbers)

            if (currentRules && originalRules) {
                for (let i = 0; i < originalRules.length; i++) {
                    let rule = originalRules[i]
                    const goodForwardingNumbers: CallHandlingForwardingNumber[] = []
                    const badForwardingNumbers: CallHandlingForwardingNumber[] = []
    
                    for (let j = 0; j < rule.forwardingNumbers.length; j++) {
                        let forwardingNumber = rule.forwardingNumbers[j]
    
                        const matchingForwardingNumber = currentForwardingNumbers.find((number) => number.label === forwardingNumber.label)
                        if (!matchingForwardingNumber) {
                            badForwardingNumbers.push(forwardingNumber)
                            continue
                        }
                        
                        const goodNumber: CallHandlingForwardingNumber = {
                            id: matchingForwardingNumber.id,
                            phoneNumber: matchingForwardingNumber.phoneNumber,
                            label: matchingForwardingNumber.label,
                            type: matchingForwardingNumber.type
                        }
                        goodForwardingNumbers.push(goodNumber)
                    }

                    rule.forwardingNumbers = goodForwardingNumbers
                    if (badForwardingNumbers.length !== 0) {
                        postMessage(new Message(`${badForwardingNumbers.length} forwarding numbers were removed from ${bundle.extension.data.name}'s business hours call handling because they were not found`, 'warning'))
                        postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Forwarding numbers removed', badForwardingNumbers.map((number) => number.label).join(', ')]))
                    }
                }

                const goodRules = originalRules.filter((rule) => rule.forwardingNumbers.length !== 0)

                for (let i = 0; i < goodRules.length; i++) {
                    goodRules[i].index = i + 1
                }

                originalCallHandling.forwarding.rules = goodRules
            }
        }

        // Adjust voicemail recipient
        if (originalCallHandling.voicemail) {
            const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${originalCallHandling?.voicemail.recipient.id}`)
            if (!originalExtension) {
                postMessage(new Message(`Failed to find original ID for voicemail recipient on ${bundle.extension.data.name}. Original ID: ${originalCallHandling.voicemail.recipient.id}`, 'error'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set voicemail recipient', 'Original ID not found']))
            }

            const newExtension = targetExtensions.find((ext) => ext.prettyType() === originalExtension?.prettyType() && ext.data.name === originalExtension.data.name)
            if (!newExtension) {
                postMessage(new Message(`Failed to find new ID for voicemail recipient on ${bundle.extension.data.name}`, 'error'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set voicemail recipient', 'New ID not found']))
            }

            originalCallHandling.voicemail.recipient.id = `${newExtension?.data.id}`
            
    
            delete originalCallHandling.voicemail.recipient.uri
            delete originalCallHandling.voicemail.recipient.displayName
        }

        // Adjust missed call recipient
        if (originalCallHandling.missedCall && originalCallHandling.missedCall.actionType === 'ConnectToExtension') {
            const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${originalCallHandling?.missedCall.extension.id}`)
            if (!originalExtension) {
                postMessage(new Message(`Failed to find original ID for missed call recipient on ${bundle.extension.data.name}`, 'error'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set missed call recipient', 'Original ID not found']))
            }

            const newExtension = targetExtensions.find((ext) => ext.prettyType() === originalExtension?.prettyType() && ext.data.name === originalExtension.data.name)
            if (!newExtension) {
                postMessage(new Message(`Failed to find new ID for missed call recipient on ${bundle.extension.data.name}`, 'error'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set missed call recipient', 'New ID not found']))
            }

            originalCallHandling.missedCall.extension.id = `${newExtension?.data.id}`
            delete originalCallHandling.missedCall.extension.displayName
        }

        return originalCallHandling
    }

    const adjustAfterHoursCallHandling = (bundle: UserDataBundle, currentCallHandling: CallHandling, originalExtensions: Extension[], targetExtensions: Extension[]) => {
        try{
            let result = currentCallHandling
            let originalCallHandling = bundle.extendedData!.afterHoursCallHandling
            if (!originalCallHandling) return

            // Adjust call forwarding
            // Need to swap out phone numbers and IDs to that of the newly created extension
            if (originalCallHandling.callHandlingAction === 'ForwardCalls' && originalCallHandling.forwarding && originalCallHandling.forwarding.rules) {
                let originalRules = originalCallHandling.forwarding.rules
                const currentRules = result.forwarding?.rules
                if (!currentRules || !originalRules) return
                const currentForwardingNumbers = currentRules.flatMap((rule) => rule.forwardingNumbers)
    
                if (currentRules && originalRules) {
                    for (let i = 0; i < originalRules.length; i++) {
                        let rule = originalRules[i]
                        const goodForwardingNumbers: CallHandlingForwardingNumber[] = []
                        const badForwardingNumbers: CallHandlingForwardingNumber[] = []
        
                        for (let j = 0; j < rule.forwardingNumbers.length; j++) {
                            let forwardingNumber = rule.forwardingNumbers[j]
        
                            const matchingForwardingNumber = currentForwardingNumbers.find((number) => number.label === forwardingNumber.label)
                            if (!matchingForwardingNumber) {
                                // postMessage(new Message(`Failed to find matching forwarding rule for ${forwardingNumber.label} on ${bundle.extension.data.name}`, 'error'))
                                badForwardingNumbers.push(forwardingNumber)
                                continue
                            }
                            
                            const goodNumber: CallHandlingForwardingNumber = {
                                id: matchingForwardingNumber.id,
                                phoneNumber: matchingForwardingNumber.phoneNumber,
                                label: matchingForwardingNumber.label,
                                type: matchingForwardingNumber.type
                            }
                            goodForwardingNumbers.push(goodNumber)
                            // forwardingNumber.id = matchingForwardingNumber.id
                            // forwardingNumber.phoneNumber = matchingForwardingNumber.phoneNumber
                        }
    
                        rule.forwardingNumbers = goodForwardingNumbers
                        if (badForwardingNumbers.length !== 0) {
                            postMessage(new Message(`${badForwardingNumbers.length} forwarding numbers were removed from ${bundle.extension.data.name}'s after hours call handling because they were not found`, 'warning'))
                        }
                    }
    
                    const goodRules = originalRules.filter((rule) => rule.forwardingNumbers.length !== 0)
    
                    for (let i = 0; i < goodRules.length; i++) {
                        goodRules[i].index = i + 1
                    }
    
                    originalCallHandling.forwarding.rules = goodRules
                }
            } else {
                delete originalCallHandling.forwarding
            }

            // Adjust voicemail recipient
            if (originalCallHandling.voicemail && originalCallHandling.voicemail.enabled) {
                console.log('original call handling')
                console.log(originalCallHandling.voicemail.recipient)
                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${originalCallHandling?.voicemail.recipient.id}`)
                if (!originalExtension) {
                    postMessage(new Message(`Failed to find original ID for after hours voicemail recipient on ${bundle.extension.data.name}. Original ID: ${originalCallHandling.voicemail.recipient.id}`, 'error'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set voicemail recipient', 'Original ID not found']))
                }

                const newExtension = targetExtensions.find((ext) => ext.prettyType() === originalExtension?.prettyType() && ext.data.name === originalExtension.data.name)
                if (!newExtension) {
                    postMessage(new Message(`Failed to find new ID for voicemail recipient on ${bundle.extension.data.name}`, 'error'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set voicemail recipient', 'New ID not found']))
                }

                originalCallHandling.voicemail.recipient.id = `${newExtension?.data.id}`
                delete originalCallHandling.voicemail.recipient.uri
                delete originalCallHandling.voicemail.recipient.displayName
            }

            // Adjust missed call recipient
            if (originalCallHandling.missedCall && originalCallHandling.missedCall.actionType === 'ConnectToExtension') {
                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${originalCallHandling?.missedCall.extension.id}`)
                if (!originalExtension) {
                    postMessage(new Message(`Failed to find original ID for missed call recipient on ${bundle.extension.data.name}`, 'error'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set missed call recipient', 'Original ID not found']))
                }

                const newExtension = targetExtensions.find((ext) => ext.prettyType() === originalExtension?.prettyType() && ext.data.name === originalExtension.data.name)
                if (!newExtension) {
                    postMessage(new Message(`Failed to find new ID for missed call recipient on ${bundle.extension.data.name}`, 'error'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set missed call recipient', 'New ID not found']))
                }

                originalCallHandling.missedCall.extension.id = `${newExtension?.data.id}`
                delete originalCallHandling.missedCall.extension.displayName
            }

            return originalCallHandling
        }
        catch {
            postMessage(new Message(`Failed to adjust after hours call handling for ${bundle.extension.data.name}`, 'warning'))
        }
    }

    const adjustCustomRule = (bundle: UserDataBundle, customRule: CustomRule, originalExtensions: Extension[], targetExtensions: Extension[]) => {
        try {
            delete customRule.id
            delete customRule.uri

            if (customRule.calledNumbers && customRule.calledNumbers.length !== 0) {
                const goodNumbers: CalledNumber[] = []
                for (const number of customRule.calledNumbers) {
                    const tempNumber = bundle.phoneNumberMap?.get(number.phoneNumber)
                    if (!tempNumber) {
                        postMessage(new Message(`Failed to find temp number for called number ${number.phoneNumber} on custom rule ${customRule.name} on user ${bundle.extension.data.name}`, 'warning'))
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
                    postMessage(new Message(`Failed to adjust voicemail recipient for custom rule ${customRule.name} on user ${bundle.extension.data.name}`, 'error'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to adjust custom rule', customRule.name]))
                    return customRule
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
                if (!newExtension) {
                    postMessage(new Message(`Failed to adjust voicemail recipient for custom rule ${customRule.name} on user ${bundle.extension.data.name}`, 'error'))
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
                    postMessage(new Message(`Failed to adjust transfer extension for custom rule ${customRule.name} on user ${bundle.extension.data.name}`, 'error'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to adjust custom rule', customRule.name]))
                    return customRule
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
                if (!newExtension) {
                    postMessage(new Message(`Failed to adjust transfer extension for custom rule ${customRule.name} on user ${bundle.extension.data.name}`, 'error'))
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
            postMessage(new Message(`Failed to adjust custom rule ${customRule.name} on user ${bundle.extension.data.name}`, 'error'))
        }
    }

    const setCustomGreeting = async (bundle: UserDataBundle, ruleID: string, greeting: Greeting, token: string) => {
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

    const addCustomRule = async (bundle: UserDataBundle, customRule: CustomRule, token: string) => {
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

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {configureUser}
}

export default useConfigureUser