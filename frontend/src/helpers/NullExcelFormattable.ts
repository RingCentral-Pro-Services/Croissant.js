import ExcelFormattable from "../models/ExcelFormattable";

export class NullExcelFormattable implements ExcelFormattable {
    constructor() {}

    toExcelRow(): string[] {
        return []
    }
}