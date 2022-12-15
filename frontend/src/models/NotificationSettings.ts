import CSVFormattable from "./CSVFormattable"
import ExcelFormattable from "./ExcelFormattable"
import NotificationBundle from "./NotificationBundle"
import { DataTableFormattable } from "./DataTableFormattable"
import RCExtension from "./RCExtension"
import { DataGridFormattable } from "./DataGridFormattable"
import { GridColDef } from "@mui/x-data-grid";

class NotificationSettings implements CSVFormattable, ExcelFormattable, DataTableFormattable, DataGridFormattable {
    constructor(public extension: RCExtension, public data: NotificationSettingsPayload) {}

    toRow(): string {
        return `${this.extension.id},${this.extension.name},${this.extension.extensionNumber},${this.extension.prettyType[this.extension.type]},"${this.data.emailAddresses ?? ""}"`
    }

    toExcelRow(): string[] {
        return [`${this.extension.id}`, this.extension.name, `${this.extension.extensionNumber}`, this.extension.prettyType[this.extension.type] ?? this.extension.type,
                `${this.data.emailAddresses ?? ''}`, `${this.data.advancedMode}`, this.data.advancedMode ? `${this.data.voicemails.advancedEmailAddresses ?? ''}` : '', this.data.advancedMode ? `${this.data.inboundFaxes.advancedEmailAddresses ?? ''}` : '',
                this.data.advancedMode ? `${this.data.outboundFaxes.advancedEmailAddresses ?? ''}` : '', this.data.advancedMode ? `${this.data.inboundTexts.advancedEmailAddresses ?? ''}` : '', this.data.advancedMode ? `${this.data.missedCalls.advancedEmailAddresses ?? ''}` : '']
    }

    toDataTableRow(): string[] {
        return this.toExcelRow()
    }

    toDataGridRow(): any {
        let result = {
            id: this.extension.id,
            name: this.extension.name,
            extensionNumber: this.extension.extensionNumber,
            emailAddresses: this.data.emailAddresses ?? '',
            advancedMode: this.data.advancedMode,
            voicemails: this.data.advancedMode ? this.data.voicemails.advancedEmailAddresses ?? '' : '',
            inboundFaxes: this.data.advancedMode ? this.data.inboundFaxes.advancedEmailAddresses ?? '' : '',
            outboundFaxes: this.data.advancedMode ? this.data.outboundFaxes.advancedEmailAddresses ?? '' : '',
            inboundTexts: this.data.advancedMode ? this.data.inboundTexts.advancedEmailAddresses ?? '' : '',
            missedCalls: this.data.advancedMode ? this.data.missedCalls.advancedEmailAddresses ?? '' : '',
        }

        return result
    }

    toDataGidHeader(): any {
        let result: GridColDef[] = [
            { field: 'name', headerName: 'Name', width: 300 },
            { field: 'extensionNumber', headerName: 'Extension Number', width: 150 },
            { field: 'emailAddresses', headerName: 'Email Addresses', width: 300 },
            { field: 'advancedMode', headerName: 'Advanced Mode', width: 150 },
            { field: 'voicemails', headerName: 'Voicemails', width: 300 },
            { field: 'inboundFaxes', headerName: 'Inbound Faxes', width: 300 },
            { field: 'outboundFaxes', headerName: 'Outbound Faxes', width: 300 },
            { field: 'inboundTexts', headerName: 'Inbound Texts', width: 300 },
            { field: 'missedCalls', headerName: 'Missed Calls', width: 300 },
        ]

        return result
    }

    property(key: string): any {
        if (key === 'site') {
            return this.extension.site ?? 'N/A'
        }
        else if (key === 'id') {
            return this.extension.id
        }
        return this[key as keyof NotificationSettings]
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