import ExcelFormattable from '../../interfaces/ExcelFormattable'

export class Message implements ExcelFormattable {
    constructor(public body: string, public type: string, public id?: number) {}

    toExcelRow(): string[] {
        return [this.body]
    }
}
