import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { MessageOnlyDataBundle } from "../models/MessageOnlyDataBundle"
import useConfigureMO from "./useConfigureMO"

const useConfigureMOs = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, emailSuffix: string) => {
    const {configureMO} = useConfigureMO(postMessage, postTimedMessage, postError, emailSuffix)

    const configureMOs = async (bundles: MessageOnlyDataBundle[], originalExtensions: Extension[], targetExtensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        for (const bundle of bundles) {
            await configureMO(bundle, originalExtensions, targetExtensions)
        }
    }

    return {configureMOs}
}

export default useConfigureMOs