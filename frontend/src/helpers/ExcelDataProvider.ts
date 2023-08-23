import * as xlsx from 'xlsx'
import { DataProvider } from "../models/Transformer";

export class ExcelDataProvider implements DataProvider {

    constructor(private file: File, private sheetName: string) {}

    // getData(): any[] {
    //     const excelData: any[] = []

    //     this.file.arrayBuffer()
    //     .then((data) => {
    //         let workbook = xlsx.read(data);
    //         const sheets = workbook.SheetNames
    //         if (sheets.length === 1) {
    //             // Workbook only has one sheet, read it and return it
    //             let workbook = xlsx.read(data);
    //             const temp = xlsx.utils.sheet_to_json(
    //                 workbook.Sheets[workbook.SheetNames[0]])
    //                 temp.forEach((res: any) => {
    //                     excelData.push(res)
    //             })
    //         }
    //         else {
    //             // Search for the IVRs sheet
    //             for (let i = 0; i < sheets.length; i++) {
    //                 if (workbook.SheetNames[i] === this.sheetName) {
    //                     const temp = xlsx.utils.sheet_to_json(
    //                         workbook.Sheets[workbook.SheetNames[i]])
    //                         temp.forEach((res: any) => {
    //                             excelData.push(res)
    //                     })
    //                 }
    //             }
    //         }
    //     })
    //     .catch((error: Error) => {
    //         console.log('Something bad happened', error)
    //     })
    //     .finally(() => {
    //         return excelData
    //     })
    //     return excelData
    // }

    async getData(): Promise<any[]> {
        const excelData: any[] = []
        const buffer = await this.file.arrayBuffer()
        let wb = xlsx.read(buffer);
        const sheets = wb.SheetNames
        if (sheets.length === 1) {
            // Workbook only has one sheet, read it and return it
            let workbook = xlsx.read(wb);
            const temp = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook.SheetNames[0]])
                temp.forEach((res: any) => {
                    excelData.push(res)
            })
        }
        else {
            // Search for the IVRs sheet
            for (let i = 0; i < sheets.length; i++) {
                if (wb.SheetNames[i] === this.sheetName) {
                    const temp = xlsx.utils.sheet_to_json(
                        wb.Sheets[wb.SheetNames[i]])
                        temp.forEach((res: any) => {
                            excelData.push(res)
                    })
                }
            }
        }
        return excelData
    }

    async bruh() {
        const excelData: any[] = []
        const buffer = await this.file.arrayBuffer()
        let wb = xlsx.read(buffer);
        const sheets = wb.SheetNames
        if (sheets.length === 1) {
            // Workbook only has one sheet, read it and return it
            let workbook = xlsx.read(wb);
            const temp = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook.SheetNames[0]])
                temp.forEach((res: any) => {
                    excelData.push(res)
            })
        }
        else {
            // Search for the IVRs sheet
            for (let i = 0; i < sheets.length; i++) {
                if (wb.SheetNames[i] === this.sheetName) {
                    const temp = xlsx.utils.sheet_to_json(
                        wb.Sheets[wb.SheetNames[i]])
                        temp.forEach((res: any) => {
                            excelData.push(res)
                    })
                }
            }
        }
        return excelData
    }
}