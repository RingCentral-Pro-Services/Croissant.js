import { useState } from "react"
import { Extension } from "../../../../models/Extension"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { Device } from "../../Migration/User Data Download/models/UserDataBundle"
import { ProspectiveDevice } from "../models/ProspectiveDevice"

const useReadDeviceData = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [isDeviceReadPending, setIsDeviceReadPending] = useState(true)
    const [prospectiveDevices, setProspectiveDevices] = useState<ProspectiveDevice[]>([])

    const readDevices = (excelData: any[], deviceDictionary: Device[], extensions: Extension[]) => {
        const devices: ProspectiveDevice[] = []

        for (const item of excelData) {
            const extensionNumber = item['Extension']
            const extension = extensions.find((ext) => `${ext.data.extensionNumber}` === `${extensionNumber}`)

            if (!extension) {
                postMessage(new Message(`Ext. ${extensionNumber} was not found in the account`, 'error'))
                postError(new SyncError('', extensionNumber, ['Extension not found', '']))
                continue
            }

            if (!['User', 'Limited'].includes(extension.data.type)) {
                postMessage(new Message(`Ext. ${extensionNumber} is not a user or limited extension`, 'error'))
                postError(new SyncError('', extensionNumber, ['Extension not supported', 'Not user or LE']))
                continue
            }

            const deviceType = item['Device Type'] ?? ''
            const deviceData = deviceDictionary.find((deviceModel) => deviceModel.model.name === deviceType)

            if (!deviceData) {
                postMessage(new Message(`Device mode '${deviceType}' was not found. Ext. ${extensionNumber}'s device will not be updated`, 'error'))
                postError(new SyncError(extension.data.name, extension.data.extensionNumber, ['Device model not found', '']))
                continue

            }

            const device = new ProspectiveDevice({
                macAddress: item['MAC Address'],
                modelID: deviceData.model.id,
                modelName: deviceType,
                extension: extension,
                name: item['Device Name']
            })

            devices.push(device)
        }

        setIsDeviceReadPending(false)
        setProspectiveDevices(devices)

        return devices
    }

    return {readDevices, isDeviceReadPending, prospectiveDevices}
}

export default useReadDeviceData