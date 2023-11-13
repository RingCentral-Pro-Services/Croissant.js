import * as Excel from 'exceljs'
import ExcelFormattable from '../models/ExcelFormattable'
const FileSaver = require('file-saver');

interface ExcelSheetData {
    sheetName: string
    data: ExcelFormattable[]
    startingRow: number
    spliceAt?: number
    startingColumnIndex?: number
    vertical?: boolean
}

const useExportPrettyExcel = () => {

    const exportPrettyExcel = async (sheetData: ExcelSheetData[], filename: string, templatePath: string) => {
        const workbook = new Excel.Workbook()
        const workbookTemplate = await fetch(templatePath)
        const workbookArrayBuffer = await workbookTemplate.arrayBuffer()
        const book = await workbook.xlsx.load(workbookArrayBuffer)
        book.clearThemes()

        for (const sheet of sheetData) {
            const worksheet = book.getWorksheet(sheet.sheetName)

            if (!worksheet) {
                console.log(`Worksheet ${sheet.sheetName} not found`)
                continue
            }

            const excelData: string[][] = []

            for (const item of sheet.data) {
                try {
                    excelData.push(item.toExcelRow())
                }
                catch (e) {
                    console.log('Failed to write excel row')
                }
            }

            if (sheet.vertical) {
                excelData.forEach((column, columnIndex) => {
                    column.forEach((cellValue, rowIndex) => {
                        const cell = worksheet.getCell(rowIndex + sheet.startingRow, columnIndex + sheet.startingColumnIndex!);
                        cell.value = cellValue;
                    });
                });
            } else {
                worksheet.insertRows(sheet.startingRow, excelData, 'i+')
                worksheet.spliceRows(sheet.spliceAt ?? sheet.startingRow - 1, 1)
            }

        }

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer])
        FileSaver.saveAs(blob, filename)
    }

    return { exportPrettyExcel }

}

export default useExportPrettyExcel