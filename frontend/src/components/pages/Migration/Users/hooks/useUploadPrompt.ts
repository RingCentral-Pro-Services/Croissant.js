import { wait } from "../../../../../helpers/rcapi";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { IVRAudioPrompt } from "../models/IVRPrompt";

const useUploadPrompt = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/ivr-prompts'
    const baseWaitingPeriod = 250

    const uploadPrompt = async (prompt: IVRAudioPrompt) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await postPrompt(prompt, accessToken)
    }

    const postPrompt = async (prompt: IVRAudioPrompt, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${token}`
            }

            const formData = new FormData()
            const filename = `${prompt.filename}`
            const file = new File([prompt.content], filename, {
                type: prompt.contentType === 'audio/mpeg' ? 'audio/mpeg' : 'audio/wav'
            })
            formData.append('name', file.name)
            formData.append('attachment', file, file.name)

            const response = await RestCentral.post(baseURL, headers, formData)
            prompt.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to upload audio prompt`)
            console.log(e)
            postMessage(new Message(`Failed to upload audio prompt ${e.error ?? ''}`, 'error'))
            postError(new SyncError(prompt.filename, 0, ['Failed to upload audio prompt', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {uploadPrompt}
}

export default useUploadPrompt