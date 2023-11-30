import ExcelFormattable from "../../../models/ExcelFormattable"

export interface UsageItemData {
    title: string
    count: number
}

export class UsageItem implements ExcelFormattable {
    constructor(public data: UsageItemData) {}

    toExcelRow() {
        return [
            this.data.title,
            `${this.data.count}`
        ]
    }
}