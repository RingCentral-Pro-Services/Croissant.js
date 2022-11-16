import { DataTableFormattable } from "./DataTableFormattable";
import ExcelFormattable from "./ExcelFormattable";

export class Site implements ExcelFormattable, DataTableFormattable {
    constructor(public id: string, public name: string, public extensionNumber: number) {}

    toExcelRow(): string[] {
        return [this.id, this.name, `${this.extensionNumber}`]
    }

    toDataTableRow(): string[] {
        return this.toExcelRow()
    }
}