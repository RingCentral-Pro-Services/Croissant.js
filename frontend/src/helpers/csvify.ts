import CSVFormattable from "../models/CSVFormattable"

const csvify = (headers: string[], items: CSVFormattable[]) => {
    let csvData = ""

    for (let index = 0; index < headers.length - 1; index++) {
        csvData += `${headers[index]},`
    }
    csvData += headers[headers.length - 1] // This is done to prevent a trailing comma
    csvData += '\n'

    for (let index = 0; index < items.length; index++) {
        csvData += items[index].toRow()
        csvData += '\n'
    }

    return csvData
}

export default csvify