import { DateRange } from "@mui/icons-material"
import { VoicemailDestination } from "../../../../models/CustomRule"
import { DataGridFormattable } from "../../../../models/DataGridFormattable"
import ExcelFormattable from "../../../../models/ExcelFormattable"
import { Extension } from "../../../../models/Extension"
import { WeeklyRange } from "../../../../models/WeeklyRange"

export class CustomRule implements DataGridFormattable, ExcelFormattable {
    constructor(public extension: Extension, public data: CustomRuleData) {}

    toExcelRow(): string[] {
        return [this.extension.data.extensionNumber,
                this.extension.data.name,
                this.data.name,
                this.data.id ?? '',
                this.data.enabled ? 'Yes' : 'No',
                this.data.callers ? this.data.callers.map((caller) => caller.callerId).join(', ') : '',
                this.data.calledNumbers ? this.data.calledNumbers.map((number) => number.phoneNumber).join(', ') : '',
                this.getRef(),
                this.data.schedule.weeklyRanges?.sunday ? `${this.convertTo12HourTime(this.data.schedule.weeklyRanges.sunday[0].from)} - ${this.convertTo12HourTime(this.data.schedule.weeklyRanges.sunday[0].to)}` : '',
                this.data.schedule.weeklyRanges?.monday ? `${this.convertTo12HourTime(this.data.schedule.weeklyRanges.monday[0].from)} - ${this.convertTo12HourTime(this.data.schedule.weeklyRanges.monday[0].to)}` : '',
                this.data.schedule.weeklyRanges?.tuesday ? `${this.convertTo12HourTime(this.data.schedule.weeklyRanges.tuesday[0].from)} - ${this.convertTo12HourTime(this.data.schedule.weeklyRanges.tuesday[0].to)}` : '',
                this.data.schedule.weeklyRanges?.wednesday ? `${this.convertTo12HourTime(this.data.schedule.weeklyRanges.wednesday[0].from)} - ${this.convertTo12HourTime(this.data.schedule.weeklyRanges.wednesday[0].to)}` : '',
                this.data.schedule.weeklyRanges?.thursday ? `${this.convertTo12HourTime(this.data.schedule.weeklyRanges.thursday[0].from)} - ${this.convertTo12HourTime(this.data.schedule.weeklyRanges.thursday[0].to)}` : '',
                this.data.schedule.weeklyRanges?.friday ? `${this.convertTo12HourTime(this.data.schedule.weeklyRanges.friday[0].from)} - ${this.convertTo12HourTime(this.data.schedule.weeklyRanges.friday[0].to)}` : '',
                this.data.schedule.weeklyRanges?.saturday ? `${this.convertTo12HourTime(this.data.schedule.weeklyRanges.saturday[0].from)} - ${this.convertTo12HourTime(this.data.schedule.weeklyRanges.saturday[0].to)}` : '',
                this.data.ranges ? this.data.ranges.map(range => `${range.from} - ${range.to}`).join(', ') : '',
                this.prettyCallHandlingAction(),
                this.data.callHandlingAction === 'TransferToExtension' && this.data.transfer ? this.data.transfer.extension.id : '',
                this.data.callHandlingAction === 'UnconditionalForwarding' && this.data.unconditionalForwarding ? this.data.unconditionalForwarding.phoneNumber : '',
                this.data.callHandlingAction === 'TakeMessagesOnly' && this.data.voicemail ? `${this.data.voicemail.recipient.id}` : ''
            ]
    }

    getRef() {
        switch(this.data.ref) {
            case 'BusinessHours':
                return 'Work Hours'
            case 'AfterHours':
                return 'After Hours'
            default:
                return ''
        }
    }

    convertTo12HourTime(time: string) {
        const [hour, minute] = time.split(':')
        const hourInt = parseInt(hour)
        const minuteInt = parseInt(minute)
        const minuteString = `${minuteInt}`.length === 1 ? `0${minuteInt}` : `${minuteInt}`
        const ampm = hourInt >= 12 ? 'PM' : 'AM'
        const hour12 = hourInt % 12 || 12
        return `${hour12}:${minuteString} ${ampm}`
    }

    prettyCallHandlingAction() {
        switch(this.data.callHandlingAction) {
            case 'PlayAnnouncementOnly':
                return 'Play Message and Disconnect'
            case 'TakeMessagesOnly':
                return 'Send to Voicemail'
            case 'UnconditionalForwarding':
                return 'Transfer to External'
            case 'TransferToExtension':
                return 'Transfer to Extension'
            default:
                return this.data.callHandlingAction
        }
    }

    toDataGidHeader() {
        return [
            { field: "ruleName", headerName: "Rule Name", width: 200 },
            { field: "ruleTarget", headerName: "Rule Target", width: 200 },
            { field: "enabled", headerName: "Enabled", width: 200 },
            { field: "callerID", headerName: "Caller ID", width: 200 },
            { field: "calledNumber", headerName: "Called Number", width: 200 },
            { field: "specificDates", headerName: "Specific Date", width: 200 },
            { field: "action", headerName: "Action", width: 200 },
            { field: "transferExtension", headerName: "Transfer Extension", width: 200 },
            { field: "externalNumber", headerName: "Transfer Extension", width: 200 },
            { field: "voicemailRecipient", headerName: "Voicemail Recipient", width: 200 },
        ]
    }

    toDataGridRow(): any {
        return {
            id: `${this.extension.data.id}-${this.data.name}`,
            ruleName: this.data.name,
            ruleTarget: this.extension.data.name,
            enabled: this.data.enabled,
            callerID: this.data.callers.length > 0 ? this.data.callers.map((caller) => caller.callerId).join(', ') : '',
            calledNumber: this.data.calledNumbers.length > 0 ? this.data.calledNumbers.map((number) => number.phoneNumber).join(', ') : '',
            specificDates: this.data.ranges.length > 0 ? this.data.ranges.map(range => range.toString()).join(', ') : '',
            action: this.data.callHandlingAction,
            transferExtension: this.data.transfer?.extension.id || '',
            externalNumber: this.data.unconditionalForwarding?.phoneNumber || '',
            voicemailRecipient: this.data.voicemail?.recipient || '',
        }
    }

    property(key: string) {
        return this.data[key as keyof CustomRuleData]
    }

    payload() {
        return {
            name: this.data.name,
            type: 'Custom',
            enabled: this.data.enabled,
            callHandlingAction: this.data.callHandlingAction,
            ...(this.data.ref && this.data.ref !== '' && {schedule: {ref: this.data.ref}}),
            ...(this.data.callers.length > 0 && { callers: this.data.callers }),
            ...(this.data.calledNumbers.length > 0 && { calledNumbers: this.data.calledNumbers }),
            ...(Object.keys(this.data.schedule.weeklyRanges).length > 0 && { schedule: this.data.schedule }),
            ...(this.data.ranges.length > 0 && { schedule: { ranges: this.data.ranges }}),
            ...(this.data.callHandlingAction === 'UnconditionalForwarding' && { unconditionalForwarding: this.data.unconditionalForwarding }),
            ...(this.data.callHandlingAction === 'TransferToExtension' && { transfer: this.data.transfer }),
            ...(this.data.callHandlingAction === 'TakeMessagesOnly' && { voicemail: this.data.voicemail }),
        }
    }
}

export interface CustomRuleData {
    id?: string
    name: string
    type: string
    enabled: boolean
    callers: CustomRuleCaller[]
    calledNumbers: CustomRuleCalledNumber[]
    schedule: {
        weeklyRanges: CustomRuleWeeklyRanges
    }
    ranges: DateRange[]
    ref: string
    callHandlingAction: string
    unconditionalForwarding?: CustomRuleExternalNumber
    transfer?: CustomRuleTransfer
    voicemail?: VoicemailDestination
}

export interface CustomRuleCaller {
    name?: string
    callerId: string
}

export interface DateRange {
    from: string
    to: string
}

export interface CustomRuleCalledNumber {
    phoneNumber: string
}

export interface CustomRuleTransfer {
    extension: {
        id: string
    }
}

export interface CustomRuleExternalNumber {
    phoneNumber: string
}

export interface CustomRuleWeeklyRanges {
    sunday?: [{
        from: string
        to: string
    }]
    monday?: [{
        from: string
        to: string
    }]
    tuesday?: [{
        from: string
        to: string
    }]
    wednesday?: [{
        from: string
        to: string
    }]
    thursday?: [{
        from: string
        to: string
    }]
    friday?: [{
        from: string
        to: string
    }]
    saturday?: [{
        from: string
        to: string
    }]
}