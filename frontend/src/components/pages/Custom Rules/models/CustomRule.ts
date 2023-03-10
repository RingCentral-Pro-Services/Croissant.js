import { DateRange } from "@mui/icons-material"
import { VoicemailDestination } from "../../../../models/CustomRule"
import { DataGridFormattable } from "../../../../models/DataGridFormattable"
import { Extension } from "../../../../models/Extension"
import { WeeklyRange } from "../../../../models/WeeklyRange"

export class CustomRule implements DataGridFormattable {
    constructor(public extension: Extension, public data: CustomRuleData) {}

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
            ...(this.data.callers.length > 0 && { callers: this.data.callers }),
            ...(this.data.calledNumbers.length > 0 && { calledNumbers: this.data.calledNumbers }),
            ...(Object.keys(this.data.schedule.weeklyRanges).length > 0 && { schedule: this.data.schedule }),
            ...(this.data.ref && this.data.ref != '' && { ref: this.data.ref }),
            ...(this.data.callHandlingAction === 'UnconditionalForwarding' && { unconditionalForwarding: this.data.unconditionalForwarding }),
            ...(this.data.callHandlingAction === 'TransferToExtension' && { transfer: this.data.transfer }),
            ...(this.data.callHandlingAction === 'TakeMessagesOnly' && { voicemail: this.data.voicemail }),
        }
    }
}

export interface CustomRuleData {
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