import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Extension } from "../../../../../models/Extension";

export class ParkLocationDataBundle implements ExcelFormattable {
    constructor(public extension: Extension, public members?: ParkLocationMember[]) {}

    toExcelRow(): string[] {
        return [
            this.extension.data.name,
            this.extension.data.extensionNumber,
            this.members?.map((member) => member.extensionNumber).join(', ') ?? ''
        ]
    }
}

export interface ParkLocationMember {
    id: string
    uri?: string
    name?: string
    extensionNumber: string
    partnerId?: string
}