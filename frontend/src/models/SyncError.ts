import ExcelFormattable from "./ExcelFormattable"

export class SyncError implements ExcelFormattable {
    constructor(public extensionName: string, public extensionNumber: number, public error: string[], public platformResponse?: string, public object?: any) {}

    toExcelRow(): string[] {
        return [this.extensionName, `${this.extensionNumber}`, ...this.error, this.platformResponse ?? '', this.object ? JSON.stringify(this.object) : '']
    }
}