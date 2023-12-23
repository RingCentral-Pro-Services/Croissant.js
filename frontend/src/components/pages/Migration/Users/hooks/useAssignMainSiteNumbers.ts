import { useState } from "react"
import { wait } from "../../../../../helpers/rcapi"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { PhoneNumber } from "../../User Data Download/models/UserDataBundle"
import { SiteDataBundle } from "../models/SiteDataBundle"

const useAssignMainSiteNumbers = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const baseNumberAssignURL = 'https://platform.ringcentral.com/restapi/v2/accounts/~/phone-numbers/phoneNumberId'
    const baseWaitingPeriod = 250
    
    const assignMainSiteNumbers = async (bundle: SiteDataBundle, availablePhoneNumbers: PhoneNumber[], availableTollFreeNumbers: PhoneNumber[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setMaxProgress(bundle.extendedData!.directNumbers!.length)
        bundle.phoneNumberMap = new Map<string, PhoneNumber>()

        for (const number of bundle.extendedData!.directNumbers!) {
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
            bundle.phoneNumberMap.set(number.phoneNumber, tempNumber)

            await assignPhoneNumber(bundle, tempNumber.id, accessToken)
            setProgressValue((prev) => prev + 1)
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
                usageType: 'CompanyNumber',
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
            postMessage(new Message(`Failed to assign phone number to main site ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.name, bundle.extension.extensionNumber, ['Failed to assign number to main site', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {assignMainSiteNumbers, progressValue, maxProgress}
}

export default useAssignMainSiteNumbers