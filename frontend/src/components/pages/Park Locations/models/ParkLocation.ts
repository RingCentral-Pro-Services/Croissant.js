import ExcelFormattable from "../../../../models/ExcelFormattable"

export class ParkLocation implements ExcelFormattable {
    constructor(public data: ParkLocationData) {}

    toExcelRow(): string[] {
        return [this.data.name, this.data.extensionNumber, this.data.status, this.data.members.join(", ")]
    }
}


interface ParkLocationData {
    name: string
    extensionNumber: string
    id: string
    status: string
    members: string[]
}