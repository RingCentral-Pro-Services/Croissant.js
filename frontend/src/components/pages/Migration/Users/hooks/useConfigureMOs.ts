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
            try {
                await configureMO(bundle, originalExtensions, targetExtensions)
            }
            catch (e: any) {
                postMessage(new Message(`Something went wrong configuring Message-Only or Announcement-Only  ${bundle.extension.data.name}`, 'error'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Unexepected error configuring MO / AO', e.message], undefined, bundle))
            }
        }
    }

    return {configureMOs}
}

export default useConfigureMOs