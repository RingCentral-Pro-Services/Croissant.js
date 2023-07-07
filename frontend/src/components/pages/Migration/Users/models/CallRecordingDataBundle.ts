import ExcelFormattable from "../../../../../models/ExcelFormattable"

export class CallRecordingExcelRow implements ExcelFormattable {
    constructor(public member: CallRecordingExtension) {}

    toExcelRow(): string[] {
        return [
            this.member.name ?? '',
            this.member.extensionNumber ?? '',
            this.member.callDirection
        ]
    }
}

export interface CallRecordingDataBundle {
    onDemand: {
        enabled: boolean
        retentionPeriod?: number
    }
    automatic: {
        enabled: boolean
        outboundCallTones: boolean
        outboundCallAnnouncement: boolean
        allowMute: boolean
        extensionCount?: boolean
        retentionPeriod?: boolean
        maxNumberLimit?: boolean
    }
    greetings?: []
    members?: CallRecordingExtension[]
}

export interface CallRecordingExtension {
    id: string
    callDirection: string
    uri?: string
    extensionNumber?: string
    name?: string
}