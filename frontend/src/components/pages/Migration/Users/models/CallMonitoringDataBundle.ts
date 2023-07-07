import ExcelFormattable from "../../../../../models/ExcelFormattable"

export class CallMonitoringDataBundle implements ExcelFormattable {
    constructor(public data: CallMonitoringData) {}

    toExcelRow(): string[] {
        return [
            this.data.name,
            this.data.members.filter((member) => member.permissions.includes('Monitoring')).map((member) => member.extensionNumber).join(', '),
            this.data.members.filter((member) => member.permissions.includes('Monitored')).map((member) => member.extensionNumber).join(', ')
        ]
    }
}
export interface CallMonitoringData {
    name: string
    id?: string
    members: CallMonitoringMember[]
}

export interface CallMonitoringMember {
    uri?: string
    id: string
    extensionNumber?: string
    permissions: string[]
}