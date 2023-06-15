import { useState } from "react";
import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { CallMonitoringDataBundle } from "../models/CallMonitoringDataBundle";
import useCreateCallMonitoringGroup from "./useCreateCallMonitoringGroup";

const useCreateCallMonitoringGroups = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {createMonitoringGroup} = useCreateCallMonitoringGroup(postMessage, postTimedMessage, postError)

    const createMonitoringGroups = async (groups: CallMonitoringDataBundle[], originalExtensions: Extension[], targetExtensions: Extension[]) => {
        setMaxProgress(groups.length)
        for (const group of groups) {
            await createMonitoringGroup(group, originalExtensions, targetExtensions)
            setProgressValue((prev) => prev + 1)
        }
    }

    return {createMonitoringGroups, progressValue, maxProgress}
}

export default useCreateCallMonitoringGroups