import CSVFormattable from "./CSVFormattable"
import ExtensionContact from "./ExtensionContact"

class RCExtension implements CSVFormattable, ExcelFormattable {

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
        "DelegatedLinesGroup": "Delegated Lines Group"
    }

    constructor(public id: number, public extensionNumber: number, public name: string, public contact: ExtensionContact, public site: string, public type: string, public status: string, public hidden: boolean , public uri: string) {}

    toRow() {
        return `${this.name},${this.extensionNumber ?? 'N/A'},${this.contact?.email ?? ""},${this.site ?? 'N/A'},${this.prettyType[this.type] ?? this.type},${this.status},${this.hidden}`
    }

    toExcelRow(): string[] {
        return [this.name, `${this.extensionNumber ?? ''}`, this.contact?.email ?? '', this.site ?? 'N/A', this.prettyType[this.type] ?? this.type, this.status, `${this.hidden}`]
    }
}

export default RCExtension