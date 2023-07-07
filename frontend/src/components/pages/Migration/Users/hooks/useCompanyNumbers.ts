import { wait } from "../../../../../helpers/rcapi"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { Device, PhoneNumber } from "../../User Data Download/models/UserDataBundle"

interface CompanyNumberResponse {
    numbers: PhoneNumber[]
    hasNextPage: boolean
}

const useCompanyNumbers = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/phone-number?perPage=1000&Page=PAGE'
    const baseWaitingPeriod = 250

    const fetchCompanyNumbers = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const numbers: PhoneNumber[] = []
        let nextPage = true
        let page = 1
        while (nextPage) {
            const response = await getDevices(page, accessToken)
            numbers.push(...response.numbers)
            if (response.hasNextPage) {
                nextPage = true
                page += 1
            }
            else {
                nextPage = false
            }
        }

        return numbers
    }

    const getDevices = async (page: number, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.get(baseURL.replace('PAGE', `${page}`), headers)
            const numbers = response.data.records as PhoneNumber[]
            let hasNextPage = false
            if (response.data.navigation?.nextPage) hasNextPage = true
            const deviceResponse: CompanyNumberResponse = {
                numbers: numbers,
                hasNextPage: hasNextPage
            }


            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return deviceResponse
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get company numbers`)
            console.log(e)
            postMessage(new Message(`Failed to get company numbers ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to get company numbers', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return {
                numbers: [],
                hasNextPage: false
            }
        }
    }

    return {fetchCompanyNumbers}
}

export default useCompanyNumbers