import { wait } from "../../../../../helpers/rcapi"
import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { CallRecordingDataBundle, CallRecordingExtension } from "../models/CallRecordingDataBundle"

const useSetCallRecordingSettings = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseSettingsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-recording'
    const baseExtensionsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-recording/bulk-assign'
    const baseWaitingPeriod = 250

    const setCallRecordingSettings = async (settings: CallRecordingDataBundle, originalExtensions: Extension[], targetExtensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await setSettings(settings, accessToken)
        await setCallRecordingExtensions(settings, originalExtensions, targetExtensions, accessToken)
    }

    const setSettings = async (settings: CallRecordingDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                onDemand: settings.onDemand,
                ...(settings.automatic && settings.automatic.enabled && {automatic: settings.automatic})
            }

            const response = await RestCentral.put(baseSettingsURL, headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return settings
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set call recording settings`)
            console.log(e)
            postMessage(new Message(`Failed to set call recording settings. ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', '', ['Failed to set call recording settings', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setCallRecordingExtensions = async (settings: CallRecordingDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        if (!settings.members) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const goodExtensions: CallRecordingExtension[] = []
            const badExtensions: CallRecordingExtension[] = []

            for (const extension of settings.members) {
                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${extension.id}`)
                if (!originalExtension) {
                    badExtensions.push(extension)
                    continue
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
                if (!newExtension) {
                    badExtensions.push(extension)
                    continue
                }

                goodExtensions.push({id: `${newExtension.data.id}`, callDirection: extension.callDirection})
            }

            if (badExtensions.length !== 0) {
                postMessage(new Message(`Automatic call recording could not be enabled for ${badExtensions.length} extensions.`, 'warning'))
                postError(new SyncError('', '', ['Could not enable automatic call recording', badExtensions.map((ext) => ext.extensionNumber).join(', ')]))
            }

            const body = {
                addedExtensions: goodExtensions
            }

            const response = await RestCentral.post(baseExtensionsURL, headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return settings
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set call recording extensions`)
            console.log(e)
            postMessage(new Message(`Failed to set call recording extensions. ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', '', ['Failed to set call recording extensions', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {setCallRecordingSettings}
}

export default useSetCallRecordingSettings