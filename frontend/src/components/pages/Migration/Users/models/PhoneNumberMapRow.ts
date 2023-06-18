import ExcelFormattable from "../../../../../models/ExcelFormattable";

export class PhoneNumberMapRow implements ExcelFormattable {
    constructor(public originalNumber: string, public tempNumber: string, public extensionName: string, public extensionNumber: string, public extensionType: string, public site: string) {}

    toExcelRow(): string[] {
        return [this.originalNumber, this.tempNumber, this.extensionType, this.extensionName, this.extensionNumber, this.site]
    }
}