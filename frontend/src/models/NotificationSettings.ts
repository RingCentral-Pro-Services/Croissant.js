import CSVFormattable from "./CSVFormattable"
import ExcelFormattable from "./ExcelFormattable"
import NotificationBundle from "./NotificationBundle"
import { DataTableFormattable } from "./DataTableFormattable"
import RCExtension from "./RCExtension"

class NotificationSettings implements CSVFormattable, ExcelFormattable, DataTableFormattable {
    constructor(public extension: RCExtension, public data: NotificationSettingsPayload) {}

    toRow(): string {
        return `${this.extension.id},${this.extension.name},${this.extension.extensionNumber},${this.extension.prettyType[this.extension.type]},"${this.data.emailAddresses ?? ""}"`
    }

    toExcelRow(): string[] {
        return [`${this.extension.id}`, this.extension.name, `${this.extension.extensionNumber}`, this.extension.prettyType[this.extension.type] ?? this.extension.type, `${this.data.emailAddresses ?? ''}`]
    }

    toDataTableRow(): string[] {
        return [`${this.extension.id}`, this.extension.name, `${this.extension.extensionNumber}`, this.extension.prettyType[this.extension.type] ?? this.extension.type, `${this.data.emailAddresses ?? ''}`]
    }
}

export interface NotificationSettingsPayload {
    uri: string
    emailAddresses: string[]
    includeManagers: boolean
    advancedMode: boolean
    voicemails: NotificationBundle
    inboundFaxes: NotificationBundle
    outboundFaxes: NotificationBundle
    inboundTexts: NotificationBundle
    missedCalls: NotificationBundle
}

export default NotificationSettings