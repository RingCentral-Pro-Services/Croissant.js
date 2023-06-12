import { useState } from "react";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { IVRAudioPrompt } from "../models/IVRPrompt";
import useUploadPrompt from "./useUploadPrompt";

const useUploadPromopts = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {uploadPrompt} = useUploadPrompt(postMessage, postTimedMessage, postError)

    const uploadPrompts = async (prompts: IVRAudioPrompt[]) => {
        setMaxProgress(prompts.length)
        const uploadedPrompts: IVRAudioPrompt[] = []
        const promptsCopy = [...prompts]

        for (let i = 0; i < promptsCopy.length; i++) {
            await uploadPrompt(promptsCopy[i])
            uploadedPrompts.push(promptsCopy[i])
            setProgressValue((prev) => prev + 1)
        }

        return uploadedPrompts
    }

    return {uploadPrompts, progressValue, maxProgress}
}

export default useUploadPromopts