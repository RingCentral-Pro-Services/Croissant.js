import CSVFormattable from "./CSVFormattable"
import { DataGridFormattable } from "./DataGridFormattable"
import { DataTableFormattable } from "./DataTableFormattable"
import ExcelFormattable from "./ExcelFormattable"
import ExtensionContact from "./ExtensionContact"
import { SimpleHandlingRule } from "./SimpleHandlingRule"

class RCExtension implements CSVFormattable, ExcelFormattable, DataTableFormattable, DataGridFormattable {

    prettyType: {[key: string]: string} = {
        "Department": "Call Queue",
        "ParkLocation": "Park Location",
        "IvrMenu": "IVR Menu",
        "User": "User",
        "Site": "Site",
        "DigitalUser": "Digital User",
        "FaxUser": "Fax User",
        "FlexibleUser": "Flexible User",
        "VirtualUser": "Virtual User",
        "Announcement": "Announcement-Only",
        "Voicemail": "Message-Only",
        "SharedLinesGroup": "Shared Line Group",
        "PagingOnly": "Paging Group",
        "ApplicationExtension": "Application Extension",
        "Limited": "Limited Extension",
        "Bot": "Bot",
        "ProxyAdmin": "Proxy Admin",
        "DelegatedLinesGroup": "Delegated Lines Group",
        "GroupCallPickup": "Group Call Pickup",
        "Room": "Room"
    }

    constructor(public id: number, public extensionNumber: number, public name: string, public contact: ExtensionContact, public site: string, public type: string, public status: string, public hidden: boolean , public uri: string, public customRules?: SimpleHandlingRule[]) {}

    toRow() {
        return `${this.name},${this.extensionNumber ?? 'N/A'},${this.contact?.email ?? ""},${this.site ?? 'N/A'},${this.prettyType[this.type] ?? this.type},${this.status},${this.hidden}`
    }

    toExcelRow(): string[] {
        return [`${this.id}`, this.name, `${this.extensionNumber ?? ''}`, this.contact?.email ?? '', this.site ?? 'N/A', this.prettyType[this.type] ?? this.type, this.status, `${this.hidden}`]
    }

    toDataTableRow(): string[] {
        return [this.name, `${this.extensionNumber ?? ''}`, this.contact?.email ?? '', this.site ?? 'N/A', this.prettyType[this.type] ?? this.type, this.status, `${this.hidden}`]
    }

    toDataGridRow(): any {
        return {
            id: this.id,
            name: this.name,
            extensionNumber: this.extensionNumber ?? '',
            email: this.contact?.email ?? '',
            site: this.site ?? 'N/A',
            type: this.prettyType[this.type] ?? this.type,
            status: this.status,
            hidden: this.hidden
        }
    }

    toDataGidHeader(): any {
        return [
            { field: 'id', headerName: 'ID', width: 100 },
            { field: 'name', headerName: 'Name', width: 300 },
            { field: 'extensionNumber', headerName: 'Extension Number', width: 150 },
            { field: 'email', headerName: 'Email', width: 400 },
            { field: 'site', headerName: 'Site', width: 200,},
            { field: 'type', headerName: 'Type', width: 200 },
            { field: 'status', headerName: 'Status', width: 200 },
            { field: 'hidden', headerName: 'Hidden', width: 200 }
        ]
    }

    property(key: string): any {
        if (key === 'site') {
            return this.site ?? 'N/A'
        }
        return this[key as keyof RCExtension]
    }
}

export default RCExtension