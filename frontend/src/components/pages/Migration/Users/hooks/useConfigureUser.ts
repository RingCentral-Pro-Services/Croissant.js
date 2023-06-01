import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { ERL } from "../../../Automatic Location Updates/models/ERL";
import { Device, PresenseLine, UserDataBundle } from "../../User Data Download/models/UserDataBundle";

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
    const baseDeviceModelURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/device/bulk-update'
    const baseDeviceListURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/device'
    const baseDeviceUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/device/deviceId'
    const baseDeviceAddressURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/device/deviceId'
    const basePresenseLineURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/presence/line'
    const basePresenceSettingsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/presence'
    const baseNotificationsSettingsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'
    const baseWaitingPeriod = 250

    const configureUser = async (bundle: UserDataBundle, companyERLs: ERL[], originalExtensions: Extension[], targetExtensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await setSchedule(bundle, accessToken)
        const deviceIDs = await getDeviceIDs(bundle, accessToken)
        const deviceData = await setDeviceModels(bundle, deviceIDs, accessToken)
        for (const data of deviceData) {
            await setDeviceName(bundle, data, accessToken)
            await setDeviceERL(bundle, data, companyERLs, accessToken)
        }
        await setPresenseLines(bundle, originalExtensions, targetExtensions, accessToken)
        await setPresenseStatus(bundle, accessToken)
        await setNotifications(bundle, accessToken)
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

    const setDeviceERL = async (bundle: UserDataBundle, deviceData: DeviceData, companyERLs: ERL[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const erl = companyERLs.find((erl) => erl.name === deviceData.device.emergency.location?.name && erl.visibility === deviceData.device.emergency.visibility)
            if (!erl) {
                postMessage(new Message(`ERL for ${bundle.extension.data.name} was not found. ERL not set`, 'error'))
                return
            }

            const body = {
                emergency: {
                    location: {
                        id: erl?.id
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

            for (let i = 0; i < bundle.extendedData!.presenseLines!.length; i++) {
                let presenseLine = bundle.extendedData.presenseLines[i]

                // Search for the original extension
                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${presenseLine.extension.id}`)

                // If the original extension couldn't be found, post error and skip
                if (!originalExtension) {
                    postMessage(new Message(`Failed to find old ID for presense line ${presenseLine.id} for user ${bundle.extension.data.name}`, 'error'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set presense', `Line ${presenseLine.id}`], '', presenseLine))
                    continue
                }

                // Search for the new extension
                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())

                if (!newExtension) {
                    postMessage(new Message(`Failed to find new ID for presense line ${presenseLine.id} for user ${bundle.extension.data.name}`, 'error'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set presense', `Line ${presenseLine.id}`], '', presenseLine))
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

            const body = {
                records: goodPresenseLines
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

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {configureUser}
}

export default useConfigureUser