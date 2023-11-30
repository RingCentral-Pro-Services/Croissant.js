import { DataGridFormattable } from "../../../models/DataGridFormattable"
import ExcelFormattable from "../../../models/ExcelFormattable"

export interface UsageItemData {
    title: string
    count: number
}

export class UsageItem implements ExcelFormattable, DataGridFormattable {
    constructor(public data: UsageItemData) {}

    toExcelRow() {
        return [
            this.data.title,
            `${this.data.count}`
        ]
    }

    toDataGridRow(): any {
        return {
            id: this.data.title,
            title: this.data.title,
            count: this.data.count
        }
    }

    toDataGidHeader(): any {
        return [
            { field: 'title', headerName: 'Name', width: 200 },
            { field: 'count', headerName: 'Count', width: 200 },
        ]
    }

    property(key: string): any {
        return this.data[key as keyof UsageItemData]
    }
}