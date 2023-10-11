import {AlertColor} from '@mui/material'
import ExcelFormattable from './ExcelFormattable';

export class Message implements ExcelFormattable {
    constructor(public body: string, public type: AlertColor, public id?: number) {}

    toExcelRow(): string[] {
        return [this.body]
    }
}
