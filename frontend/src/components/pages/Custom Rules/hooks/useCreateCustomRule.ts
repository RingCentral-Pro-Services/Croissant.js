import { Extension } from "../../../../models/Extension"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { CustomRule } from "../models/CustomRule"

const useCreateCustomRule = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, callback: () => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule'
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/answeringRuleId'
    const baseWaitingPeriod = 250

    const createCustomRule = async (rule: CustomRule) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        if (rule.data.id) {
            await updateRule(rule, accessToken)
        }
        else {
            await makeRule(rule, accessToken)
        }
        callback()
    }

    const makeRule = async (rule: CustomRule, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseURL.replace('extensionId', `${rule.extension.data.id}`)
            const response = await RestCentral.post(url, headers, rule.payload())
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to make custom rule ${rule.data.name} for extension ${rule.extension.data.name} - Ext. ${rule.extension.data.extensionNumber}`)
            console.log(e)
            postMessage(new Message(`Failed to make custom rule ${rule.data.name} for extension ${rule.extension.data.name} - Ext. ${rule.extension.data.extensionNumber} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(rule.extension.data.name, parseInt(rule.extension.data.extensionNumber), ['Failed to create rule', ''], e.error ?? '', rule))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const updateRule = async (rule: CustomRule, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseUpdateURL.replace('extensionId', `${rule.extension.data.id}`).replace('answeringRuleId', rule.data.id!)
            const response = await RestCentral.put(url, headers, rule.payload())
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to update custom rule ${rule.data.name} for extension ${rule.extension.data.name} - Ext. ${rule.extension.data.extensionNumber}`)
            console.log(e)
            postMessage(new Message(`Failed to update custom rule ${rule.data.name} for extension ${rule.extension.data.name} - Ext. ${rule.extension.data.extensionNumber} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(rule.extension.data.name, parseInt(rule.extension.data.extensionNumber), ['Failed to update rule', ''], e.error ?? '', rule))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {createCustomRule}
}

export default useCreateCustomRule