import React, { useEffect, useState } from "react";
import rateLimit from "../helpers/rateLimit";
import AmazonPollyPrompt from "../models/AmazonPollyPrompt";
import { Message } from "../models/Message";
import { SyncError } from "../models/SyncError";
const axios = require('axios').default;

const useUploadAudioPrompts = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [shouldUpload, setShouldUpload] = useState(false)
    const [isAudioPromptUploadPending, setIsPending] = useState(true)
    const [prompts, setPrompts] = useState<AmazonPollyPrompt[]>([])
    const [currentItemIndex, setCurrentItemIndex] = useState(0)
    const [rateLimitInterval, setRateLimitInterval] = useState(0)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/ivr-prompts'

    const uploadPrompts = (prompts: AmazonPollyPrompt[]) => {
        setPrompts(prompts)
        setShouldUpload(true)
        setCurrentItemIndex(0)
        setRateLimitInterval(0)
        setIsPending(true)
    }

    useEffect(() => {
        if (!shouldUpload) return
        if (currentItemIndex >= prompts.length) {
            setIsPending(false)
            return
        }
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) return

        setTimeout( async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${accessToken}`
                }
                let formData = new FormData()
                formData.append('name', prompts[currentItemIndex].name)
                formData.append('attachment', prompts[currentItemIndex].data!, prompts[currentItemIndex].name)

                axios({
                    method: "POST",
                    url: baseURL,
                    headers: headers,
                    data: formData
                })
                .then((res: any) => {
                    console.log(res)
                    const interval = rateLimit(res.headers)
                    if (interval > 0) postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                    setRateLimitInterval(interval)
                    setCurrentItemIndex(currentItemIndex + 1)
                })
                .catch((e: any) => {
                    console.log('Error uploading prompt')
                    postMessage(new Message(`Failed to upload audio prompt '${prompts[currentItemIndex].name}'`, 'error'))
                    postError(new SyncError(prompts[currentItemIndex].name, 0, ['Failed to upload audio prompt', ''], e.response.data.message))
                    console.log(e)
                })
                .finally(() => {
                    setProgressValue(currentItemIndex)
                })

            }
            catch(e: any) {
                console.log('Something went wrong')
            }
        }, rateLimitInterval)
    }, [rateLimitInterval, currentItemIndex, prompts])

    return {uploadPrompts, isAudioPromptUploadPending}
}

export default useUploadAudioPrompts