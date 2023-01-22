import { useState } from 'react'
import * as xlsx from 'xlsx'

const useReadExcel = () => {

    const [excelData, setData] = useState<any[]>([])
    const [isExcelDataPending, setIsExcelDataPending] = useState(true)
    const [excelSheets, setSheetNames] = useState<string[]>([])

    const readSheetNames = (file: File) => {
        file.arrayBuffer()
        .then((data) => {
            let workbook = xlsx.read(data)
            setSheetNames(workbook.SheetNames)
        })
    }

    const readFile = (file: File, sheetName: string = "") => {

        file.arrayBuffer()
        .then((data) => {
            let workbook = xlsx.read(data);
            const sheets = workbook.SheetNames
            if (sheets.length === 1) {
                // Workbook only has one sheet, read it and return it
                let workbook = xlsx.read(data);
                const temp = xlsx.utils.sheet_to_json(
                    workbook.Sheets[workbook.SheetNames[0]])
                    temp.forEach((res: any) => {
                        excelData.push(res)
                })
            }
            else {
                // Search for the IVRs sheet
                for (let i = 0; i < sheets.length; i++) {
                    if (workbook.SheetNames[i] === sheetName) {
                        const temp = xlsx.utils.sheet_to_json(
                            workbook.Sheets[workbook.SheetNames[i]])
                            temp.forEach((res: any) => {
                                excelData.push(res)
                        })
                    }
                }
            }
        })
        .catch((error: Error) => {
            console.log('Something bad happened', error)
        })
        .finally(() => {
            setIsExcelDataPending(false)
        })
    }

    const readVerticalExcel = (file: File, sheetName: string = "") => {

        file.arrayBuffer()
        .then((data) => {
            let workbook = xlsx.read(data);
            const sheets = workbook.SheetNames
            if (sheets.length === 1) {
                // Workbook only has one sheet, read it and return it
                let workbook = xlsx.read(data);
                const temp = xlsx.utils.sheet_to_json(
                    workbook.Sheets[workbook.SheetNames[0]])
                    temp.forEach((res: any) => {
                        excelData.push(res)
                })
            }
            else {
                // Search for the sheet
                for (let i = 0; i < sheets.length; i++) {
                    if (workbook.SheetNames[i] === sheetName) {
                        const temp = xlsx.utils.sheet_to_json(
                            workbook.Sheets[workbook.SheetNames[i]], {raw: true, header: 1})

                            // The code below was borrowed from a response to a github issue
                            // It converts the vertical excel to a nice easy to use json object
                            // It's not super readable, but it works
                            var max: number = temp.reduce(function (x: any, y: any) { return Math.max(x, y.length); }, 0) as number
                            var o = new Array(max-1);
                            for(var index = 0; index < max-1; ++index) o[index] = {};
                            temp.forEach(function (row: any) { row.slice(1).forEach(function (elt: any, index: number) { o[index][row[0]] = elt; }); });

                            // Remove elements where all values are undefined or empty string
                            o = o.filter((obj: any) => Object.values(obj).some((val: any) => val !== undefined && val !== ''))

                            o.forEach((res: any) => {
                                excelData.push(res)
                        })
                    }
                }
            }
        })
        .catch((error: Error) => {
            console.log('Something bad happened', error)
        })
        .finally(() => {
            setIsExcelDataPending(false)
        })
    }

    return {readFile, readVerticalExcel, excelData, isExcelDataPending, excelSheets, readSheetNames}
}

export default useReadExcel