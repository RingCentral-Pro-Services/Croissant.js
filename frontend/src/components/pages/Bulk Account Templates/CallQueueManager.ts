import { wait } from "../../../helpers/rcapi";
import CallQueue from "../../../models/CallQueue";
import { CallQueueManager } from "../../../models/CallQueueManager";
import { Extension } from "../../../models/Extension";
import { Message } from "../../../models/Message";
import { SyncError } from "../../../models/SyncError";
import { RestCentral } from "../../../rcapi/RestCentral";
import { Site } from "../Sites/models/Site";

export class QueueManager {
    createURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    baseManagersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/extensionId/permissions-bulk-assign'
    baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId/bulk-assign'
    baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/business-hours-rule'
    baseNotificationsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'
    baseAfterHoursCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/after-hours-rule'
    baseScheduleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/business-hours'
    baseWaitingPeriod = 250

    defaultHours = {
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

    constructor(
        private sites: Site[],
        private users: Extension[],
        private postMessage: (message: Message) => void,
        private postTimedMessage: (message: Message, duration: number) => void,
        private postError: (error: SyncError) => void
    ) {}

    async createQueues(queues: CallQueue[], token: string) {
        for (let i = 0; i < queues.length; i++) {
            await this.makeQueue(queues[i], token)
        }
    }

    async configureQueues(queues: CallQueue[], token: string) {
        for (let i = 0; i < queues.length; i++) {
            await this.setManagers(queues[i], token)
            await this.addQueueMembers(queues[i], token)
            await this.setCallHandling(queues[i], token)
            await this.setNotificationSettings(queues[i], token)
            if (queues[i].afterHoursAction && queues[i].afterHoursAction !== '') {
                await this.setSchedule(queues[i], token)
                await this.setAfterHoursCallHandling(queues[i], token) // Will only work if the queue is not set to 24/7
            }
        }
    }


    async makeQueue(queue: CallQueue, token: string) {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const site = this.sites.find((site) => site.data.name === queue.extension.site)
            if (site) {
                queue.siteID = `${site.id}`
            }

            const response = await RestCentral.post(this.createURL, headers, queue.createPayload(this.sites.length > 0))
            if (response.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            queue.extension.id = response.data.id
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to make queue ${queue.extension.name}`)
            console.log(e)
            this.postMessage(new Message(`Failed to make queue ${queue.extension.name} ${e.error ?? ''}`, 'error'))
            this.postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to create queue', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
    }

    async setManagers(queue: CallQueue, token: string) {
        if (!queue.extension.id || !queue.managers || queue.managers.length === 0) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = this.baseManagersURL.replace('extensionId', `${queue.extension.id}`)

            const goodManagers: CallQueueManager[] = []
            for (const prospectiveManager of queue.managers) {
                const trimmedExtension = prospectiveManager.trim()
                const managerExtension = this.users.find((extension) => `${extension.data.extensionNumber}` === trimmedExtension)
                if (managerExtension) {
                    goodManagers.push({id: `${managerExtension.data.id}`, permission: 'FullAccess'})
                }
            }

            const body = {
                updatedExtensions: goodManagers
            }

            const response = await RestCentral.post(url, headers, body)
            if (response.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to set managers for ${queue.extension.name}`)
            console.log(e)
            this.postMessage(new Message(`Failed to set managers for ${queue.extension.name} ${e.error ?? ''}`, 'error'))
            this.postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to set managers', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
    }

    async addQueueMembers(queue: CallQueue, token: string) {
        if (!queue.extension.id || queue.members.length === 0) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = this.baseUpdateURL.replace('groupId', `${queue.extension.id}`)

            const members: string[] = []
            for (const prospectiveMember of queue.members) {
                const memberExtension = this.users.find((extension) => `${extension.data.extensionNumber}` === prospectiveMember.trim())
                if (memberExtension) {
                    members.push(`${memberExtension.data.id}`)
                }
            }

            const body = {addedExtensionIds: members}
            const response = await RestCentral.post(url, headers, body)

            if (response.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to add queue members ${queue.extension.name}`)
            console.log(e)
            this.postMessage(new Message(`Failed to add queue members ${queue.extension.name} ${e.error ?? ''}`, 'error'))
            this.postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to add queue members', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
    }

    async setCallHandling(queue: CallQueue, token: string) {
        if (!queue.extension.id) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = this.baseCallHandlingURL.replace('extensionId', `${queue.extension.id}`)

            if (queue.handlingRules?.holdTimeExpirationAction && queue.handlingRules.holdTimeExpirationAction === 'TransferToExtension') {
                const extension = this.users.find((ext) => `${ext.data.extensionNumber}` === `${queue.maxWaitTimeDestination}`)
                if (extension) {
                    queue.maxWaitTimeDestination = `${extension.data.id}`
                }
            }

            if (queue.handlingRules?.maxCallersAction && queue.handlingRules.maxCallersAction === 'TransferToExtension') {
                const extension = this.users.find((ext) => `${ext.data.extensionNumber}` === `${queue.maxCallersDestination}`)
                if (extension) {
                    queue.maxCallersDestination = `${extension.data.id}`
                }
            }

            if (queue.voicemailRecipient) {
                const extension = this.users.find((ext) => `${ext.data.extensionNumber}` === queue.voicemailRecipient?.trim())
                if (extension) {
                    queue.voicemailRecipient = `${extension.data.id}`
                }
            }

            const response = await RestCentral.put(url, headers, queue.payload())

            if (response.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to set call handling for ${queue.extension.name}`)
            console.log(e)
            this.postMessage(new Message(`Failed to set call handling ${queue.extension.name}. ${e.error ?? ''}`, 'error'))
            this.postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to set call handling', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
    }

    async setNotificationSettings(queue: CallQueue, token: string) {
        if (!queue.sendEmailNotifications) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = this.baseNotificationsURL.replace('extensionId', `${queue.extension.id}`)
            const response = await RestCentral.put(url, headers, queue.notificationPayload())

            if (response.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to set notification settings for ${queue.extension.name}`)
            console.log(e)
            this.postMessage(new Message(`Failed to set notification settings for ${queue.extension.name}. ${e.error ?? ''}`, 'error'))
            this.postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to set notification settings', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
    }

    async setSchedule(queue: CallQueue, token: string) {
        if (!queue.extension.id) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = this.baseScheduleURL.replace('extensionId', `${queue.extension.id}`)
            const response = await RestCentral.put(url, headers, this.defaultHours)

            if (response.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to set schedule for ${queue.extension.name}`)
            console.log(e)
            this.postMessage(new Message(`Failed to set schedule for ${queue.extension.name}. ${e.error ?? ''}`, 'error'))
            this.postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to set schedule', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
    }

    async setAfterHoursCallHandling(queue: CallQueue, token: string) {
        if (!queue.extension.id || !queue.afterHoursAction || queue.afterHoursAction === '' ) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = this.baseAfterHoursCallHandlingURL.replace('extensionId', `${queue.extension.id}`)

            if (queue.afterHoursAction === 'TransferToExtension') {
                const extension = this.users.find((ext) => `${ext.data.extensionNumber}` === queue.afterHoursDestination)
                queue.afterHoursDestination = `${extension?.data.id}`
            }

            const response = await RestCentral.put(url, headers, queue.afterHoursPayload())

            if (response.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to set after hours call handling for ${queue.extension.name}`)
            console.log(e)
            this.postMessage(new Message(`Failed to set after hours call handling ${queue.extension.name}. ${e.error ?? ''}`, 'error'))
            this.postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to set after hours call handling', ''], e.error ?? '', queue))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
    }

}