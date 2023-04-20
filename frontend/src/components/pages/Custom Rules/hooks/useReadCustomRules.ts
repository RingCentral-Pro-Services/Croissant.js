import { useState } from "react";
import ExtensionIsolator from "../../../../helpers/ExtensionIsolator";
import { Extension } from "../../../../models/Extension";
import { Message } from "../../../../models/Message";
import { SyncError } from "../../../../models/SyncError";
import { CustomRule, CustomRuleCalledNumber, CustomRuleCaller, CustomRuleData, CustomRuleWeeklyRanges, DateRange } from "../models/CustomRule";

const useReadCustomRules = (postMessage: (message: Message) => void, postError: (error: SyncError) => void) => {
    const [customRules, setCustomRules] = useState<CustomRule[]>([])
    const [isRuleReadPending, setIsRuleReadPending] = useState(true)
    const callHandlingActionMap = new Map<string, string>([
        ['Transfer to Extension', 'TransferToExtension'],
        ['Transfer to External', 'UnconditionalForwarding'],
        ['Send to Voicemail', 'TakeMessagesOnly'],
        ['Play Message and Disconnect', 'PlayAnnouncementOnly'],
    ])

    const readCustomRules = (excelData: any, extensionsList: Extension[]) => {
        const rules: CustomRule[] = []

        for (const data of excelData) {
            const extension = extensionsList.find((extension) => `${extension.data.extensionNumber}` === `${data['Ext Number']}`)
            if (!extension) {
                console.log(`Extension ${data['Ext Number']} not found. Skipping rule ${data['Rule Name']}`)
                postMessage(new Message(`Extension ${data['Ext Number']} not found. Skipping rule ${data['Rule Name']}`, 'warning'))
                continue
            }

            let voicemailRecipientID = getVoicemailRecipient(data, extension, extensionsList)
            const transferExtensionID = getTransferExtensionID(`${data['Transfer Extension']}`, extensionsList)

            const ruleData: CustomRuleData = {
                name: data['Rule Name'],
                type: 'Custom',
                enabled: data['Enabled'] === 'Yes',
                callers: getCallers(data['Caller ID']),
                calledNumbers: getCalledNumbers(data['Called Number']),
                ranges: data['Specific Dates'] ? getDateRanges(data['Specific Dates']) : [],
                schedule: {
                    weeklyRanges: getWeeklyRanges(data),
                },
                ref: data['Work or After Hours'] ? getRef(data['Work or After Hours']) : '',
                callHandlingAction: callHandlingActionMap.get(data['Action']) || '',
                voicemail: {
                    enabled: data['Action'] === 'Send to Voicemail',
                    recipient: {id: parseInt(voicemailRecipientID)}
                },
                transfer: {
                    extension: {
                        id: transferExtensionID,
                    }
                },
                unconditionalForwarding: {
                    phoneNumber: getTransferPhoneNumber(`${data['External Number']}`)
                }
            }
            const rule = new CustomRule(extension, ruleData)
            rules.push(rule)
        }
        setCustomRules(rules)
        setIsRuleReadPending(false)
    }

    const getVoicemailRecipient = (data: any, extension: Extension, extensionsList: Extension[]) => {
        const isolator = new ExtensionIsolator()
        let voicemailRecipientID = ''

        if (data['Voicemail Recipient']) {
            const extractedExtension = isolator.isolateExtension(data['Voicemail Recipient'])
            const voicemailRecipient = extensionsList.find((extension) => `${extension.data.extensionNumber}` === extractedExtension)

            if (voicemailRecipient) {
                voicemailRecipientID = `${voicemailRecipient.data.id}`
            }
            else {
                console.log(`Voicemail recipient not found. Setting to ${extension.data.id}`)
                voicemailRecipientID = `${extension.data.id}`
            }
        }
        else {
            console.log(`Voicemail recipient not found. Setting to ${extension.data.id}`)
            voicemailRecipientID = `${extension.data.id}`
        }
        
        return voicemailRecipientID
    }

    const getCallers = (rawCallers: string) => {
        if (!rawCallers || rawCallers === '') return []

        const callers: CustomRuleCaller[] = []
        const callerList = rawCallers.split(',')

        for (const caller of callerList) {
            callers.push({
                callerId: caller
            })
        }

        return callers
    }

    const getCalledNumbers = (rawCalledNumbers: string) => {
        if (!rawCalledNumbers || rawCalledNumbers === '') return []

        const calledNumbers: CustomRuleCalledNumber[] = []
        const calledNumberList = rawCalledNumbers.split(',')

        for (const calledNumber of calledNumberList) {
            const numberData: CustomRuleCalledNumber = {
                phoneNumber: calledNumber
            }
            calledNumbers.push(numberData)
        }

        return calledNumbers
    }

    const getTransferExtensionID = (rawTransferExtension: string, extensionsList: Extension[]) => {
        if (!rawTransferExtension || rawTransferExtension === '') return ''

        const isolator = new ExtensionIsolator()
        const extensionNumber = isolator.isolateExtension(rawTransferExtension)

        const extension = extensionsList.find((extension) => `${extension.data.extensionNumber}` === `${extensionNumber}`)
        if (!extension) return ''

        return `${extension.data.id}`
    }

    const getTransferPhoneNumber = (rawPhoneNumber: string) => {
        if (!rawPhoneNumber || rawPhoneNumber === '') return ''

        const isolator = new ExtensionIsolator()
        const phoneNumber = isolator.isolatePhoneNumber(rawPhoneNumber)

        return phoneNumber ?? ''
    }

    const getWeeklyRanges = (data: any) => {
        const weeklyRanges: CustomRuleWeeklyRanges = {}
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

        for (const day of days) {
            const dayRanges = data[day]
            if (!dayRanges || dayRanges === '') continue

            const ranges = dayRanges.split('-')
            if (ranges.length !== 2) continue
            const rawFrom = ranges[0].trim()
            const rawTo = ranges[1].trim()
            const convertedFrom = convertTo24Hour(rawFrom)
            const convertedTo = convertTo24Hour(rawTo)

            Object.assign(weeklyRanges, {[day.toLowerCase()]: [{from: convertedFrom, to: convertedTo}]})
        }
        return weeklyRanges
    }

    const getDateRanges = (rawDateRanges: string) => {
        if (!rawDateRanges || rawDateRanges === '') return []

        const dateRanges: DateRange[] = []
        const dateRangeList = rawDateRanges.split(',')

        for (const dateRange of dateRangeList) {
            const rawBeginning = dateRange.split(' - ')[0].trim()
            const rawEnding = dateRange.split(' - ')[1].trim()

            const rangeData: DateRange = {
                from: rawBeginning.trim(),
                to: rawEnding.trim()
            }
            dateRanges.push(rangeData)
        }

        return dateRanges
    }

    const getRef = (rawRef: string) => {
        if (!rawRef || rawRef === '') return ''

        if (rawRef === 'Work Hours') return 'BusinessHours'
        if (rawRef === 'After Hours') return 'AfterHours'
        return ''
    }

    const convertTo24Hour = (time: string) => {
        const [timeString, modifier] = time.split(' ');
        let [hours, minutes] = timeString.split(':');
        if (hours === '12') {
            hours = '00';
        }
        if (modifier === 'PM') {
            hours = (parseInt(hours) + 12).toString();
        }
        return `${hours}:${minutes}`;
    }

    return {readCustomRules, customRules, isRuleReadPending}
}

export default useReadCustomRules