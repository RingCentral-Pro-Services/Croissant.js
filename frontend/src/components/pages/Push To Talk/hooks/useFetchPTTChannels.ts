import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { PTTChannel, PTTChannelData } from "../models/PTTChannel"

const useFetchPTTChannels = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, callback: (channels: PTTChannel[]) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/push-to-talk/channels'
    const baseWaitingPeriod = 250

    const fetchChannels = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const channels: PTTChannel[] = []
        await getChannels(channels, accessToken)
        console.log('Channels')
        console.log(channels)
        callback(channels)
    }

    const getChannels = async (channels: PTTChannel[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseURL
            const response = await RestCentral.get(url, headers)
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            const fetchedChannels = response.data.records as PTTChannelData[]
            for (const channel of fetchedChannels) {
                channels.push(new PTTChannel(channel))
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to fetch push-to-talk channels`)
            console.log(e)
            postMessage(new Message(`Failed to make fetch push-to-talk channels`, 'error'))
            postError(new SyncError('', 0, ['Failed to fetch push-to-talk channels', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {fetchChannels}
}

export default useFetchPTTChannels