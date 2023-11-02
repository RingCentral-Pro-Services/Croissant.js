import { useState } from "react"
import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import useFetchUserData from "../../User Data Download/hooks/useFetchUserData"
import { UserDataBundle } from "../../User Data Download/models/UserDataBundle"
import { LimitedExtensionDataBundle } from "../models/LimitedExtensionDataBundle"
import useFetchLE from "./useFetchLE"

const useFetchLEs = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {

    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {fetchLE} = useFetchLE(postMessage, postTimedMessage, postError)

    const fetchLEs = async (extensions: Extension[]) => {
        const dataBundles: LimitedExtensionDataBundle[] = []
        setProgressValue(0)

        setMaxProgress(extensions.length)
        for (const extension of extensions) {
            const bundle = await fetchLE(extension)
            if (bundle) {
                dataBundles.push(bundle)
            }
            setProgressValue((prev) => prev + 1)
        }

        return dataBundles
    }

    return {fetchLEs, progressValue, maxProgress}

}

export default useFetchLEs