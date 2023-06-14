import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { PERL, PhoneNumber } from "../../User Data Download/models/UserDataBundle";
import { LimitedExtensionDataBundle } from "../models/LimitedExtensionDataBundle";

const useFetchLE = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseDataURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'
    const baseDevicesURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/device'
    const basePhoneNumbersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/phone-number?usageType=DirectNumber&perPage=1000'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/ruleId'
    const baseCustomGreetingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/greeting/greetingId'
    const basePERLURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/emergency-locations?perPage=1000'
    const baseWaitingPeriod = 250

    const fetchLE = async (extension: Extension) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const newExtension = await fetchBaseData(extension, accessToken)
        if (!newExtension) {
            postMessage(new Message(`Failed to fetch base data for ${extension.data.name}`, 'error'))
            postError(new SyncError(extension.data.name, extension.data.extensionNumber, ['Failed to fetch base data', '']))
            return
        }
        let bundle = new LimitedExtensionDataBundle(newExtension)

        await fetchDevices(bundle, accessToken)
        await fetchDirectNumbers(bundle, accessToken)
        await fetchBusinessHoursCallHandling(bundle, accessToken)
        await fetchPERLs(bundle, accessToken)

        for (let i = 0; i < bundle.extendedData!.businessHoursCallHandling!.greetings.length; i++) {
            if (bundle.extendedData?.businessHoursCallHandling?.greetings[i].custom) {
                const url = await getCustomGreetingURL(bundle, bundle.extendedData.businessHoursCallHandling.greetings[i].custom!.id, accessToken)
                if (!url) continue
                const data = await getCustomGreetingData(bundle, url![0], accessToken)
                if (!data) continue
                bundle.extendedData.businessHoursCallHandling.greetings[i].custom!.data = data
                bundle.extendedData.businessHoursCallHandling.greetings[i].custom!.contentType = url![1]
            }
        }

        return bundle
    }

    const fetchBaseData = async (extension: Extension, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseDataURL.replace('extensionId', `${extension.data.id}`), headers)
            const newExtension = new Extension(response.data)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return newExtension
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get base data`)
            console.log(e)
            postMessage(new Message(`Failed to get base data for ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to fetch base data', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchDevices = async (userDataBundle: LimitedExtensionDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseDevicesURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            userDataBundle.extendedData = {
                devices: response.data.records
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
            console.log(`Failed to get devices`)
            console.log(e)
            postMessage(new Message(`Failed to get devices for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch devices', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchDirectNumbers = async (userDataBundle: LimitedExtensionDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(basePhoneNumbersURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            const numbers = response.data.records as PhoneNumber[]
            const deviceNumbers = userDataBundle.extendedData!.devices!.map((device) => device.phoneLines[0].phoneInfo.phoneNumber)
            const nonDeviceNumbers = numbers.filter((number) => !deviceNumbers.includes(number.phoneNumber))
            const directNumbers = nonDeviceNumbers.filter((number) => !number.extension)

            userDataBundle.extendedData!.directNumbers = directNumbers
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get direct numbers`)
            console.log(e)
            postMessage(new Message(`Failed to get direct numbers for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch direct numbers', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchBusinessHoursCallHandling = async (bundle: LimitedExtensionDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCallHandlingURL.replace('extensionId', `${bundle.extension.data.id}`).replace('ruleId', 'business-hours-rule'), headers)
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
            postMessage(new Message(`Failed to get business hours call handling for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to fetch business hours call handling', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchPERLs = async (userDataBundle: LimitedExtensionDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(basePERLURL.replace('extensionId', `${userDataBundle.extension.data.id}`), headers)
            const responseLocations = response.data.records as PERL[]
            const personalResponseLocations = responseLocations.filter((erl) => erl.visibility === 'Private')
            userDataBundle.extendedData!.pERLs = personalResponseLocations
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get PERLs`)
            console.log(e)
            postMessage(new Message(`Failed to get PERLs for ${userDataBundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(userDataBundle.extension.data.name, parseInt(userDataBundle.extension.data.extensionNumber), ['Failed to fetch PERLs', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const getCustomGreetingURL = async (bundle: LimitedExtensionDataBundle, greetingID: string, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseCustomGreetingURL.replace('extensionId', `${bundle.extension.data.id}`).replace('greetingId', greetingID), headers)
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return [response.data.contentUri, response.data.contentType]
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get custom greeting URL`)
            console.log(e)
            postMessage(new Message(`Failed to get custom greeting URL for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to get custom greeting URL', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const getCustomGreetingData = async (bundle: LimitedExtensionDataBundle, url: string, token: string) => {
        try {
            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            
            const buffer = await res.arrayBuffer()

            return buffer
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get custom greeting URL`)
            console.log(e)
            postMessage(new Message(`Failed to get custom greeting URL for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to get custom greeting URL', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {fetchLE}
}

export default useFetchLE