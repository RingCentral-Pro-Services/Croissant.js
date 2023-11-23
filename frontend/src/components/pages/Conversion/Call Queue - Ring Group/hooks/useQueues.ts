import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { TransferPayload } from "../../../../../models/TransferPayload";
import { CallHandling, CallHandlingQueueSettings, Device, UserDataBundle } from "../../../Migration/User Data Download/models/UserDataBundle";
import { CallQueueDataBundle, CallQueueMember, ExtendedQueueData } from "../../../Migration/Users/models/CallQueueDataBundle";
import { StandardGreeting } from "./useStandardGreetings";

export const useConvertToQueues = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const convertToQueues = (ringGroups: UserDataBundle[], devices: Device[], queueGreetings: StandardGreeting[]) => {
        const queues: CallQueueDataBundle[] = []

        for (const ringGroup of ringGroups) {
            const queue = convertToQueue(ringGroup, devices, queueGreetings)
            queue.originalExtension = ringGroup.extension
            queues.push(queue)
        }

        return queues
    }

    const convertToQueue = (ringGroup: UserDataBundle, devices: Device[], queueGreetings: StandardGreeting[]) => {
        const queueExtension = getExtension(ringGroup)
        const extendedData = getExtendedData(ringGroup, devices, queueGreetings)
        const queue = new CallQueueDataBundle(queueExtension, extendedData)
        return queue
    }

    const getExtension = (ringGroup: UserDataBundle) => {
        const queueExtension = new Extension({
            contact: {
                firstName: ringGroup.extension.data.name,
                // email: ringGroup.extension.data.contact?.email ?? '',
                email: `${ringGroup.extension.data.contact.email}.ps.ringcentral.com`
                // email: 'sampleextension@dqgriffin.com'
            },
            extensionNumber: ringGroup.extension.data.extensionNumber,
            // extensionNumbr: '39483',
            status: 'NotActivated',
            type: 'Department',
            id: '',
            name: ringGroup.extension.data.name,
            site: ringGroup.extension.data.site,
        })

        return queueExtension
    }

    const getExtendedData = (ringGroup: UserDataBundle, devices: Device[], queueGreetings: StandardGreeting[]) => {
        const extendedData: ExtendedQueueData = {
            businessHours: ringGroup.extendedData?.businessHours,
            directNumbers: ringGroup.extendedData?.directNumbers,
            notifications: ringGroup.extendedData?.notifications,
            members: getMembers(ringGroup, devices),
            businessHoursCallHandling: getBusinessHoursCallHandling(ringGroup, queueGreetings),
            afterHoursCallHandling: getAfterHoursCallHandling(ringGroup, queueGreetings),
            customRules: []
        }
        return extendedData
    }

    const getMembers = (ringGroup: UserDataBundle, devices: Device[]) => {
        const members: CallQueueMember[] = []

        if (!ringGroup.extendedData?.businessHoursCallHandling?.forwarding?.rules) {
            return members
        }

        const forwardingDevices = ringGroup.extendedData?.businessHoursCallHandling?.forwarding?.rules.flatMap((rule) => rule.forwardingNumbers)
        for (const forwardingDevice of forwardingDevices) {
            if (forwardingDevice.type !== 'PhoneLine') {
                continue
            }

            const userDevice = devices.find((device) => device.extension && device.phoneLines && device.phoneLines.length > 0 && device.phoneLines[0].phoneInfo.phoneNumber === forwardingDevice.phoneNumber)
            if (!userDevice) {
                postMessage(new Message(`Could not find user for whom forwarding number ${forwardingDevice.phoneNumber} belongs to. Will not be added to queue ${ringGroup.extension.data.name}`, 'error'))
                postError(new SyncError(ringGroup.extension.data.name, ringGroup.extension.data.extensionNumber, ['Could not find user for whom forwarding number belongs to', forwardingDevice.phoneNumber]))
                continue
            }

            const extension = userDevice.extension
            if (!extension) {
                postMessage(new Message(`Could not find extension for user ${userDevice.name}. Will not be added to queue ${ringGroup.extension.data.name}`, 'error'))
                postError(new SyncError(ringGroup.extension.data.name, ringGroup.extension.data.extensionNumber, ['Could not find extension for user', userDevice.name]))
                continue
            }

            const member: CallQueueMember = {
                id: extension.id,
                extensionNumber: extension.extensionNumber,
            }
            members.push(member)
        }

        return members
    }

    const getBusinessHoursCallHandling = (ringGroup: UserDataBundle, queueGreetings: StandardGreeting[]) => {
        const callHandling = ringGroup.extendedData?.businessHoursCallHandling
        if (!callHandling) {
            return undefined
        }

        for (let i = 0; i < callHandling.greetings.length; i++) {
            let greeting = callHandling.greetings[i]
            if (greeting.custom) {
                continue
            }

            const queueGreeting = queueGreetings.find((currentGreeting) => currentGreeting.type === greeting.type && currentGreeting.name === greeting.preset.name)
            if (!queueGreeting) {
                console.log(`Could not find queue greeting for ${greeting.type} ${greeting.preset.name}`)
                continue
            }

            greeting.preset.id = queueGreeting.id
        }

        const queueHandling: Partial<CallHandlingQueueSettings> = {
            transferMode: '',
            noAnswerAction: '',
            fixedOrderAgents: [],
            holdAudioInterruptionMode: '',
            holdAudioInterruptionPeriod: 0,
            holdTimeExpirationAction: '',
            agentTimeout: 0,
            holdTime: 0,
            wrapUpTime: 0,
            maxCallersAction: '',
            maxCallers: 0,
            transfer: [],
            unconditionalForwarding: [],
            voicemail: {
                enabled: true,
                recipient: {
                    uri: '',
                    id: '',
                }
            }
        }

        if (callHandling.missedCall) {
            if (callHandling.missedCall.actionType === 'ConnectToExtension') {
                queueHandling.holdTimeExpirationAction = 'TransferToExtension';
                const transfer: TransferPayload = {
                    extension: {
                        id: callHandling.missedCall.extension.id,
                    },
                    action: 'HoldTimeExpiration'
                }

                // @ts-ignore
                queueHandling.transfer.push(transfer)
            }
        }
        else {
            delete queueHandling.holdTimeExpirationAction
        }

        if (callHandling.forwarding?.ringingMode === 'Sequentially') {
            queueHandling.transferMode = 'FixedOrder'
        }
        else {
            queueHandling.transferMode = 'Simultaneous'
        }

        delete queueHandling.noAnswerAction
        delete queueHandling.holdAudioInterruptionMode
        delete queueHandling.holdAudioInterruptionPeriod
        delete queueHandling.maxCallersAction
        delete queueHandling.maxCallers
        delete queueHandling.voicemail
        delete queueHandling.wrapUpTime

        if (queueHandling.transferMode === 'FixedOrder' && ringGroup.extendedData?.businessHoursCallHandling?.forwarding?.rules) {
            queueHandling.agentTimeout = ringGroup.extendedData?.businessHoursCallHandling?.forwarding?.rules[0].ringCount * 5
            delete queueHandling.fixedOrderAgents
        }
        else {
            delete queueHandling.agentTimeout
            delete queueHandling.fixedOrderAgents
        }

        if (ringGroup.extendedData?.businessHoursCallHandling?.forwarding?.rules && ringGroup.extendedData.businessHoursCallHandling.forwarding.rules.length > 0) {
            queueHandling.holdTime = ringGroup.extendedData.businessHoursCallHandling.forwarding.rules[0].ringCount * 5
        }

        // @ts-ignore
        callHandling.queue = queueHandling

        delete callHandling.forwarding
        callHandling.callHandlingAction = 'AgentQueue'
        if (callHandling.voicemail) {
            callHandling.voicemail.enabled = true
            if (callHandling.voicemail.recipient.id == ringGroup.extension.data.id) {
                delete callHandling.voicemail
            }
        }

        // @ts-ignore
        delete callHandling.missedCall
        // @ts-ignore
        delete callHandling.transfer
        delete callHandling.unconditionalForwarding

        return callHandling
    }

    const getAfterHoursCallHandling = (ringGroup: UserDataBundle, queueGreetings: StandardGreeting[]) => {
        const callHandling = ringGroup.extendedData?.afterHoursCallHandling
        if (!callHandling) {
            return undefined
        }

        for (let i = 0; i < callHandling.greetings.length; i++) {
            let greeting = callHandling.greetings[i]
            if (greeting.custom) {
                continue
            }

            const queueGreeting = queueGreetings.find((currentGreeting) => currentGreeting.type === greeting.type && currentGreeting.name === greeting.preset.name)
            if (!queueGreeting) {
                console.log(`Could not find queue greeting for ${greeting.type} ${greeting.preset.name}`)
                continue
            }

            greeting.preset.id = queueGreeting.id
        }

        if (callHandling.callHandlingAction !== 'TransferToExtension') {
            // @ts-ignore
            delete callHandling.transfer
        }
        if (callHandling.callHandlingAction !== 'UnconditionalForwarding') {
            // @ts-ignore
            delete callHandling.unconditionalForwarding
        }
        delete callHandling.forwarding

        return callHandling
    }

    return { convertToQueues }
}