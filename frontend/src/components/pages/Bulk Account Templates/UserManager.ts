import { wait } from "../../../helpers/rcapi"
import { Extension } from "../../../models/Extension"
import { Message } from "../../../models/Message"
import { SyncError } from "../../../models/SyncError"
import { RestCentral } from "../../../rcapi/RestCentral"
import { Site } from "../Sites/models/Site"

export class UserManager {
    baseCreateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'
    baseRoleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/assigned-role'
    baseWaitingPeriod = 250
    
    constructor(
        private sites: Site[],
        private unassignedUsers: string[],
        private unassignedLEs: string[],
        private postMessage: (message: Message) => void,
        private postTimedMessage: (message: Message, duration: number) => void,
        private postError: (error: SyncError) => void
    ) {}

    async createUsers(users: Extension[], token: string) {
        for (let i = 0; i < users.length; i++) {
            if (users[i].data.type === 'User') {
                await this.createExtension(users[i], this.unassignedUsers.pop())
            }
            else if (users[i].data.type === 'Limited') {
                // Create limited extension
                await this.createExtension(users[i], this.unassignedLEs.pop())
            }
            else {
                await this.createExtension(users[i])
            }
        }
    }

    async createExtension(extension: Extension, id?: string) {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const site = this.sites.find((site) => site.data.name === extension.data.site?.name)
        if (site && site.id) {
            extension.data.site!.id = site.id
        }

        if (extension.data.type === 'User' && extension.data.subType !== 'VideoPro' && id) {
            // Yee haw. Create a new licensed user
            await this.createLicensedExtension(extension, id, accessToken)
            await this.setRole(extension, accessToken)
        }
        else if (extension.data.type === 'Limited' && id) {
            // Yee haw. Create a new limited extension
            await this.createLicensedExtension(extension, id, accessToken)
        }
        else {
            // This is a boring old message-only extension, announcement-only extension, or a video pro extension
            await this.createUnlicensedExtension(extension, accessToken)
            if ((extension.data.type === 'User' && extension.data.subType === 'VideoPro') || extension.data.type === 'VirtualUser') {
                await this.setRole(extension, accessToken)
            }
        }
    }

    async createUnlicensedExtension(extension: Extension, token: string) {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.post(this.baseCreateURL, headers, extension.payload(true))
            extension.data.id =response.data.id

            if (response.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to make extension ${extension.data.name}`)
            console.log(e)
            this.postMessage(new Message(`Failed to make extension ${extension.data.name} ${e.error ?? ''}`, 'error'))
            this.postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to create extension', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
    }

    async createLicensedExtension(extension: Extension, id: string, token: string) {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = this.baseUpdateURL.replace('extensionId', id)
            const response = await RestCentral.put(url, headers, extension.payload(true))
            extension.data.id = response.data.id
            
            if (response.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to make extension ${extension.data.name}`)
            console.log(e)
            this.postMessage(new Message(`Failed to make extension ${extension.data.name} ${e.error ?? ''}`, 'error'))
            this.postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to create extension', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
    }

    async setRole(extension: Extension, token: string) {
        if (!extension.data.id || !extension.data.roles || extension.data.roles.length === 0) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = this.baseRoleURL.replace('extensionId', `${extension.data.id}`)
            console.log(`Role URL: ${url}`)
            const response = await RestCentral.put(url, headers, extension.rolePayload())
            
            if (response.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set role ${extension.data.name}`)
            console.log(e)
            this.postMessage(new Message(`Failed to set role ${extension.data.name} ${e.error ?? ''}`, 'error'))
            this.postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to set role', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
    }
}