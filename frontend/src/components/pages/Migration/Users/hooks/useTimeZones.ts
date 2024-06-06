import { Timezone } from "../../../../../models/Timezone"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { wait } from "../../../../../helpers/rcapi"

export const useTimeZones = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseUrl = 'https://platform.ringcentral.com/restapi/v1.0/dictionary/timezone?page=1&perPage=1000'
    const baseWaitingPeriod = 250

    const fetchTimeZones = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
            const response = await RestCentral.get(baseUrl, headers)
            const timezones: Timezone[] = response.data.records
            console.log('Timezones')
            console.log(timezones)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return timezones
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            
            postMessage(new Message(`Failed to fetch timezones for new account. ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to fetch timezones for new account', ''], e.error ?? ''))

            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return []
        }

    }

    return { fetchTimeZones }
}