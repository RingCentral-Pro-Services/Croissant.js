import { wait } from "../helpers/rcapi";
import { Extension } from "../models/Extension";
import { Message } from "../models/Message";
import { SyncError } from "../models/SyncError";
import { RestCentral } from "./RestCentral";

export const useDeleteExtension = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseExtensionURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const baseWaitingPeriod = 250

    const deleteExtension = async (extension: Extension) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await deleteExt(extension, accessToken)
    }

    const deleteExt = async (extension: Extension, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.delete(`${baseExtensionURL}/${extension.data.id}`, headers)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            postMessage(new Message(`Failed to set delete original call queue ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, 0, ['Failed to detele extension', ''], e.error ?? ''))            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {deleteExtension}
}