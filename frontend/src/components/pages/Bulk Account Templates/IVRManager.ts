import { wait } from "../../../helpers/rcapi";
import CallQueue from "../../../models/CallQueue";
import { Extension } from "../../../models/Extension";
import { IVRMenu } from "../../../models/IVRMenu";
import { Message } from "../../../models/Message";
import { SyncError } from "../../../models/SyncError";
import { RestCentral } from "../../../rcapi/RestCentral";
import { Site } from "../Sites/models/Site";

export class IVRManager {
    private url = 'https://platform.ringcentral.com/restapi/v1.0/account/~/ivr-menus'
    private baseWaitingPeriod = 250

    constructor(
        private sites: Site[],
        private users: Extension[],
        private ivrs: IVRMenu[],
        private queues: CallQueue[],
        private postMessage: (message: Message) => void,
        private postTimedMessage: (message: Message, duration: number) => void,
        private postError: (error: SyncError) => void
    ) {}

    async createIVRs(ivrs: IVRMenu[], token: string) {
        for (let i = 0; i < ivrs.length; i++) {
            const token = localStorage.getItem('cs_access_token')
            if (!token) return
            await this.createIVR(ivrs[i], token)
        }
    }

    async configureIVRs(ivrs: IVRMenu[], token: string) {
        for (let i = 0; i < ivrs.length; i++) {
            const token = localStorage.getItem('cs_access_token')
            if (!token) return
            await this.configureIVR(ivrs[i], token)
        }
    }

    private async createIVR(ivr: IVRMenu, token: string) {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.post(this.url, headers, ivr.payload(this.sites.length > 0, false))

            if (response.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            ivr.data.id = response.data.id
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to make IVR ${ivr.data.name}`)
            console.log(e)
            this.postMessage(new Message(`Failed to make IVR ${ivr.data.name} ${e.error ?? ''}`, 'error'))
            this.postError(new SyncError(ivr.data.name, ivr.data.extensionNumber, ['Failed to create IVR', ''], e.error ?? '', ivr))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
    }

    private async configureIVR(ivr: IVRMenu, token: string) {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            for (let action of ivr.data.actions) {
                if (!action.extension) {
                    continue
                }    
                
                const extension = this.users.find((ext) => `${ext.data.extensionNumber}` === `${action.extension?.id}`)
                const queue = this.queues.find((ext) => `${ext.extension.extensionNumber}` === `${action.extension?.id}`)
                const ivr = this.ivrs.find((ext) => `${ext.data.extensionNumber}` === `${action.extension?.id}`)
                
                action.extension.id = `${extension?.data.id ?? queue?.extension.id ?? ivr?.data.id}`
                
            }

            const body = {
                name: ivr.data.name,
                prompt: ivr.data.prompt,
                actions: ivr.data.actions
            }

            const response = await RestCentral.put(`${this.url}/${ivr.data.id}`, headers, body)

            if (response.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            ivr.data.id = response.data.id
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to make IVR ${ivr.data.name}`)
            console.log(e)
            this.postMessage(new Message(`Failed to make IVR ${ivr.data.name} ${e.error ?? ''}`, 'error'))
            this.postError(new SyncError(ivr.data.name, ivr.data.extensionNumber, ['Failed to create IVR', ''], e.error ?? '', ivr))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
    }

}