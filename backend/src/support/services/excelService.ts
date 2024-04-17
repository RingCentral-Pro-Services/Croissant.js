import * as Excel from 'exceljs'
import { ExcelSheetData } from '../models/ExcelSheetData'
import logger from '../../utils/logger'
import { isCircular } from '../../utils/utils'

export const writeExcelFile = async (sheetData: ExcelSheetData[], filename: string,) => {
    const book = new Excel.Workbook()

    for (const sheet of sheetData) {
        let worksheet = book.getWorksheet(sheet.sheetName)

        if (!worksheet) {
            worksheet = book.addWorksheet(sheet.sheetName)
        }

        const excelData: string[][] = []

        for (const item of sheet.data) {
            try {
                excelData.push(item.toExcelRow())
            }
            catch (e) {
                console.log('Failed to write excel row')
                console.log(e)
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

    // const buffer = await book.xlsx.writeBuffer()
    try {
        await book.xlsx.writeFile(filename)
        logger.info({
            message: {
                customMessage: `Wrote xlsx file to ${filename}`
            }
        })
    }
    catch(e) {
        logger.error({
            message: {
                customMessage: 'Failed to write xlsx file',
                error: isCircular(e) ? '[circular object]' : e
            }
        })
    }
    // return buffer
}