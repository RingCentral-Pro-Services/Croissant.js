import ExcelFormattable from "./ExcelFormattable";

export class IntercomStatus implements ExcelFormattable {
    constructor(
        public extensionName: string,
        public extensionNumber: string,
        public intercomStatus: string,
        public intercomDevice: string
    ) {}

    toExcelRow() {
        return [this.extensionName, this.extensionNumber, this.intercomStatus, this.intercomDevice]
    }
}