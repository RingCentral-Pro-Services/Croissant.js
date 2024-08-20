import { wait } from "../../../../../helpers/rcapi";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { CallRecordingDataBundle, CallRecordingExtension } from "../models/CallRecordingDataBundle";

const useFetchCallRecordingSettings = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseSettingsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-recording'
    const baseExtensionsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-recording/extensions'
    const baseWaitingPeriod = 250

    const fetchCallRecordingSettings = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const callRecordingSettings = await getCallRecordingSettings(accessToken)
        if (!callRecordingSettings) return
        await getCallRecordingExtensions(callRecordingSettings, accessToken)
        return callRecordingSettings
    }

    const getCallRecordingSettings = async (token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseSettingsURL, headers)
            const settings = response.data as CallRecordingDataBundle
            delete settings.onDemand.retentionPeriod
            delete settings.automatic.extensionCount
            delete settings.automatic.maxNumberLimit

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
            console.log(`Failed to get call recording settings`)
            console.log(e)
            postMessage(new Message(`Failed to get call recording settings. ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', '', ['Failed to fetch call recording settings', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const getCallRecordingExtensions = async (settings: CallRecordingDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseExtensionsURL, headers)
            settings.members = response.data.records as CallRecordingExtension[]

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get call recording extension`)
            console.log(e)
            postMessage(new Message(`Failed to get call recording extensions. ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', '', ['Failed to fetch call recording extensions', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {fetchCallRecordingSettings}
}

export default useFetchCallRecordingSettings