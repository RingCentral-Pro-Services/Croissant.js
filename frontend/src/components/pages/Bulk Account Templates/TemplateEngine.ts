import { wait } from "../../../helpers/rcapi";
import CallQueue from "../../../models/CallQueue";
import { Extension } from "../../../models/Extension";
import { IVRMenu } from "../../../models/IVRMenu";
import { Message } from "../../../models/Message";
import { RegionalFormat } from "../../../models/RegionalFormat";
import { SyncError } from "../../../models/SyncError";
import { RestCentral } from "../../../rcapi/RestCentral";
import { Site } from "../Sites/models/Site";
import { QueueManager } from "./CallQueueManager";
import { IVRManager } from "./IVRManager";
import { SiteManager } from "./SiteManager";
import { UserManager } from "./UserManager";

export interface TemplateData {
    sites: Site[]
    users: Extension[]
    ivrs: IVRMenu[]
    callQueues: CallQueue[]
}

export class TemplateEngine {
    private baseExtensionsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    private baseWaitingPeriod = 250

    constructor(private templateData: TemplateData, private regionalFormats: RegionalFormat[], private postMessage: (message: Message) => void, private postTimedMessage: (message: Message, duration: number) => void, private postError: (error: SyncError) => void) {}

    async applyTemplate() {
        const token = localStorage.getItem('cs_access_token')
        if (!token) {
            console.log('No customer token!')
            return
        }

        const unassignedUsers = await this.getUnassignedExtensions('User',token)
        const unassignedLEs = await this.getUnassignedExtensions('Limited', token)

        const siteHandler = new SiteManager(this.regionalFormats, this.postMessage, this.postTimedMessage, this.postError)
        const userHandler = new UserManager(this.templateData.sites, unassignedUsers, unassignedLEs, this.postMessage, this.postTimedMessage, this.postError)
        const queueHandler = new QueueManager(this.templateData.sites, this.templateData.users, this.postMessage, this.postTimedMessage, this.postError)
        const ivrHandler = new IVRManager(this.templateData.sites, this.templateData.users, this.templateData.ivrs, this.templateData.callQueues, this.postMessage, this.postTimedMessage, this.postError)

        await siteHandler.createSites(this.templateData.sites, token)
        await userHandler.createUsers(this.templateData.users, token)
        await queueHandler.createQueues(this.templateData.callQueues, token)
        await ivrHandler.createIVRs(this.templateData.ivrs, token)
        await ivrHandler.configureIVRs(this.templateData.ivrs, token)
        await queueHandler.configureQueues(this.templateData.callQueues, token)

        localStorage.removeItem('cs_access_token')
        localStorage.removeItem('cs_token_expiry')
        localStorage.removeItem('cs_refresh_token')
    }

   private async getUnassignedExtensions(type: string = 'User' || 'Limited', token: string) {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.get(`${this.baseExtensionsURL}?type=${type}&status=Unassigned&perPage=1000`, headers)
            const extensionIds = response.data.records.map((record: any) => `${record.id}`)

            if (response.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(this.baseWaitingPeriod)

            return extensionIds
        }
        catch (e) {
            
        }
    }
}