import { AmazonPollyPrompt } from '../models/AmazonPollyPrompt'
import { RestCentral } from "../../../../rcapi/RestCentral"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"

const useCreatePrompt = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, callback: (prompt: AmazonPollyPrompt) => void) => {
    const url = process.env.REACT_APP_AWS_POLLY_URL ?? ''

    const createPrompt = async (prompt: AmazonPollyPrompt) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await generateAudio(prompt, accessToken)
        callback(prompt)
    }

    const generateAudio = async (prompt: AmazonPollyPrompt, token: string) => {
        try {
            // Make a put request to the API using fetch
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg',
                },
                body: JSON.stringify({
                    prompt: prompt.text,
                    sampleRate: "24000"
                }),
            })
            // Set the prompt's audio to the response
            prompt.data = await response.blob()
        }
        catch (e: any) {
            console.log(`Failed to generate audio for ${prompt.name}`)
            console.log(e)
            postMessage(new Message(`Failed to generate audio for ${prompt.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(prompt.name, 0, ['Failed to fetch members', ''], e.error ?? '', prompt))
        }
    }

    return {createPrompt}
}

export default useCreatePrompt