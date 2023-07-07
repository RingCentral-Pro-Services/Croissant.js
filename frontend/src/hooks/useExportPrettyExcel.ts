import * as Excel from 'exceljs'
import ExcelFormattable from '../models/ExcelFormattable'
const FileSaver = require('file-saver');

interface ExcelSheetData {
    sheetName: string
    data: ExcelFormattable[]
    startingRow: number
    spliceAt?: number
}

const useExportPrettyExcel = () => {

    const exportPrettyExcel = async (sheetData: ExcelSheetData[], filename: string, templatePath: string) => {
        const workbook = new Excel.Workbook()
        const workbookTemplate =  await fetch(templatePath)
        const workbookArrayBuffer = await workbookTemplate.arrayBuffer()
        const book = await workbook.xlsx.load(workbookArrayBuffer)
        book.clearThemes()

        for (const sheet of sheetData) {
            const worksheet = book.getWorksheet(sheet.sheetName)
            const excelData: string[][] = []

            for (const item of sheet.data) {
                excelData.push(item.toExcelRow())
            }

            worksheet.insertRows(sheet.startingRow, excelData, 'i+')
            worksheet.spliceRows(sheet.spliceAt ?? sheet.startingRow - 1, 1)

        }

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer])
        FileSaver.saveAs(blob, filename)
    }

    return {exportPrettyExcel}

}

export default useExportPrettyExcel