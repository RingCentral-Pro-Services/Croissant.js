import { useState } from "react";
import { wait } from "../../../../../helpers/rcapi";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { PhoneNumber } from "../../User Data Download/models/UserDataBundle";
import { SiteDataBundle } from "../models/SiteDataBundle";

interface BasicRuleData {
    enabled: boolean
    name: string
    type: string
    uri: string
    id: string
}

const useFetchMainSite = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const basicSettingsUrl = 'https://platform.ringcentral.com/restapi/v1.0/account/~/sites'
    const baseBusinessHoursURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/business-hours'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/answering-rule/ruleId'
    const baseCustomRulesURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/answering-rule'
    const baseCompanyHandlingRuleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/answering-rule/ruleId'
    const baseWaitingPeriod = 250

    const fetchMainSite = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const siteData: SiteData = {
            name: "Main Site",
            extensionNumber: "",
            callerIdName: "",
            email: "mainsite@ps.ringcentral.com",
            businessAddress: {
                country: "",
                state: "",
                city: "",
                street: "",
                zip: ""
            },
            operator: {
                extensionNumber: "",
            },
            regionalSettings: {}
        }

        const bundle = new SiteDataBundle(siteData)

        await fetchBusinessHours(bundle, accessToken)
        await fetchBasicSettings(bundle, accessToken)
        await fetchBusinessHoursCallHandling(bundle, accessToken)
        await fetchAfterHoursCallHandling(bundle, accessToken)
        const rules = await fetchCustomRuleIDs(bundle, accessToken)
        setProgressValue(0)
        setMaxProgress(rules.length)
        for (const rule of rules) {
            await fetchCustomRule(bundle, rule.id, accessToken)
            setProgressValue((prev) => prev +1)
        }

        return bundle
    }

    const fetchBasicSettings = async (bundle: SiteDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(basicSettingsUrl, headers)
            const mainSite: SiteData = response.data.records.find((site: any) => site.id === 'main-site')

            if (!mainSite) {
                console.log('Main site not found')
            }

            bundle.extension.businessAddress = mainSite.businessAddress
            bundle.extension.regionalSettings = mainSite.regionalSettings

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get basic main site settings`)
            console.log(e)
            postMessage(new Message(`Failed to get address and regional settings for ${bundle.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.name, parseInt(bundle.extension.extensionNumber), ['Failed to fetch address and regional settings', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
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
                businessHours: response.data,
                customRules: []
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

    const fetchCustomRuleIDs = async (userDataBundle: SiteDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCustomRulesURL.replace('extensionId', `${userDataBundle.extension.id}`), headers)
            const rules = response.data.records as BasicRuleData[]

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return rules.filter((rule) => rule.type === 'Custom')
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get custom rule IDs`)
            console.log(e)
            postMessage(new Message(`Failed to get custom rules for main site ${e.error ?? ''}`, 'error'))
            postError(new SyncError('Main Site', '', ['Failed to fetch custom rules', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return []
        }
    }

    const fetchCustomRule = async (userDataBundle: SiteDataBundle, ruleID: string, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.get(baseCompanyHandlingRuleURL.replace('ruleId', ruleID), headers)
            const rule = response.data
            userDataBundle.extendedData!.customRules?.push(rule)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get custom rule`)
            console.log(e)
            postMessage(new Message(`Failed to get custom rule for main site ${e.error ?? ''}`, 'error'))
            postError(new SyncError('Main Site', '', ['Failed to fetch custom rule', `ID: ${ruleID}`], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {fetchMainSite, progressValue, maxProgress}
}

export default useFetchMainSite