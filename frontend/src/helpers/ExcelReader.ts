import * as xlsx from 'xlsx'

export class ExcelReader {
    constructor(private file: File) { }

    async read(sheetName: string): Promise<any[]> {
        const excelData: any[] = []
        const buffer = await this.file.arrayBuffer()
        let wb = xlsx.read(buffer);
        const sheets = wb.SheetNames
        if (sheets.length === 1) {
            // Workbook only has one sheet, read it and return it
            const temp = xlsx.utils.sheet_to_json(
                wb.Sheets[wb.SheetNames[0]])
            temp.forEach((res: any) => {
                excelData.push(res)
            })
        }
        else {
            // Search for the IVRs sheet
            for (let i = 0; i < sheets.length; i++) {
                if (wb.SheetNames[i] === sheetName) {
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

    async readVerticalExcel(sheetName: string = "") {
        const excelData: any[] = []
        const buffer = await this.file.arrayBuffer()
        let wb = xlsx.read(buffer);
        const sheets = wb.SheetNames

        if (sheets.length === 1) {
            // Workbook only has one sheet, read it and return it
            // let workbook = xlsx.read(data);
            const temp = xlsx.utils.sheet_to_json(
                wb.Sheets[wb.SheetNames[0]])
            temp.forEach((res: any) => {
                excelData.push(res)
            })
        }
        else {
            // Search for the sheet
            for (let i = 0; i < sheets.length; i++) {
                if (wb.SheetNames[i] === sheetName) {
                    const temp = xlsx.utils.sheet_to_json(
                        wb.Sheets[wb.SheetNames[i]], { raw: true, header: 1 })

                    // The code below was borrowed from a response to a github issue
                    // It converts the vertical excel to a nice easy to use json object
                    // It's not super readable, but it works
                    var max: number = temp.reduce(function (x: any, y: any) { return Math.max(x, y.length); }, 0) as number
                    var o = new Array(max - 1);
                    for (var index = 0; index < max - 1; ++index) o[index] = {};
                    temp.forEach(function (row: any) { row.slice(1).forEach(function (elt: any, index: number) { o[index][row[0]] = elt; }); });

                    // Remove elements where all values are undefined or empty string
                    o = o.filter((obj: any) => Object.values(obj).some((val: any) => val !== undefined && val !== ''))

                    o.forEach((res: any) => {
                        excelData.push(res)
                    })
                }
            }
        }

        return excelData
    }
}