import { wait } from "../../../../helpers/rcapi";
import { Extension } from "../../../../models/Extension";
import { Message } from "../../../../models/Message";
import { SyncError } from "../../../../models/SyncError";
import { RestCentral } from "../../../../rcapi/RestCentral";

export const usePresense = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseUrl = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/presence/line'
    const baseWaitingPeriod = 250

    const setPresense = async (requestBody: PresenseLineItem[], extension: Extension) => {
        try {
            const token = localStorage.getItem('cs_access_token')
            if (!token) {
                postMessage(new Message('An unexpected error occurred. No access token was found', 'error'))
                return
            }

            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const res = await RestCentral.put(baseUrl.replaceAll('extensionId', `${extension.data.id}`), headers, requestBody)

            if (res.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${res.rateLimitInterval / 1000} seconds`, 'info'), res.rateLimitInterval)
            }
            
            res.rateLimitInterval > 0 ? await wait(res.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            postMessage(new Message(`Failed to set presense for user ${extension.data.name} - Ext. ${extension.data.extensionNumber}`, 'error'))
            postError(new SyncError(extension.data.name, extension.data.extensionNumber, ['Failed to set presense', '']))
        }
    }

    const generateRequestBody = (parkLocationIds: (string | number)[], startingLine: number) => {
        const records: PresenseLineItem[] = []
        let currentLine = startingLine

        for (const id of parkLocationIds) {
            records.push({
                id: `${currentLine}`,
                extension: {
                    id: `${id}`
                }
            })

            currentLine += 1
        }

        return records
    }

    return { setPresense, generateRequestBody }
}

type PresenseLineItem = {
    id: string
    extension: {
        id: string
    }
}