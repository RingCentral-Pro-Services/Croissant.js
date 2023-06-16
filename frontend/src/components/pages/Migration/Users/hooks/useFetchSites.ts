import { useState } from "react";
import { wait } from "../../../../../helpers/rcapi";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { SiteDataBundle } from "../models/SiteDataBundle";

const useFetchSites = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const baseBusinessHoursURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/business-hours'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/ruleId'
    const baseWaitingPeriod = 250

    const fetchSites = async (sites: SiteData[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const bundles: SiteDataBundle[] = []

        setMaxProgress(sites.length)
        for (const site of sites) {
            bundles.push(new SiteDataBundle(site))
        }

        for (let i = 0; i < sites.length; i++) {
            await fetchBusinessHours(bundles[i], accessToken)
            await fetchBusinessHoursCallHandling(bundles[i], accessToken)
            await fetchAfterHoursCallHandling(bundles[i], accessToken)
            setProgressValue((prev) => prev + 1)
        }

        return bundles
    }

    const fetchBusinessHours = async (bundle: SiteDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseBusinessHoursURL.replace('extensionId', `${bundle.extension.id}`), headers)
            bundle.extendedData = {
                businessHours: response.data
            }
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get business hours`)
            console.log(e)
            postMessage(new Message(`Failed to get business hours for ${bundle.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.name, parseInt(bundle.extension.extensionNumber), ['Failed to fetch business hours', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchBusinessHoursCallHandling = async (bundle: SiteDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCallHandlingURL.replace('extensionId', `${bundle.extension.id}`).replace('ruleId', 'business-hours-rule'), headers)
            bundle.extendedData!.businessHoursCallHandling = response.data
           
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get business hours call handling`)
            console.log(e)
            postMessage(new Message(`Failed to get business hours call handling for ${bundle.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.name, parseInt(bundle.extension.extensionNumber), ['Failed to fetch business hours call handling', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchAfterHoursCallHandling = async (bundle: SiteDataBundle, token: string) => {
        if (Object.keys(bundle.extendedData!.businessHours!.schedule).length === 0) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCallHandlingURL.replace('extensionId', `${bundle.extension.id}`).replace('ruleId', 'after-hours-rule'), headers)
            bundle.extendedData!.afterHoursCallHandling = response.data
           
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get after hours call handling`)
            console.log(e)
            postMessage(new Message(`Failed to get after hours call handling for ${bundle.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.name, parseInt(bundle.extension.extensionNumber), ['Failed to fetch after hours call handling', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {fetchSites, progressValue, maxProgress}
}

export default useFetchSites