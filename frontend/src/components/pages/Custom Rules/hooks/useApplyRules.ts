import { CustomRule } from "../../../../models/CustomRule"
import { Message } from "../../../../models/Message"
import RCExtension from "../../../../models/RCExtension"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useApplyRules = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, maintainVoicemailDestination: boolean, callback: () => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule'
    const baseWaitingPeriod = 250

    const applyRules = async (extension: RCExtension, rules: CustomRule[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        for (const rule of rules) {
            await apply(extension, rule, accessToken)
        }
        callback()
    }

    const apply = async (extension: RCExtension, rule: CustomRule, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseURL.replace('extensionId', `${extension.id}`)
            const payload = { ...rule }
            if (!maintainVoicemailDestination) payload!.voicemail!.recipient.id = extension.id
            if (payload?.callHandlingAction !== 'TakeMessagesOnly') delete payload?.voicemail
            if (payload?.callHandlingAction !== 'TransferToExtension') delete payload?.transfer
            if (payload.callHandlingAction === 'TransferToExtension') {
                if (extension.type !== 'Department') {
                    payload.voicemail = {
                        enabled: false,
                        recipient: {
                            id: extension.id
                        }
                    }
                }
            }
            if (payload.callHandlingAction === 'PlayAnnouncementOnly') {
                if (extension.type !== 'Department') {
                    payload.voicemail = {
                        enabled: false,
                        recipient: {
                            id: extension.id
                        }
                    }
                }
            }
            delete payload?.forwarding
            delete payload?.transfer?.uri
            delete payload?.id
            delete payload?.uri
            delete payload?.greetings
            delete payload?.queue
            const response = await RestCentral.post(url, headers, payload)
            console.log(response)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Pausing for ${response.rateLimitInterval / 1000} seconds...`, 'info'), response.rateLimitInterval)
            }
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            console.log(`Failed to apply rule ${rule.name} to extension ${extension.name}`)
            console.log(e)
            postMessage(new Message(`Failed to apply rule ${rule.name} to extension ${extension.name}${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.name, extension.extensionNumber, ['Failed to apply rule', rule.name], e.error ?? '', rule))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return { applyRules }
}

export default useApplyRules