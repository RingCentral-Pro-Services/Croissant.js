import CallQueue from "../../../../models/CallQueue"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useCallQueue = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, isMultiSiteEnabled: boolean, callback: () => void) => {
    const createURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId/bulk-assign'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/business-hours-rule'

    const createCallQueue = async (queue: CallQueue) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await makeQueue(queue, accessToken)
        await addQueueMembers(queue, accessToken)
        await setCallHandling(queue, accessToken)
        await setGreetings(queue, accessToken)
        console.log('Finished creating call queue')
        callback()
    }

    const makeQueue = async (queue: CallQueue, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.post(createURL, headers, queue.createPayload(isMultiSiteEnabled))
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            queue.extension.id = response.data.id
            await wait(response.rateLimitInterval)
            console.log(response)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to make queue ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to make queue ${queue.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to create queue', ''], e.error ?? ''))
        }
    }

    const addQueueMembers = async (queue: CallQueue, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = baseUpdateURL.replace('groupId', `${queue.extension.id}`)
            const body = {addedExtensionIds: queue.members}
            const response = await RestCentral.post(url, headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            await wait(response.rateLimitInterval)
            console.log(response)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to add queue members ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to add queue members ${queue.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to add queue members', ''], e.error ?? ''))
        }
    }

    const setCallHandling = async (queue: CallQueue, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = baseCallHandlingURL.replace('extensionId', `${queue.extension.id}`)
            const response = await RestCentral.put(url, headers, queue.payload())

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            await wait(response.rateLimitInterval)
            console.log(response)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to set call handling for ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to set call handling ${queue.extension.name}. ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to set call handling', ''], e.error ?? ''))
        }
    }

    const setGreetings = async (queue: CallQueue, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const url = baseCallHandlingURL.replace('extensionId', `${queue.extension.id}`)
            let body = {
                greetings: queue.greetings
            }
            const response = await RestCentral.put(url, headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            await wait(response.rateLimitInterval)
            console.log(response)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }

            console.log(`Failed to set greetings for ${queue.extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to set greetings ${queue.extension.name}. ${e.error ?? ''}`, 'error'))
            postError(new SyncError(queue.extension.name, queue.extension.extensionNumber, ['Failed to set greetings', ''], e.error ?? ''))
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {createCallQueue}
}

export default useCallQueue