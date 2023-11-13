import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { ERL } from "../../../Automatic Location Updates/models/ERL";

export class ExportableERL implements ExcelFormattable {
    constructor(private erl: ERL) {}

    toExcelRow() {
        return [
            this.erl.name,
            this.erl.site?.name,
            this.erl.address.street,
            this.erl.address.street2,
            this.erl.address.city,
            this.erl.address.state,
            this.erl.address.zip,
            this.erl.address.country,
        ]
    }
}