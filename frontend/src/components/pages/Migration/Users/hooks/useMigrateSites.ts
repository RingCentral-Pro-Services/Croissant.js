import { useState } from "react"
import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { PhoneNumber } from "../../User Data Download/models/UserDataBundle"
import { SiteDataBundle } from "../models/SiteDataBundle"

const useMigrateSites = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/sites'
    const baseExtensionURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const baseNumberAssignURL = 'https://platform.ringcentral.com/restapi/v2/accounts/~/phone-numbers/phoneNumberId'
    const baseWaitingPeriod = 250
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)

    const migrateSites = async (sites: SiteDataBundle[], availablePhoneNumbers: PhoneNumber[], availableTollFreeNumbers: PhoneNumber[], alreadyExists: boolean = false) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        let siteExtensions: Extension[] = []

        setMaxProgress(sites.length)
        for (const site of sites) {
            if (!alreadyExists) await makeSite(site.extension, accessToken)

            site.phoneNumberMap = new Map<string, PhoneNumber>()

            for (const number of site.extendedData!.directNumbers!) {
                if ((number.tollType === 'Toll' || number.paymentType === 'Local') && availablePhoneNumbers.length === 0) {
                    postMessage(new Message(`Ran out of phone numbers`, 'error'))
                    continue
                }
    
                if ((number.tollType === 'TollFree' || number.paymentType === 'TollFree') && availableTollFreeNumbers.length === 0) {
                    postMessage(new Message(`Ran out of toll free numbers`, 'error'))
                    continue
                }
    
                let tempNumber: PhoneNumber
    
                if ((number.tollType === 'Toll') || (number.paymentType === 'Local')) {
                    tempNumber = availablePhoneNumbers.pop()!
                }
                else {
                    tempNumber = availableTollFreeNumbers.pop()!
                }
    
                // const tempNumber = availablePhoneNumbers.pop()!
                site.phoneNumberMap.set(number.phoneNumber, tempNumber)

                await assignPhoneNumber(site, tempNumber.id, accessToken)
            }

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
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            await retryExtension(site, token)
        }
    }

    const retryExtension = async (site: SiteData, token: string) => {
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
            
            const data: SiteDatWithoutExtension = structuredClone(site)
            delete data.extensionNumber

            const response = await RestCentral.post(baseURL, headers, data)
            site.id = response.data.id
            site.tempExtensionNumber = response.data.extensionNumber

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

    const assignPhoneNumber = async (bundle: SiteDataBundle, phoneNumberID: string, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const body = {
                usageType: 'DirectNumber',
                extension: {
                    id: bundle.extension.id
                }
            }
            const response = await RestCentral.patch(baseNumberAssignURL.replace('phoneNumberId', phoneNumberID), headers, body)
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to assign direct number`)
            console.log(e)
            postMessage(new Message(`Failed to get assign phone number to site ${bundle.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.name, bundle.extension.extensionNumber, ['Failed to get phone number ID', ''], e.error ?? ''))
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