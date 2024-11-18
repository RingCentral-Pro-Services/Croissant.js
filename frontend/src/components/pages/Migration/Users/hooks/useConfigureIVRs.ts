import { useState } from "react"
import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { IVRDataBundle } from "../models/IVRDataBundle"
import { IVRAudioPrompt } from "../models/IVRPrompt"
import useConfigureIVR from "./useConfigureIVR"

const useConfigureIVRs = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {configureIVR} = useConfigureIVR(postMessage, postTimedMessage, postError)

    const configureIVRs = async (bundles: IVRDataBundle[], originalExtensions: Extension[], targetExtensions: Extension[], originalPrompts: IVRAudioPrompt[], targetPrompts: IVRAudioPrompt[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setMaxProgress(bundles.length)
        for (const bundle of bundles) {
            try {
                await configureIVR(bundle, originalExtensions, targetExtensions, originalPrompts, targetPrompts)
            }
            catch (e: any) {
                postMessage(new Message(`Something went wrong configuring IVR ${bundle.extension.data.name}`, 'error'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Unexepected error configuring IVR', e.message], undefined, bundle))
            }
            setProgressValue((prev) => prev + 1)
        }
    }

    return {configureIVRs, progressValue, maxProgress}
}

export default useConfigureIVRs