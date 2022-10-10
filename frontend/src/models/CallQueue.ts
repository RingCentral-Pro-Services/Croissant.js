import CSVFormattable from "./CSVFormattable";
import ExcelFormattable from "./ExcelFormattable";
import { DataTableFormattable } from "./DataTableFormattable";
import RCExtension from "./RCExtension";

class CallQueue implements CSVFormattable, ExcelFormattable, DataTableFormattable {
    constructor(public extension: RCExtension, public siteID: number, public members: string[]) {}

    toRow(): string {
        return `${this.extension.name},${this.extension.extensionNumber},${this.extension.site},${this.extension.status},"${this.members}"`
    }

    toExcelRow(): string[] {
        return [this.extension.name, `${this.extension.extensionNumber}`, this.extension.site, this.extension.status, `${this.members}`]
    }

    toDataTableRow(): string[] {
        return [this.extension.name, `${this.extension.extensionNumber}`, this.extension.site, this.extension.status, `${this.members}`]
    }
}

export default CallQueue