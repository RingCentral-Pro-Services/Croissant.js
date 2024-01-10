import { useState } from "react"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import useCreateUnassignedDevices from "../../../Device Upload/hooks/useCreateUnassignedDevices"
import { Device } from "../../User Data Download/models/UserDataBundle"
import { ProspectiveDevice } from "../../../Device Upload/models/ProspectiveDevice"
import { Extension } from "../../../../../models/Extension"
import useUploadDevice from "../../../Device Upload/hooks/useUploadDevice"

type GroupedData<T> = { key: string; values: T[] }[];

export const useUploadUnassignedDevices = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const { createDevices } = useCreateUnassignedDevices(postMessage, postTimedMessage, postError)
    const { uploadUnassignedDevice } = useUploadDevice(postMessage, postTimedMessage, postError)
    const [progressValue, setProgressValue] = useState(0)
    const [progressMax, setProgressMax] = useState(0)

    const uploadUnassignedDevices = async (devices: Device[], newSites: Extension[]) => {
        if (devices.length === 0) {
            return
        }

        const validDevices = devices.filter((device) => device.model && device.serial && device.model.id && device.model.name)

        setProgressMax(validDevices.length)
        const prospectiveDevices = getProspectiveDevices(validDevices, newSites)
        const prospectiveDeviceData = prospectiveDevices.map((device) => device.data)

        const groupedDevices = groupBy(prospectiveDeviceData, 'siteID')

        for (const group of groupedDevices) {
            const unassignedDeviceIds = await createDevices(group.values.length, group.key)
            
            for (const device of group.values) {
                const id = unassignedDeviceIds.pop()
                if (!id) {
                    postMessage(new Message(`Unassigned device ${device.name} can not be migrated`, 'error'))
                    postError(new SyncError(device.name, 0, ['Unassigned device not migrated', '']))
                    continue
                }
                await uploadUnassignedDevice(new ProspectiveDevice(device), id)
                setProgressValue((prev) => prev + 1)
            }
        }

        setProgressValue(Number.MAX_SAFE_INTEGER)

    }

    function groupBy<T>(array: T[], key: keyof T): GroupedData<T> {
        const groupedMap = array.reduce((acc: Map<string, T[]>, item: T) => {
            const keyValue = String(item[key]);
            const existingValues = acc.get(keyValue) || [];
            existingValues.push(item);
            acc.set(keyValue, existingValues);
            return acc;
        }, new Map());
    
        return Array.from(groupedMap).map(([key, values]) => ({ key, values }));
    }

    const getProspectiveDevices = (devices: Device[], newSites: Extension[]) => {
        const prospectiveDevices: ProspectiveDevice[] = []

        const unassigned = new Extension({
            name: 'Unassigned',
            contact: {
                firstName: 'Unassigned',
                email: 'Unassigned'
            },
            extensionNumber: 'Unassigned',
            status: 'Unassigned',
            type: 'User',
            id: 'Unassigned'
        })

        for (const device of devices) {
            const site = newSites.find((item) => item.data.name === device.site?.name)

            if (device.site && !site) {
                postMessage(new Message(`Unassigned device ${device.name} will not be migrated because it the site it's assigned to does not exist`, 'error'))
                postError(new SyncError(device.name, '', ['Unassigned device not migrated', 'Site does not exist']))
                continue
            }

            if (!device.serial) {
                continue
            }

            const prospectiveDevice = new ProspectiveDevice({
                macAddress: `N${device.serial.replaceAll(':', '')}`,
                modelID: device.model.id,
                modelName: device.model.name,
                extension: unassigned,
                name: device.name,
                ...(site && {siteID: `${site.data.id}`})
            })

            prospectiveDevices.push(prospectiveDevice)
        }

        return prospectiveDevices
    }

    return { uploadUnassignedDevices, progressMax, progressValue }
}