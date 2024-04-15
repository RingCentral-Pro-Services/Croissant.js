import ExcelFormattable from "../../interfaces/ExcelFormattable"

export interface ExcelSheetData {
    sheetName: string
    data: ExcelFormattable[]
    startingRow: number
    spliceAt?: number
    startingColumnIndex?: number
    vertical?: boolean
}