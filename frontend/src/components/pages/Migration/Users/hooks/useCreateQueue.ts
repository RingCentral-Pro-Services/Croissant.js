import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { PhoneNumber } from "../../User Data Download/models/UserDataBundle";
import { CallQueueDataBundle } from "../models/CallQueueDataBundle";

const useCreateQueue = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseVirtualUserURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const baseNumberAssignURL = 'https://platform.ringcentral.com/restapi/v2/accounts/~/phone-numbers/phoneNumberId'
    const baseWaitingPeriod = 250

    const createQueue = async (bundle: CallQueueDataBundle, availablePhoneNumbers: PhoneNumber[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await createExtension(bundle, accessToken)
        for (const phoneNumber of availablePhoneNumbers) {
            await assignPhoneNumber(bundle, phoneNumber.id, accessToken)
        }
    }

    const createExtension = async (bundle: CallQueueDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.post(baseVirtualUserURL, headers, bundle.extension.payload(true))
            bundle.extension.data.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to create call queue`)
            console.log(e)
            postMessage(new Message(`Failed to create call queue ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to create call queue', bundle.extension.data.name], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const assignPhoneNumber = async (bundle: CallQueueDataBundle, phoneNumberID: string, token: string) => {
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
            postMessage(new Message(`Failed to get phone number ID ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to get phone number ID', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }


    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {createQueue}
}

export default useCreateQueue