import { useState } from "react"
import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { IVRDataBundle } from "../models/IVRDataBundle"
import useFetchIVR from "./useFetchIVR"

const useFetchIVRs = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {fetchIVR} = useFetchIVR(postMessage, postTimedMessage, postError)

    const fetchIVRs = async (extensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setProgressValue(0)
        setMaxProgress(extensions.length)
        const bundles: IVRDataBundle[] = []
        for (const extension of extensions) {
            const bundle = new IVRDataBundle(extension)
            bundles.push(bundle)
        }

        for (let i = 0; i < bundles.length; i++) {
            try {
                await fetchIVR(bundles[i])
            }
            catch (e: any) {
                postMessage(new Message(`Something went wrong fetching IVR ${bundles[i].extension.data.name}`, 'error'))
                postError(new SyncError(bundles[i].extension.data.name, bundles[i].extension.data.extensionNumber, ['Unexepected error fetching IVR', e.message], undefined, bundles[i]))
            }
            setProgressValue((prev) => prev + 1)
        }

        return bundles
    }

    return {fetchIVRs, progressValue, maxProgress}
}

export default useFetchIVRs