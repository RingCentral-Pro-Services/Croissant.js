import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { Timezone } from "../../../../../models/Timezone";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { PhoneNumber, UserDataBundle } from "../../User Data Download/models/UserDataBundle";

const useMigrateUser = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, isCrossRegion: boolean) => {
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'
    const baseVirtualUserURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const basePhoneNumbersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/phone-number'
    const baseNumberAssignURL = 'https://platform.ringcentral.com/restapi/v2/accounts/~/phone-numbers/phoneNumberId'
    const basePhoneNumberURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/phone-number/phoneNumberId'
    const baseWaitingPeriod = 250

    const migrateUser = async (dataBundle: UserDataBundle, phoneNumbers: PhoneNumber[], timezones: Timezone[], extensionIDs?: string[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        // The API doesn't let you set hidden field and will emit an error if you try
        delete dataBundle.extension.data.hidden
        adjustTimeZone(dataBundle, timezones)

        if (!extensionIDs) {
            // This is a virtual user
            await createUnlicensedUser(dataBundle, accessToken)
        }
        
        else {
            // This is a licensed user
            await createLicensedUser(dataBundle, extensionIDs[0], accessToken)
            for (let i = 1; i < extensionIDs.length; i++) {
                await addDigitalLine(dataBundle, extensionIDs[i], accessToken)
            }
        }

        for (const phoneNumber of phoneNumbers) {
            await assignPhoneNumber(dataBundle, phoneNumber.id, accessToken)
        }
    }

    const adjustTimeZone = (bundle: UserDataBundle, timezones: Timezone[]) => {
        if (!bundle.extension.data.regionalSettings) return

        const originalTimeZone = bundle.extension.data.regionalSettings.timezone
        const newTimeZone = timezones.find((timeZone) => timeZone.name === originalTimeZone.name && timeZone.bias === originalTimeZone.bias)

        if (newTimeZone) {
            bundle.extension.data.regionalSettings.timezone.id = newTimeZone.id
        }

        if (bundle.extension.data.regionalSettings.timezone.id === "51") {
            // Deprecated eastern time
            bundle.extension.data.regionalSettings.timezone.id = "96"
        }
        else if (bundle.extension.data.regionalSettings.timezone.id === "58") {
            // Deprecated pacific time
            bundle.extension.data.regionalSettings.timezone.id = "101"
        }
        else if (bundle.extension.data.regionalSettings.timezone.id === "53") {
            // Deprecated central time
            bundle.extension.data.regionalSettings.timezone.id = "98"
        }
        else if (bundle.extension.data.regionalSettings.timezone.id === "57") {
            // Deprecated mountain time
            bundle.extension.data.regionalSettings.timezone.id = "100"
        }
    }

    const createUnlicensedUser = async (bundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            bundle.extension.data.subType = 'VirtualUser'
            if (bundle.extension.data.extensionNumber === '0') {
                postMessage(new Message(`Next available extension used for ${bundle.extension.data.name} because zero cannot be used`, 'warning'))
                postError(new SyncError(bundle.extension.data.name, '0', ['Extension number changed', '']))
            }
            const response = await RestCentral.post(baseVirtualUserURL, headers, bundle.extension.payload(true, !isCrossRegion))
            bundle.extension.data.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            // bundle.hasEncounteredFatalError = true
            // console.log(`Failed to create user`)
            // console.log(e)
            // postMessage(new Message(`Failed to create user ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            // postError(new SyncError('', 0, ['Failed to create user', bundle.extension.data.name], e.error ?? ''))
            await retryUnlicensedUser(bundle, token)
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const retryUnlicensedUser = async (bundle: UserDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            bundle.extension.data.subType = 'VirtualUser'
            if (bundle.extension.data.extensionNumber === '0') {
                postMessage(new Message(`Next available extension used for ${bundle.extension.data.name} because zero cannot be used`, 'warning'))
                postError(new SyncError(bundle.extension.data.name, '0', ['Extension number changed', '']))
            }
            const response = await RestCentral.post(baseVirtualUserURL, headers, bundle.extension.payloadWithoutExtension(true, !isCrossRegion))
            bundle.extension.data.id = response.data.id
            bundle.tempExtension = response.data.extensionNumber

            postMessage(new Message(`${bundle.extension.data.name} was created with the next available extension number: ${bundle.tempExtension}`, 'warning'))

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            bundle.hasEncounteredFatalError = true
            console.log(`Failed to create user`)
            console.log(e)
            postMessage(new Message(`Failed to create user ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to create user', bundle.extension.data.name], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const createLicensedUser = async (bundle: UserDataBundle, id: string, token: string) => {
        console.log(`Creating user from unassigned ext with ID: ${id}`)
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.put(baseUpdateURL.replace('extensionId', id), headers, bundle.extension.payload(true, !isCrossRegion))
            bundle.extension.data.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            // postMessage(new Message(`Failed to create user ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            // postError(new SyncError('', 0, ['Failed to create user', bundle.extension.data.name], e.error ?? ''))
            await retryLicensedUser(bundle, id, token)
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const retryLicensedUser = async (bundle: UserDataBundle, id: string, token: string) => {
        console.log(`Creating user from unassigned ext with ID: ${id}`)
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.put(baseUpdateURL.replace('extensionId', id), headers, bundle.extension.payloadWithoutExtension(true, !isCrossRegion))
            bundle.extension.data.id = response.data.id
            bundle.tempExtension = response.data.extensionNumber
            
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            bundle.hasEncounteredFatalError = true
            console.log(`Failed to create user`)
            console.log(e)
            postMessage(new Message(`Failed to create user ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to create user', bundle.extension.data.name], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const addDigitalLine = async (bundle: UserDataBundle, extensionID: string, token: string) => {
        const phoneNumber = await getPhoneNumberID(extensionID, token)
        if (!phoneNumber) {
            return
        }
        
        await assignDL(bundle, phoneNumber.id, token)
    }

    const getPhoneNumberID = async (extensionID: string, token: string) => {
        console.log(`Pulling phone numbers for unassigned ext with ID: ${extensionID}`)
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(basePhoneNumbersURL.replace('extensionId', extensionID), headers)
            const id = response.data.records.find((record: any) => record.usageType === 'DirectNumber' && !record.extension) as PhoneNumber

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
            return id
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to create user`)
            console.log(e)
            postMessage(new Message(`Failed to get phone number ID ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to get phone number ID', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const assignPhoneNumber = async (bundle: UserDataBundle, phoneNumberID: string, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const body = {
                usageType: 'DirectNumber',
                extension: {
                    id: bundle.extension.data.id
                }
            }
            const response = await RestCentral.patch(baseNumberAssignURL.replace('phoneNumberId', phoneNumberID), headers, body)
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to assign additional number`)
            console.log(e)
            postMessage(new Message(`Failed to assign additional number ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to assign additional number', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const assignDL = async (bundle: UserDataBundle, phoneNumberID: string, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const body = {
                usageType: 'DirectNumber',
                extension: {
                    id: bundle.extension.data.id
                }
            }
            const response = await RestCentral.put(basePhoneNumberURL.replace('phoneNumberId', phoneNumberID), headers, body)
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to assign additional DL`)
            console.log(e)
            postMessage(new Message(`Failed to assign additional DL ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to assign additional DL', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {migrateUser}
}

export default useMigrateUser