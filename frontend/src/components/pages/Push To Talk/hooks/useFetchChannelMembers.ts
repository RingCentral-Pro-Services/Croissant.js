import { Extension } from "../../../../models/Extension"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { PTTChannel, PTTChannelMember } from "../models/PTTChannel"

const useFetchChannelMembers = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, callback: (channels: PTTChannel) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/push-to-talk/channels/channelID'
    const baseWaitingPeriod = 250

    const fetchMembers = async (channel: PTTChannel, extensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }
        
        await getMembers(channel, extensions, accessToken)
        callback(channel)
    }

    const getMembers = async (channel: PTTChannel, extensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseURL.replace('channelID', channel.data.id)
            const response = await RestCentral.get(url, headers)
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            const membersIDs = response.data.members as PTTChannelMember[]
            const members = translateMembers(membersIDs, extensions)
            channel.data.members = members

            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to fetch push-to-talk channel members`)
            console.log(e)
            postMessage(new Message(`Failed to make fetch push-to-talk channels`, 'error'))
            postError(new SyncError('', 0, ['Failed to fetch push-to-talk channels', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const translateMembers = (memberIDs: PTTChannelMember[], extensions: Extension[]) => {
        const members: PTTChannelMember[] = []

        for (const memberID of memberIDs) {
            const user = extensions.find((extension) => `${extension.data.id}` === `${memberID.extensionId}`)
            if (!user) continue
            const member: PTTChannelMember = {
                extensionId: user?.data.extensionNumber
            }
            members.push(member)
        }

        return members
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {fetchMembers}
}

export default useFetchChannelMembers