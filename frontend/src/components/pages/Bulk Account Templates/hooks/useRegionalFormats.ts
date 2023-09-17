import { wait } from "../../../../helpers/rcapi"
import { Message } from "../../../../models/Message"
import { RegionalFormat } from "../../../../models/RegionalFormat"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useRegionalFormats = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const url = 'https://platform.ringcentral.com/restapi/v1.0/dictionary/language'
    const baseWaitingPeriod = 250

    const fetchRegionalFormats = async () => {
        const token = localStorage.getItem('cs_access_token')
        if (!token) {
            console.log('No customer access token!')
            return []
        }

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(url, headers)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            const regionalFormats = response.data.records as RegionalFormat[]
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
            
            return regionalFormats
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get regional formats`)
            console.log(e)
            postMessage(new Message(`Failed to get regional formats`, 'error'))
            postError(new SyncError('', '', ['Failed to get members', ''], e.error ?? '',))
            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return []
        }
    }

    return {fetchRegionalFormats}
}

export default useRegionalFormats