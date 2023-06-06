import { useState } from "react";
import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { MessageOnlyDataBundle } from "../models/MessageOnlyDataBundle";
import useFetchMOData from "./useFetchMOData";

const useFetchMOs = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {fetchMOData} = useFetchMOData(postMessage, postTimedMessage, postError)

    const fetchMOs = async (extensions: Extension[]) => {
        const dataBundles: MessageOnlyDataBundle[] = []

        setMaxProgress(extensions.length)

        for (const extension of extensions) {
            const bundle = await fetchMOData(extension)
            if (bundle) dataBundles.push(bundle)
            setProgressValue((prev) => prev + 1)
        }

        return dataBundles
    }

    return {fetchMOs, progressValue, maxProgress}
}

export default useFetchMOs