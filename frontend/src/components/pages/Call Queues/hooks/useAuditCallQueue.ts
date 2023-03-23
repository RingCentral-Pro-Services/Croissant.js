import { CallHandlingRules } from "../../../../models/CallHandlingRules"
import CallQueue from "../../../../models/CallQueue"
import { Greeting } from "../../../../models/Greetings"
import { Message } from "../../../../models/Message"
import RCExtension from "../../../../models/RCExtension"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useAuditCallQueue = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, callback: (queue: CallQueue) => void) => {
    const baseMembersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId/members'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule'
    const baseMemberStatusURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId'
    const baseManagersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId/permissions'
    const baseNotificationsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'
    const baseWaitingPeriod = 250

    const auditQueue = async (extension: RCExtension, extensions: RCExtension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const queue = new CallQueue(extension, 0, [])

        await fetchQueueMembers(queue, accessToken)
        await fetchCallHandling(queue, extensions, accessToken)
        await fetchEditableMemberStatus(queue, accessToken)
        await fetchManagers(queue, accessToken)
        await fetchNotificationsSettings(queue, accessToken)
        callback(queue)
    }

    const fetchQueueMembers = async (queue: CallQueue, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseMembersURL.replace('groupId', `${queue.extension.id}`)
            const response = await RestCentral.get(url, headers)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            const members = response.data.records.map((member: any) => member.extensionNumber) as string[]
            queue.members = members
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get queue members ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to get members for ${queue.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to get members', ''], e.error ?? '', queue))
            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchCallHandling = async (queue: CallQueue, extensions: RCExtension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            let url = baseCallHandlingURL.replace('extensionId', `${queue.extension.id}`)
            url += '?view=Detailed&enabledOnly=false'
            const response = await RestCentral.get(url, headers)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            const records = response.data.records as Array<any>

            const afterHoursData = records.filter((record) => {
                return record.id === "after-hours-rule"
            })
            const businessHoursData = records.filter((record) => {
                return record.id === "business-hours-rule"
            })

            if (businessHoursData.length > 0) {
                const callHandling: CallHandlingRules = businessHoursData[0].queue
                const greetings: Greeting[] = businessHoursData[0].greetings

                const voicemailRecipientID = businessHoursData[0].voicemail?.recipient?.id
                console.log(`Voicemail recipient ID: ${voicemailRecipientID}`)
                const voicemailRecipient = extensions.find((extension) => {
                    return extension.id === voicemailRecipientID
                })
                if (voicemailRecipient) {
                    queue.voicemailRecipient = `${voicemailRecipient.name} Ext. ${voicemailRecipient.extensionNumber}`
                }

                queue.handlingRules = callHandling
                queue.greetings = greetings
            }

            if (afterHoursData.length > 0) {
                const action = afterHoursData[0].callHandlingAction
                if (action === 'TransferToExtension') {
                    const extensionID = afterHoursData[0].transfer.extension.id
                    const extension = extensions.find((extension) => {
                        return extension.id == extensionID
                    })
                    queue.afterHoursDestination = `${extension?.extensionNumber ?? extensionID}`
                }
                else if (action === 'UnconditionalForwarding') {
                    const phoneNumber = afterHoursData[0].unconditionalForwarding.phoneNumber
                    queue.afterHoursDestination = phoneNumber
                }
                queue.afterHoursAction = action
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get call handling ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to get call handling for ${queue.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to get call handling', ''], e.error ?? '', queue))
            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchEditableMemberStatus = async (queue: CallQueue, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseMemberStatusURL.replace('groupId', `${queue.extension.id}`)
            const response = await RestCentral.get(url, headers)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            const memberStatus = response.data.editableMemberStatus
            memberStatus ? queue.editableMemberStatus = 'Allowed' : queue.editableMemberStatus = 'Not Allowed'
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get member status ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to get member status for ${queue.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to get member status', ''], e.error ?? '', queue))
            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchManagers = async (queue: CallQueue, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            let url = baseManagersURL.replace('groupId', `${queue.extension.id}`)
            url += '?managersOnly=true'
            const response = await RestCentral.get(url, headers)
            
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            const managers = response.data.records.map((record: any) => `${record.extension.name} Ext. ${record.extension.extensionNumber}`)
            queue.managers = managers
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get queue managers ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to get managers for ${queue.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to get managers', ''], e.error ?? '', queue))

            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchNotificationsSettings = async (queue: CallQueue, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseNotificationsURL.replace('extensionId', `${queue.extension.id}`)
            const response = await RestCentral.get(url, headers)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            queue.sendEmailNotifications = response.data.voicemails.notifyByEmail
            queue.includeAttachment = response.data.voicemails.includeAttachment
            queue.markAsRead = response.data.voicemails.markAsRead
            queue.notificationEmails = response.data.emailAddresses
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get notification settings ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to get notification settings for ${queue.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to get notifications', ''], e.error ?? '', queue))
            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {auditQueue}
}

export default useAuditCallQueue