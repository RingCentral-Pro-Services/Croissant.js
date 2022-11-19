import { useEffect, useState } from "react";
import { RestCentral } from "./RestCentral";
import { AudioPrompt } from "../models/AudioPrompt";
import { Message } from "../models/Message";

const useGetAudioPrompts = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void) => {
    const [isAudioPromptListPending, setIsAudioPromptListPending] = useState(true)
    const [audioPromptList, setAudioPromptList] = useState<AudioPrompt[]>([])
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(false)
    const [rateLimitInterval, setRateLimitInterval] = useState(0)
    const baseUrl = 'https://platform.ringcentral.com/restapi/v1.0/account/~/ivr-prompts'
    const accessToken = localStorage.getItem('cs_access_token')

    const fetchAudioPrompts = () => {
        setAudioPromptList([])
        setShouldFetch(true)
        setIsAudioPromptListPending(true)
    }

    useEffect(() => {
        if (!shouldFetch) return
        if (!accessToken) return

        let pageURL = `${baseUrl}?page=${page}&perPage=100`

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
                let response = await RestCentral.get(pageURL, headers)
                console.log(response)
                setRateLimitInterval(response.rateLimitInterval)

                let prompts: AudioPrompt[] = []
                for (const record of response.data.records) {
                    const prompt = record
                    prompts.push(prompt)
                }
                setAudioPromptList(prev => [...prev, ...prompts])

                if (response.data.navigation.nextPage) {
                    setPage(page + 1)
                }
                else {
                    setIsAudioPromptListPending(false)
                    setShouldFetch(false)
                    setRateLimitInterval(0)
                    setPage(1)
                }
            }
            catch (e: any) {
                console.log('Failed to fetch audio prompts')
                postMessage(new Message('Failed to fetch audio prompts', 'error'))
                setRateLimitInterval(e.rateLimitInterval)
            }
        }, rateLimitInterval, page)
    })

    return {fetchAudioPrompts, audioPromptList, isAudioPromptListPending}

}

export default useGetAudioPrompts