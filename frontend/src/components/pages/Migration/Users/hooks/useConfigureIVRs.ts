import { useState } from "react"
import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { IVRDataBundle } from "../models/IVRDataBundle"
import useConfigureIVR from "./useConfigureIVR"

const useConfigureIVRs = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {configureIVR} = useConfigureIVR(postMessage, postTimedMessage, postError)

    const configureIVRs = async (bundles: IVRDataBundle[], originalExtensions: Extension[], targetExtensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setMaxProgress(bundles.length)
        for (const bundle of bundles) {
            await configureIVR(bundle, originalExtensions, targetExtensions, [], [])
            setProgressValue((prev) => prev + 1)
        }
    }

    return {configureIVRs, progressValue, maxProgress}
}

export default useConfigureIVRs