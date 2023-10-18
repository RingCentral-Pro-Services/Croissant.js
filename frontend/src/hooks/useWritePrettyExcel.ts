import * as Excel from 'exceljs'
import ExcelFormattable from '../models/ExcelFormattable'
const FileSaver = require('file-saver');

const useWritePrettyExcel = () => {
    const writePrettyExcel = (header: string[], data: ExcelFormattable[], sheetname: string, filename: string, templatePath?: string, setupSheet?: (sheet: Excel.Worksheet) => void) => {
        const excelData: string[][] = []
        if (!templatePath) excelData[0] = header
        
        for (const item of data) {
            excelData.push(item.toExcelRow())
        }

        if (templatePath) {
            writeTemplatedXLSX(excelData, sheetname, filename, templatePath, setupSheet)
        }
        else {
            writeXLSX(excelData, sheetname, filename, setupSheet)
        }
    }

    const writeTemplatedXLSX = (excelData: string[][], sheetname: string, filename: string, templatePath: string, setupSheet?: (sheet: Excel.Worksheet) => void) => {
        const workbook = new Excel.Workbook()

        fetch(templatePath)
        .then((res) => {
            res.arrayBuffer()
            .then((buffer) => {
                workbook.xlsx.load(buffer)
                .then((book) => {
                    book.clearThemes()

                    const worksheet = workbook.getWorksheet(sheetname)

                    if (setupSheet) {
                        setupSheet(worksheet)
                    }

                    worksheet.insertRows(3, excelData, 'i+')
                    worksheet.spliceRows(2, 1)

                    workbook.xlsx.writeBuffer()
                    .then((data) => {
                        const blob = new Blob([data])
                        FileSaver.saveAs(blob, filename)
                    })

                })
            })
        })
        .catch((reason) => {
            console.log(`error fetching: ${reason}`)
        })
    }

    const writeXLSX = (excelData: string[][], sheetname: string, filename: string, setupSheet?: (sheet: Excel.Worksheet) => void) => {
        const workbook = new Excel.Workbook()
        const worksheet = workbook.addWorksheet(sheetname)

        if (setupSheet) {
            setupSheet(worksheet)
        }
        
        worksheet.insertRows(1, excelData)

        workbook.xlsx.writeBuffer()
        .then((data) => {
            const blob = new Blob([data])
            FileSaver.saveAs(blob, filename)
        })
    }

    return {writePrettyExcel}

}

export default useWritePrettyExcel