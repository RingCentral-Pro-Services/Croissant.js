import { CustomRule, CustomRuleData } from "../models/CustomRule"
import { Extension } from "../../../../models/Extension"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { extensionForID } from "../../../../helpers/rcapi"

const useGetCustomRules = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, callback: (rules: CustomRule[]) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule?view=Detailed&type=Custom&perPage=1000'
    const baseWaitingPeriod = 250

    const fetchRules = async (extension: Extension, extensionList: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const rules: CustomRule[] = []
        await getRules(extension, rules, extensionList, accessToken)
        callback(rules)
    }

    const getRules = async (extension: Extension, rules: CustomRule[], extensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseURL.replace('extensionId', `${extension.data.id}`)
            const response = await RestCentral.get(url, headers)
            console.log('Rules')
            const rawRules = response.data.records
            console.log(rawRules)

            const translatedRules = translateRawRules(rawRules, extension, extensions)
            for (const rule of translatedRules) {
                rules.push(rule)
            }

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Pausing for ${response.rateLimitInterval / 1000} seconds...`, 'info'), response.rateLimitInterval)
            }
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            console.log(`Failed to get rules for ${extension.data.name}`)
            console.log(e)
            postMessage(new Message(`Failed to get rules for ${extension.data.name}. ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to get rules', ''], e.error ?? '', extension))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const translateRawRules = (rawRules: any, extension: Extension, extensions: Extension[]) => {
        const translatedRules: CustomRule[] = []

        for (const rawRule of rawRules) {
            const ruleData: CustomRuleData =  {
                id: rawRule.id,
                name: rawRule.name,
                type: "Custom",
                enabled: rawRule.enabled,
                callers: rawRule.callers,
                calledNumbers: rawRule.calledNumbers,
                schedule: {
                    weeklyRanges: rawRule.schedule?.weeklyRanges
                },
                ranges: rawRule.schedule?.ranges,
                ref: rawRule.schedule?.ref,
                callHandlingAction: rawRule.callHandlingAction,
                transfer: rawRule.transfer,
                unconditionalForwarding: rawRule.unconditionalForwarding,
                voicemail: rawRule.voicemail
            }
            const rule = new CustomRule(extension, ruleData)
            const beatifiedRule = beautifyRule(rule, extensions)
            translatedRules.push(beatifiedRule)
        }
        return translatedRules
    }

    const beautifyRule = (rule: CustomRule, extensions: Extension[]) => {
        if (rule.data.callHandlingAction === 'TransferToExtension' && rule.data.transfer) {
            rule.data.transfer.extension.id = extensionForID(rule.data.transfer.extension.id, extensions)!.data.extensionNumber
        }
        else if (rule.data.callHandlingAction === 'TakeMessagesOnly' && rule.data.voicemail) {
            rule.data.voicemail.recipient.id = parseInt(extensionForID(rule.data.voicemail.recipient.id, extensions)!.data.extensionNumber)
        }
        return rule
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {fetchRules}
}

export default useGetCustomRules