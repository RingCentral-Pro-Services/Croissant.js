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
        let page = 1
        let isDone = false

        while(!isDone) {
            const result = await getSites(page, accessToken)
            if (!result) {
                postMessage(new Message(`Something went wrong fetching sites (page ${page})`, 'error'))
                isDone = true
                break
            }
            sites.push(...result.sites)
            isDone = result.isDone
            page += 1
        }

        for (let i = 0; i < sites.length; i++) {
            delete sites[i].uri
        }

        setIsFetchingSites(false)
        callback(sites)
        return sites
    }

    const getSites = async (page: number, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(`${baseURL}&page=${page}`, headers)
            let records = response.data.records as SiteData[]
            records = records.filter((site) => site.id !== 'main-site')

            console.log('Sites response')
            console.log(response)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            const data: SiteResponse = {
                sites: records,
                isDone: response.data.paging.page >= response.data.paging.totalPages
            }

            return data
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to fetch sits`)
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

interface SiteResponse {
    sites: SiteData[],
    isDone: boolean
}

export default useSiteList