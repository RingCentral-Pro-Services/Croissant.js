import { useState } from "react";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { IVRAudioPrompt } from "../models/IVRPrompt";
import useFetchPromptContent from "./useFetchPromptContent";

const useFetchAudioPrompts = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {fetchPromptContent} = useFetchPromptContent(postMessage, postTimedMessage, postError)

    const fetchAudioPrompts = async (prompts: IVRAudioPrompt[]) => {
        setProgressValue(0)
        setMaxProgress(prompts.length)
        for (let i = 0; i < prompts.length; i++) {
            await fetchPromptContent(prompts[i])
            setProgressValue((prev) => prev + 1)
        }
    }

    return {fetchAudioPrompts, progressValue, maxProgress}
}

export default useFetchAudioPrompts