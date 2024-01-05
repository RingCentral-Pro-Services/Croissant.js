import { randomNumberBetween } from "../../../../../helpers/utils"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { Device } from "../../../Migration/User Data Download/models/UserDataBundle"
import { CallQueueDataBundle } from "../../../Migration/Users/models/CallQueueDataBundle"
import { RingGroup } from "../models/RingGroup"

export const useConvertToRingGroup = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const convertToRingGroup = (queues: CallQueueDataBundle[], devices: Device[]) => {
        const ringGroups: RingGroup[] = []

        for (const queue of queues) {
            const ringGroup: RingGroup = {
                extensionNumber: queue.extension.data.extensionNumber,
                originalExtensionId: `${queue.extension.data.id}`,
                name: queue.extension.data.name,
                email: queue.extension.data.contact?.email ?? `queue${randomNumberBetween(11111, 99999)}@psi.com`,
                regionalSettings: queue.extension.data.regionalSettings!,
                businessHours: queue.extendedData?.businessHours,
                businessHoursCallHandling: queue.extendedData?.businessHoursCallHandling,
                afterHoursCallHandling: queue.extendedData?.afterHoursCallHandling,
                notificationSettings: queue.extendedData?.notifications,
                directNumbers: queue.extendedData?.directNumbers,
                type: 'User',
                subType: 'VideoPro',
                devices: [],
                site: queue.extension.data.site,
            }

            // const groupDevices = getDevices(devices, queue)
            const groupDevices = getFixedOrderDevices(devices, queue)
            ringGroup.devices.push(...groupDevices)

            ringGroups.push(ringGroup)
        }

        return ringGroups
    }

    const getDevices = (devices: Device[], queue: CallQueueDataBundle) => {
        const ringGroupDevices: Device[] = []
        for (const member of queue.extendedData?.members ?? []) {
            const device = devices.find(device => device.extension?.id === member.id)
            if (!device) {
                continue
            }
            ringGroupDevices.push(device)
        }
        return ringGroupDevices
    }

    const getFixedOrderDevices = (devices: Device[], queue: CallQueueDataBundle) => {
        const ringGroupDevices: Device[] = []
        for (const member of queue.extendedData?.businessHoursCallHandling?.queue?.fixedOrderAgents ?? []) {
            const device = devices.find(device => device.extension?.id == member.extension.id)
            if (!device) {
                postMessage(new Message(`Ext. ${member.extension.extensionNumber} could not be added to ring group ${queue.extension.data.name}`, 'error'))
                postError(new SyncError(queue.extension.data.name, queue.extension.data.extensionNumber, ['Could not add user to ring group', member.extension.extensionNumber]))
                continue
            }
            ringGroupDevices.push(device)
        }
        return ringGroupDevices
    }

    return { convertToRingGroup }
}