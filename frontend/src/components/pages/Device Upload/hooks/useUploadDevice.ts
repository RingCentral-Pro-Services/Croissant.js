import { wait } from "../../../../helpers/rcapi";
import { Extension } from "../../../../models/Extension";
import { Message } from "../../../../models/Message";
import { SyncError } from "../../../../models/SyncError";
import { RestCentral } from "../../../../rcapi/RestCentral";
import { ProspectiveDevice } from "../models/ProspectiveDevice";

interface DeviceModelPayload {
    deviceId: string
    model: {
        id: string
    }
    serial: string
}

const useUploadDevice = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseDeviceModelURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/device/bulk-update'
    const baseDeviceListURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/device'
    const baseDeviceUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/device/deviceId'
    const baseWaitingPeriod = 250

    const uploadDevice = async (prospectiveDevice: ProspectiveDevice) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const deviceID = await setDevice(prospectiveDevice, accessToken)
        if (deviceID) {
            await setDeviceName(prospectiveDevice, deviceID, accessToken)
        }
    }

    const uploadUnassignedDevice = async (prospectiveDevice: ProspectiveDevice, id: string) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const deviceID = await setUnassignedDevice(prospectiveDevice, id, accessToken)
        if (deviceID) {
            await setDeviceName(prospectiveDevice, deviceID, accessToken)
        }
    }

    const getDeviceIDs = async (extension: Extension, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseDeviceListURL.replace('extensionId', `${extension.data.id}`), headers)
            console.log('Device response')
            console.log(response.data)
            const validDevices = response.data.records.filter((record: any) => record.type === 'OtherPhone')

            if (validDevices.length < 1) {
                postMessage(new Message(`No devices of type 'Existing Device' found for ${extension.data.name}. Device will not be uploaded`, 'error'))
                postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['No valid devices found', ''], ''))
                return []
            }

            const deviceIDs = validDevices.map((device: any) => device.id)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
            return deviceIDs
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get device IDs`)
            console.log(e)
            postMessage(new Message(`Failed to get device IDs for ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to get device IDs', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return []
        }
    }

    const setDevice = async (device: ProspectiveDevice, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const deviceIDs = await getDeviceIDs(device.data.extension, token)
            if (!deviceIDs || deviceIDs.length < 1)
            console.log('Device IDs')
            console.log(deviceIDs)

            const devicePayload: DeviceModelPayload = {
                deviceId: deviceIDs[0],
                serial: device.data.macAddress,
                model: {
                    id: device.data.modelID
                }
            }

            const body = {
                records: [devicePayload]
            }
            
            const response = await RestCentral.post(baseDeviceModelURL, headers, body)

            if (response.data.records[0].error) {
                postMessage(new Message(`Failed to set device for ${device.data.extension.data.name}. ${response.data.records[0].error.message}`, 'error'))
                postError(new SyncError(device.data.extension.data.name, device.data.extension.data.extensionNumber, ['Failed to set device', ''], response.data.records[0].error.message))
            }
            
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
            return deviceIDs[0] as string
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set device for ${device.data.extension.data.name}`)
            console.log(e)
            postMessage(new Message(`Failed to set device for ${device.data.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(device.data.extension.data.name, parseInt(device.data.extension.data.extensionNumber), ['Failed to set device', ''], e.error ?? '', device.data))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return undefined
        }
    }

    const setUnassignedDevice = async (device: ProspectiveDevice, id: string, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const devicePayload: DeviceModelPayload = {
                deviceId: id,
                serial: device.data.macAddress,
                model: {
                    id: device.data.modelID
                }
            }

            const body = {
                records: [devicePayload]
            }
            
            const response = await RestCentral.post(baseDeviceModelURL, headers, body)

            if (response.data.records[0].error) {
                postMessage(new Message(`Failed to set unassigned device. ${response.data.records[0].error.message}`, 'error'))
                postError(new SyncError('Unassigned', 'Unassigned', ['Failed to set unassigned device', device.data.macAddress], response.data.records[0].error.message))
            }
            
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
            return id
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set unassigned device`)
            console.log(e)
            postMessage(new Message(`Failed to set unassigned device ${e.error ?? ''}`, 'error'))
            postError(new SyncError(device.data.extension.data.name, parseInt(device.data.extension.data.extensionNumber), ['Failed to set unassigned device', ''], e.error ?? '', device.data))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return undefined
        }
    }

    const setDeviceName = async (device: ProspectiveDevice, id: string, token: string) => {
        if (!device.data.name || device.data.name === '') return 
        
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                name: device.data.name
            }

            const response = await RestCentral.put(baseDeviceUpdateURL.replace('deviceId', id), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set device name`)
            console.log(e)
            postMessage(new Message(`Failed to set device name for ${device.data.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(device.data.extension.data.name, parseInt(device.data.extension.data.extensionNumber), ['Failed to set device name', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {uploadDevice, uploadUnassignedDevice}
}

export default useUploadDevice