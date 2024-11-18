import { useState } from "react"
import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { CallQueueDataBundle } from "../models/CallQueueDataBundle"
import useConfigureQueue from "./useConfigureQueue"

const useConfigureQueues = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, emailSuffix: string) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {configureQueue} = useConfigureQueue(postMessage, postTimedMessage, postError, emailSuffix)

    const configureQueues = async (bundles: CallQueueDataBundle[], originalExtensions: Extension[], targetExtensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setMaxProgress(bundles.length)
        for (const bundle of bundles) {
            try {
                await configureQueue(bundle, originalExtensions, targetExtensions)
            }
            catch (e: any) {
                postMessage(new Message(`Something went wrong configuring Queue ${bundle.extension.data.name}`, 'error'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Unexepected error configuring Queue', e.message], undefined, bundle))
            }
            setProgressValue((prev) => prev + 1)
        }
    }

    return {configureQueues, progressValue, maxProgress}
}

export default useConfigureQueues