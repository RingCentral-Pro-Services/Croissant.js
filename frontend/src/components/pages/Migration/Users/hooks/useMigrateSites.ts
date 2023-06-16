import { useState } from "react"
import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { SiteDataBundle } from "../models/SiteDataBundle"

const useMigrateSites = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/sites'
    const baseExtensionURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const baseWaitingPeriod = 250
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)

    const migrateSites = async (sites: SiteDataBundle[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        let siteExtensions: Extension[] = []

        setMaxProgress(sites.length)
        for (const site of sites) {
            await makeSite(site.extension, accessToken)
            siteExtensions.push(convertToExtension(site.extension))
            setProgressValue((prev) => prev + 1)
        }
        return siteExtensions
    }

    const makeSite = async (site: SiteData, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            // if (site.code) delete site.code

            if (site.email) {
                site.email = `${site.email}.ps.ringcentral.com`
            }
            else {
                site.email = `noreply-${site.extensionNumber}@ps.ringcentral.com`
            }
            delete site.id
            const response = await RestCentral.post(baseURL, headers, site)
            site.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to create site`)
            console.log(e)
            postMessage(new Message(`Failed to create site ${site.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to create site', site.name], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const convertToExtension = (siteData: SiteData) => {
        const extension = new Extension({
            contact: {
                firstName: siteData.name,
                email: ''
            },
            id: siteData.id!,
            name: siteData.name,
            extensionNumber: siteData.extensionNumber,
            type: 'Site'
        })
        return extension
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {migrateSites, progressValue, maxProgress}
}

export default useMigrateSites