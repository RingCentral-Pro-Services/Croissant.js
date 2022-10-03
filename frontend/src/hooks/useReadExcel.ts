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

    return {readFile, excelData, isExcelDataPending, excelSheets, readSheetNames}
}

export default useReadExcel