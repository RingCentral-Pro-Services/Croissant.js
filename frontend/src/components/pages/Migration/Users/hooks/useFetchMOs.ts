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

        setProgressValue(0)
        setMaxProgress(extensions.length)

        for (const extension of extensions) {
            try {
                const bundle = await fetchMOData(extension)
                if (bundle) dataBundles.push(bundle)
            }
            catch (e: any) {
                postMessage(new Message(`Something went wrong fetching Message-Only or Announcement-Only ${extension.data.name}`, 'error'))
                postError(new SyncError(extension.data.name, extension.data.extensionNumber, ['Unexepected error fetching MO / AO', e.message], undefined, extension))
            }
            setProgressValue((prev) => prev + 1)
        }

        return dataBundles
    }

    return {fetchMOs, progressValue, maxProgress}
}

export default useFetchMOs