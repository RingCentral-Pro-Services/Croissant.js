import { wait } from "../../../../../helpers/rcapi"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { IVRAudioPrompt } from "../models/IVRPrompt"

const useFetchPromptContent = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {    
    const baseWaitingPeriod = 250

    const fetchPromptContent = async (prompt: IVRAudioPrompt) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await getContent(prompt, accessToken)
    }

    const getContent = async (prompt: IVRAudioPrompt, token: string) => {
        try {
            const res = await fetch(prompt.contentUri, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            const buffer = await res.arrayBuffer()
            prompt.content = buffer

            const rateLimitInterval = res.headers.get('X-Rate-Limit-Remaining')

            if (!rateLimitInterval) {
                console.log('Should be waiting 5 seconds')
                await wait(5000)
                return
            }
            const remainingRequests = parseInt(rateLimitInterval)

            if (remainingRequests === 1) {
                console.log('Should be posting message')
                postTimedMessage(new Message(`Rate limit reached. Waiting 60 seconds`, 'info'), 60000)
            }
            
            remainingRequests === 1 ? await wait(60000) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set get prompt content`)
            console.log(e)
            postMessage(new Message(`Failed to get prompt content ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to get promt content', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {fetchPromptContent}
}

export default useFetchPromptContent