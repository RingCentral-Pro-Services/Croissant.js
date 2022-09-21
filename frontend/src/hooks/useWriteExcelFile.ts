import * as xlsx from 'xlsx'
import ExcelFormattable from '../models/ExcelFormattable'
const FileSaver = require('file-saver');

const useWriteExcelFile = () => {
    const writeExcel = (headers: string[], items: ExcelFormattable[], filename: string) => {
        let data: string[][] = []

        data.push(headers)
        for (let index = 0; index < items.length; index++) {
            data.push(items[index].toExcelRow())
        }

        let workbook = xlsx.utils.book_new()
        var worksheet = xlsx.utils.aoa_to_sheet(data)

        xlsx.utils.book_append_sheet(workbook, worksheet, "Extensions", true)
        xlsx.writeFile(workbook, filename)
        // let excelData = xlsx.write(workbook, { type:"binary", bookType: "xlsx" })

        // const blob = new Blob([excelData])
        // FileSaver.saveAs(blob, filename)
    }

    return {writeExcel}
}

export default useWriteExcelFile