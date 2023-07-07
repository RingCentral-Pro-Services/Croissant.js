import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { ERL } from "../../../Automatic Location Updates/models/ERL";

export class ERLRow implements ExcelFormattable {
    constructor(public data: ERL) {}

    toExcelRow(): string[] {
        return [
            this.data.name,
            this.data.site?.name ?? '',
            this.data.address.street,
            this.data.address.street2 ?? '',
            this.data.address.city,
            this.data.address.state,
            this.data.address.zip,
            this.data.address.country
        ]
    }
}