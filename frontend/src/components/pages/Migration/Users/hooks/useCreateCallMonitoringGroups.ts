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
            try {
                await createMonitoringGroup(group, originalExtensions, targetExtensions)
            }
            catch (e: any) {
                postMessage(new Message(`Something went wrong creating Call Monitoring Group ${group.data.name}`, 'error'))
                postError(new SyncError(group.data.name, "", ['Unexepected error creating Call Monitoring Group', e.message], undefined, group))
            }
            setProgressValue((prev) => prev + 1)
        }
    }

    return {createMonitoringGroups, progressValue, maxProgress}
}

export default useCreateCallMonitoringGroups