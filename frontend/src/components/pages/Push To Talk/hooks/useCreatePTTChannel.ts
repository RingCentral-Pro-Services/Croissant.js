import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { PTTChannel } from "../models/PTTChannel"

const useCreatePTTChannel = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, callback: () => void) => {
    const baseCreateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/push-to-talk/channels'
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/push-to-talk/channels/channelId'
    const baseWaitingPeriod = 250

    const createPTTChannel = async (channel: PTTChannel) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        if (channel.data.id) {
            await updateChannel(channel, accessToken)
        }
        else {
            await makeChannel(channel, accessToken)
        }
        callback()
    }

    const makeChannel = async (channel: PTTChannel, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.post(baseCreateURL, headers, channel.payload())

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to make channel ${channel.data.name}`)
            console.log(e)
            postMessage(new Message(`Failed to make push to talk channel ${channel.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(channel.data.name, 0, ['Failed to create push to talk channel', ''], e.error ?? '', channel))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const updateChannel = async (channel: PTTChannel, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseUpdateURL.replace('channelId', channel.data.id!)
            const response = await RestCentral.patch(url, headers, channel.payload())

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to update user group ${channel.data.name}`)
            console.log(e)
            postMessage(new Message(`Failed to update push to talk channel ${channel.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(channel.data.name, 0, ['Failed to pdate push to talk channel', ''], e.error ?? '', channel))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return { createPTTChannel }
}

export default useCreatePTTChannel