import { useState } from "react"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"

const useMigrateSites = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/sites'
    const baseWaitingPeriod = 250
    const [progressValue, setProgressValue] = useState(1)
    const [maxProgress, setMaxProgress] = useState(2)

    const migrateSites = async (sites: SiteData[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setMaxProgress(sites.length)
        for (const site of sites) {
            await makeSite(site, accessToken)
            setProgressValue((prev) => prev + 1)
        }
    }

    const makeSite = async (site: SiteData, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.post(baseURL, headers, site)
       

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

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {migrateSites, progressValue, maxProgress}
}

export default useMigrateSites