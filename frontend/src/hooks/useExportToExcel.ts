import * as xlsx from 'xlsx'
import ExcelFormattable from '../models/ExcelFormattable'

interface ExcelSheetData {
    headers: string[]
    sheetName: string
    data: ExcelFormattable[]
}

const useExportToExcel = () => {
    const exportToExcel = (sheetData: ExcelSheetData[], filename: string) => {
        let workbook = xlsx.utils.book_new()

        for (const sheet of sheetData) {
            let data: string[][] = []

            data.push(sheet.headers)
            for (let index = 0; index < sheet.data.length; index++) {
                data.push(sheet.data[index].toExcelRow())
            }

            var worksheet = xlsx.utils.aoa_to_sheet(data)
            xlsx.utils.book_append_sheet(workbook, worksheet, sheet.sheetName, true)
        }

        xlsx.writeFile(workbook, filename)
    }

    return {exportToExcel}
}

export default useExportToExcel