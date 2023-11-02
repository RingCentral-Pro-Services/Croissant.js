import { useState } from "react"
import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { CallQueueDataBundle } from "../models/CallQueueDataBundle"
import useFetchCallQueue from "./useFetchCallQueue"

const useFetchCallQueues = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {fetchCallQueue} = useFetchCallQueue(postMessage, postTimedMessage, postError)

    const fetchCallQueues = async (extensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setProgressValue(0)
        setMaxProgress(extensions.length)
        const bundles: CallQueueDataBundle[] = []
        for (const extension of extensions) {
            const bundle = new CallQueueDataBundle(extension)
            bundles.push(bundle)
        }

        for (let i = 0; i < bundles.length; i++) {
            await fetchCallQueue(bundles[i])
            setProgressValue((prev) => prev + 1)
        }

        return bundles
    }

    return {fetchCallQueues, progressValue, maxProgress}
}

export default useFetchCallQueues