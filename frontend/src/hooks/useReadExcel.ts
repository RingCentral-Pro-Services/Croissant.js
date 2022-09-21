import * as xlsx from 'xlsx'

const useReadExcel = () => {

    const readFile = (file: File, sheetName: string = "") => {
        file.arrayBuffer()
        .then((data) => {
            const workbook = xlsx.read(data)
            if (sheetName == "") {
                // Sheet name empty, just read the first sheet
            }

        })
        .catch((error: Error) => {
            console.log('Something bad happened', error)
        })
    }

    return {readFile}
}

export default useReadExcel