import CallQueue from "../../../../models/CallQueue"
import { Message } from "../../../../models/Message"
import RCExtension from "../../../../models/RCExtension"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useCallQueue = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, isMultiSiteEnabled: boolean, callback: () => void) => {
    const createURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const baseUpdateDataURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId/bulk-assign'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/business-hours-rule'
    const baseAfterHoursCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/after-hours-rule'
    const baseScheduleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/business-hours'
    const baseManagersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/extensionId/permissions-bulk-assign'
    const baseMemberStatusURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId'
    const baseNotificationsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'
    const baseWaitingPeriod = 250

    const defaultHours = {
        schedule: {
            weeklyRanges: {
                monday: [{
                    from: '08:00',
                    to: '17:00'
                }],
                tuesday: [{
                    from: '08:00',
                    to: '17:00'
                }],
                wednesday: [{
                    from: '08:00',
                    to: '17:00'
                }],
                thursday: [{
                    from: '08:00',
                    to: '17:00'
                }],
                friday: [{
                    from: '08:00',
                    to: '17:00'
                }],
            }
        }
    }

    const createCallQueue = async (queue: CallQueue, extensions: RCExtension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        if (extensionExists(queue.extension.extensionNumber, extensions)) {
            // Update call queue
            await updateQueue(queue, accessToken)
        }
        else {
            await makeQueue(queue, accessToken)
        }

        await setManagers(queue, accessToken)
        await setMemberStatus(queue, accessToken)
        await addQueueMembers(queue, accessToken)
        await setCallHandling(queue, accessToken)
        if (queue.handlingRules?.transferMode === 'FixedOrder') {
            await setFixedOrderMembers(queue, accessToken)
        }
        await disableConnectingMessage(queue, accessToken)
        await setNotificationSettings(queue, accessToken)
        if (queue.afterHoursAction && queue.afterHoursAction !== '') {
            await setSchedule(queue, accessToken)
            await setAfterHoursCallHandling(queue, accessToken) // Will only work if the queue is not set to 24/7
        }
        callback()
    }

    const makeQueue = async (queue: CallQueue, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.post(createURL, headers, queue.createPayload(isMultiSiteEnabled))
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            queue.extension.id = response.data.id
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to make queue ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to make queue ${queue.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to create queue', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const updateQueue = async (queue: CallQueue, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.put(baseUpdateDataURL.replace('extensionId', `${queue.extension.id}`), headers, queue.createPayload(isMultiSiteEnabled))
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            queue.extension.id = response.data.id
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to make queue ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to update queue ${queue.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to update queue', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setManagers = async (queue: CallQueue, token: string) => {
        if (!queue.extension.id || !queue.managers || queue.managers.length === 0) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseManagersURL.replace('extensionId', `${queue.extension.id}`)
            const response = await RestCentral.post(url, headers, queue.managersPayload())
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to set managers for ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to set managers for ${queue.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to set managers', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const addQueueMembers = async (queue: CallQueue, token: string) => {
        if (!queue.extension.id || queue.members.length === 0) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = baseUpdateURL.replace('groupId', `${queue.extension.id}`)
            const body = {addedExtensionIds: queue.members}
            const response = await RestCentral.post(url, headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to add queue members ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to add queue members ${queue.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to add queue members', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setCallHandling = async (queue: CallQueue, token: string) => {
        if (!queue.extension.id) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = baseCallHandlingURL.replace('extensionId', `${queue.extension.id}`)
            const response = await RestCentral.put(url, headers, queue.payload())

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to set call handling for ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to set call handling ${queue.extension.name}. ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to set call handling', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setFixedOrderMembers = async (queue: CallQueue, token: string) => {
        if (!queue.extension.id) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = baseCallHandlingURL.replace('extensionId', `${queue.extension.id}`)

            const agents = []
            for (const member of queue.members) {
                agents.push({
                    extension: {
                        id: member
                    },
                    index: queue.members.indexOf(member) + 1
                })
            }

            const body = {
                queue: {
                    fixedOrderAgents: agents
                }
            }

            const response = await RestCentral.put(url, headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to set fixed order members ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to set fixed order members ${queue.extension.name}. ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to set fixed order members', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const disableConnectingMessage = async (queue: CallQueue, token: string) => {
        if (!queue.greetings) return
        const introGreeting = queue.greetings.find((greeting) => greeting.type === 'Introductory')
        if ((!introGreeting) || (introGreeting && introGreeting.preset.name !== 'None')) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = baseCallHandlingURL.replace('extensionId', `${queue.extension.id}`)

            const body = {
                greetings: [
                    {
                        type: 'ConnectingMessage',
                        preset: {
                            id: 134405
                        }
                    }
                ]
            }

            const response = await RestCentral.put(url, headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to disable connecting message for ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to disable connecting message ${queue.extension.name}. ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to disable connecting message', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setAfterHoursCallHandling = async (queue: CallQueue, token: string) => {
        if (!queue.extension.id || !queue.afterHoursAction || queue.afterHoursAction === '' ) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = baseAfterHoursCallHandlingURL.replace('extensionId', `${queue.extension.id}`)
            const response = await RestCentral.put(url, headers, queue.afterHoursPayload())

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to set after hours call handling for ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to set after hours call handling ${queue.extension.name}. ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to set after hours call handling', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setSchedule = async (queue: CallQueue, token: string) => {
        if (!queue.extension.id) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = baseScheduleURL.replace('extensionId', `${queue.extension.id}`)
            const response = await RestCentral.put(url, headers, defaultHours)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to set schedule for ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to set schedule for ${queue.extension.name}. ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to set schedule', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setMemberStatus = async (queue: CallQueue, token: string) => {
        if (!queue.extension.id || !queue.editableMemberStatus || queue.editableMemberStatus === '') return
        
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = baseMemberStatusURL.replace('groupId', `${queue.extension.id}`)
            const response = await RestCentral.put(url, headers, queue.memberStatusPayload())

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to set editable member status for ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to set editable member status for ${queue.extension.name}. ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to set editable member status', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setNotificationSettings = async (queue: CallQueue, token: string) => {
        if (!queue.sendEmailNotifications) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = baseNotificationsURL.replace('extensionId', `${queue.extension.id}`)
            const response = await RestCentral.put(url, headers, queue.notificationPayload())

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to set notification settings for ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to set notification settings for ${queue.extension.name}. ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to set notification settings', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const extensionExists = (extensionNumber: number, extensionList: RCExtension[]) => {
        for (let index = 0; index < extensionList.length; index++) {
            if (extensionList[index].extensionNumber == extensionNumber) return true
        }
        return false
    }


    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {createCallQueue}
}

export default useCallQueue