import { useState } from "react"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"

const useSiteList = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, callback: (siteData: SiteData[]) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/sites?perPage=1000'
    const baseWaitingPeriod = 250
    const [isFetchingSites, setIsFetchingSites] = useState(true)

    const fetchSites = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }
        setIsFetchingSites(true)

        const sites: SiteData[] = []
        await getSites(sites, accessToken)
        setIsFetchingSites(false)
        callback(sites)
        return sites
    }

    const getSites = async (sites: SiteData[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseURL, headers)
            const records = response.data.records as SiteData[]

            for (let site of records) {
                if (site.id === 'main-site') {
                    continue
                }
                // delete site.id
                delete site.uri
                sites.push(site)
            }

            console.log(sites)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to make fetch sits`)
            console.log(e)
            postMessage(new Message(`Failed to fetch sites ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to fetch sites', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return { fetchSites, isFetchingSites }
}

export default useSiteList