import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { AmazonPollyPrompt } from "../models/AmazonPollyPrompt"

const useUploadPrompt = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, callback: () => void) => {
    const url = 'https://platform.ringcentral.com/restapi/v1.0/account/~/ivr-prompts'
    const baseWaitingPeriod = 250

    const uploadPrompt = async (prompt: AmazonPollyPrompt) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await upload(prompt, accessToken)
        callback()
    }

    const upload = async (prompt: AmazonPollyPrompt, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${token}`
            }

            let formData = new FormData()
            formData.append('name', prompt.name)
            formData.append('attachment', prompt.data!, prompt.name)

            const response = await RestCentral.post(url, headers, formData)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to upload prompt '${prompt.name}'`)
            console.log(e)
            postMessage(new Message(`Failed to upload prompt '${prompt.name}.' ${e.error ?? ''}`, 'error'))
            postError(new SyncError(prompt.name, 0, ['Failed to upload prompt', ''], e.error ?? '', prompt))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return { uploadPrompt }
}

export default useUploadPrompt