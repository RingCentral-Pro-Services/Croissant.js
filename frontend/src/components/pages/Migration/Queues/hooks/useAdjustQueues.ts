import { useState } from "react"
import ExtensionIsolator from "../../../../../helpers/ExtensionIsolator"
import { idForExtension } from "../../../../../helpers/rcapi"
import CallQueue from "../../../../../models/CallQueue"
import RCExtension from "../../../../../models/RCExtension"

const useAdjustQueues = () => {
    const [adjustedQueues, setAdjustedQueues] = useState<CallQueue[]>([])
    const [isQueueAdjustmentPending, setIsQueueAdjustmentPending] = useState(true)

    const adjustQueues = (originalQueues: CallQueue[], extensionList: RCExtension[]) => {
        const queues: CallQueue[] = []

        for (let queue of originalQueues) {
            let adjustedQueue = adjustSiteID(queue, extensionList)
            adjustedQueue = adjustEmailAddress(adjustedQueue)
            adjustedQueue = adjustQueueMembers(queue, extensionList)
            adjustedQueue = adjustVoicemailRecipient(queue, extensionList)
            adjustedQueue = adjustCallHandling(queue)
            adjustedQueue = adjustGreetings(queue)
            adjustedQueue = adjustManagers(queue, extensionList)
            queues.push(adjustedQueue)
        }

        setAdjustedQueues(queues)
        setIsQueueAdjustmentPending(false)
    }

    const adjustSiteID = (queue: CallQueue, extensionList: RCExtension[]) => {
        const siteName = queue.extension.site
        const site = extensionList.find((ext) => ext.prettyType[ext.type] === 'Site' && ext.name === siteName)

        if (!site) {
            return queue
        }

        queue.siteID = site.id
        return queue
    }

    const adjustEmailAddress = (queue: CallQueue) => {
        if (!queue.extension.contact.email) {
            queue.extension.contact.email = `noreply-${queue.extension.extensionNumber}@ps.ringcentral.com`
        }
        return queue
    }

    const adjustQueueMembers = (queue: CallQueue, extensionList: RCExtension[]) => {
        const memberIDs: string[] = []

        for (const member of queue.members) {
            const memberExtension = extensionList.find((ext) => `${ext.extensionNumber}` === `${member}`)
            if (!memberExtension) {
                // For now just move on
                continue
            }

            memberIDs.push(`${memberExtension.id}`)
        }
        queue.members = memberIDs
        return queue
    }

    const adjustVoicemailRecipient = (queue: CallQueue, extensionList: RCExtension[]) => {
        delete queue.voicemailRecipient
        return queue
    }

    const adjustCallHandling = (queue: CallQueue) => {
        if (queue.handlingRules?.fixedOrderAgents) {
            delete queue.handlingRules.fixedOrderAgents
        }
        return queue
    }

    const adjustGreetings = (queue: CallQueue) => {
        const nonCustomGreetings = queue.greetings?.filter((greeting) => greeting.preset)
        queue.greetings = nonCustomGreetings
        return queue
    }

    const adjustManagers = (queue: CallQueue, extensionList: RCExtension[]) => {
        if (!queue.managers || queue.managers.length === 0) {
            return queue
        }

        const isolator = new ExtensionIsolator()
        const rawManagers = queue.managers
        const managers: string[] = []

        for (const rawManager of rawManagers) {
            const extensionNumber = isolator.isolateExtension(rawManager)
            if (!extensionNumber) continue

            const managerExtension = extensionList.find((ext) => `${ext.extensionNumber}` === extensionNumber)
            if (!managerExtension) continue

            managers.push(`${managerExtension.id}`)
        }

        queue.managers = managers
        return queue
    }

    return {adjustQueues, adjustedQueues, isQueueAdjustmentPending}

}

export default useAdjustQueues