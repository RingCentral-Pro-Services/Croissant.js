import { wait } from "../../../../helpers/rcapi"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { ExtensionCredentials } from "../models/ExtensionCredentials"

const useSetCredentials = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/credentials'

    const setCredentials = async (credentials: ExtensionCredentials) => {
        const token = localStorage.getItem('cs_access_token')

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const res = await RestCentral.put(baseURL.replace('extensionId', `${credentials.data.extension.data.id}`), headers, credentials.payload())
            console.log(res)
            res.rateLimitInterval > 0 ? await wait(res.rateLimitInterval) : await wait(250)

            if (credentials.data.extension.data.status !== 'Enabled') {
                await enableExtension(credentials)
            }
        }
        catch (e: any) {
            postMessage(new Message(`Failed to set credentials for extension ${credentials.data.extension.data.extensionNumber}. ${e.error}`, 'error'))
            postError(new SyncError(credentials.data.extension.data.name, credentials.data.extension.data.extensionNumber, ['Failed to set credentials', ''], e.error ?? '', credentials))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(250)
        }
    }

    const enableExtension = async (extension: ExtensionCredentials) => {
        const token = localStorage.getItem('cs_access_token')

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const res = await RestCentral.put(`https://platform.ringcentral.com/restapi/v1.0/account/~/extension/${extension.data.extension.data.id}`, headers, { status: 'Enabled' })
            console.log(res)
            res.rateLimitInterval > 0 ? await wait(res.rateLimitInterval) : await wait(250)
        }
        catch (e: any) {
            postMessage(new Message(`Failed to enable extension ${extension.data.extension.data.extensionNumber}. ${e.error}`, 'error'))
            postError(new SyncError(extension.data.extension.data.name, extension.data.extension.data.extensionNumber, ['Failed to enable extension', ''], e.error ?? '', extension))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(250)
        }
    }

    return { setCredentials }
}

export default useSetCredentials