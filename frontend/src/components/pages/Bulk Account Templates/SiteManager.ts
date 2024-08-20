import { wait } from "../../../helpers/rcapi";
import { Message } from "../../../models/Message";
import { RegionalFormat } from "../../../models/RegionalFormat";
import { SyncError } from "../../../models/SyncError";
import { RestCentral } from "../../../rcapi/RestCentral";
import { Site } from "../Sites/models/Site";

export class SiteManager {
    private createSitesURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/sites'
    private baseWaitingPeriod = 250
    
    constructor(private regionalFormats: RegionalFormat[], private postMessage: (message: Message) => void, private postTimedMessage: (message: Message, duration: number) => void, private postError: (error: SyncError) => void) {}

    async createSites(sites: Site[], token: string) {
        for (let i = 0; i < sites.length; i++) {
            await this.createSite(sites[i], token)
        }
    }

    private async createSite(site: Site, token: string) {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            site.data.userLanguage = this.regionalFormats.find(rf => rf.name === site.data.userLanguage)?.id || ''
            site.data.greetingLanguage = this.regionalFormats.find(rf => rf.name === site.data.greetingLanguage)?.id || ''
            site.data.regionalFormat = this.regionalFormats.find(rf => rf.name === site.data.regionalFormat)?.id || ''

            const response = await RestCentral.post(this.createSitesURL, headers, site.payload())
            site.id = response.data.id

            if (response.rateLimitInterval > 0) {
                this.postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(this.baseWaitingPeriod)
        }
        catch (e) {
            console.log(`Failed to create site ${site.data.name}`)
        }
    }
}