import { CustomRule, CustomRuleData } from "../models/CustomRule"
import { Extension } from "../../../../models/Extension"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { extensionForID } from "../../../../helpers/rcapi"
import { useState } from "react"

const useGetCompanyRules = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/answering-rule?perPage=1000'
    const baseRuleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/answering-rule/ruleId'
    const baseWaitingPeriod = 250
    const [companyRules, setCompanyRules] = useState<CustomRule[]>([])
    const [isCompanyRuleListPending, setIsCompanyRuleListPending] = useState(true)
    const [companyRuleProgress, setCompanyRuleProgress] = useState(1)
    const [maxCompanyRuleProgress, setMaxCompanyRuleProgress] = useState(1)

    const fetchCompanyRules = async (extensionList: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const rules: CustomRule[] = []
        const ruleIDs = await getRules(accessToken)

        setMaxCompanyRuleProgress(ruleIDs.length)
        for (const ruleID of ruleIDs) {
            const rule = await getRuleByID(ruleID, extensionList, accessToken)
            if (!rule) continue
            rules.push(rule)
            setCompanyRuleProgress((prev) => prev + 1)
        }

        setCompanyRules(rules)
        setIsCompanyRuleListPending(false)
    }

    const getRules = async (token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseURL, headers)
            const ruleIDs = response.data.records.filter((record: any) => record.type === 'Custom').map((record: any) => record.id)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Pausing for ${response.rateLimitInterval / 1000} seconds...`, 'info'), response.rateLimitInterval)
            }
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return ruleIDs
        }
        catch (e: any) {
            console.log(`Failed to get rules for main site`)
            console.log(e)
            postMessage(new Message(`Failed to get rules for main site. ${e.error ?? ''}`, 'error'))
            postError(new SyncError('Main Site', 0, ['Failed to get rules', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return []
        }
    }

    const getRuleByID = async (ruleID: string, extensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseRuleURL.replace('ruleId', ruleID), headers)
            const rule = translateRawRules(response.data, extensions)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Pausing for ${response.rateLimitInterval / 1000} seconds...`, 'info'), response.rateLimitInterval)
            }
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return rule
        }
        catch (e: any) {
            console.log(`Failed to get rules for main site`)
            console.log(e)
            postMessage(new Message(`Failed to get rules for main site. ${e.error ?? ''}`, 'error'))
            postError(new SyncError('Main Site', 0, ['Failed to get rules', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const translateRawRules = (rawRule: any, extensions: Extension[]) => {
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
            transfer: {
                extension: {
                    id: rawRule.extension?.id
                }
            },
            unconditionalForwarding: rawRule.unconditionalForwarding,
            voicemail: rawRule.voicemail
        }

        const extension = new Extension({
            contact: {
                firstName: 'Main Site',
                email: ''
            },
            extensionNumber: '',
            id: 'main-site',
            name: 'Main Site',
            type: 'Site'
        })

        const rule = new CustomRule(extension, ruleData)
        const beatifiedRule = beautifyRule(rule, extensions)
        console.log('rule')
        console.log(beatifiedRule)
        return rule
    }

    const beautifyRule = (rule: CustomRule, extensions: Extension[]) => {
        if (rule.data.callHandlingAction === 'Bypass' && rule.data.transfer) {
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

    return {fetchCompanyRules, isCompanyRuleListPending, companyRules, companyRuleProgress, maxCompanyRuleProgress}
}

export default useGetCompanyRules