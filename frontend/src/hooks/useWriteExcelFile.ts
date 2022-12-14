import * as xlsx from 'xlsx'
import ExcelFormattable from '../models/ExcelFormattable'

const useWriteExcelFile = () => {
    const writeExcel = (headers: string[], items: ExcelFormattable[], sheetName: string, filename: string) => {
        let data: string[][] = []

        data.push(headers)
        for (let index = 0; index < items.length; index++) {
            data.push(items[index].toExcelRow())
        }

        let workbook = xlsx.utils.book_new()
        var worksheet = xlsx.utils.aoa_to_sheet(data)

        xlsx.utils.book_append_sheet(workbook, worksheet, sheetName, true)
        xlsx.writeFile(workbook, filename)
    }

    return {writeExcel}
}

export default useWriteExcelFile