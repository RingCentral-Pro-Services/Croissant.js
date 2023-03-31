import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { UserGroup } from "../models/UserGroup"

const useCreateUserGroup = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, callback: () => void) => {
    const baseCreateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/user-group'
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/user-group/groupID'
    const baseWaitingPeriod = 250

    const createUserGroup = async (group: UserGroup) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        if (group.data.id) {
            await updateGroup(group, accessToken)
        }
        else {
            await makeGroup(group, accessToken)
        }
        callback()
    }

    const makeGroup = async (group: UserGroup, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.post(baseCreateURL, headers, group.payload())

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to make user group ${group.data.displayName}`)
            console.log(e)
            postMessage(new Message(`Failed to make user group ${group.data.displayName} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(group.data.displayName, 0, ['Failed to create user group', ''], e.error ?? '', group))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const updateGroup = async (group: UserGroup, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseUpdateURL.replace('groupID', group.data.id!)
            const response = await RestCentral.put(url, headers, group.payload())

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to update user group ${group.data.displayName}`)
            console.log(e)
            postMessage(new Message(`Failed to update user group ${group.data.displayName} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(group.data.displayName, 0, ['Failed to update user group', ''], e.error ?? '', group))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return { createUserGroup }
}

export default useCreateUserGroup