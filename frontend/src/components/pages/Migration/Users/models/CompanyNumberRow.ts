import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class CompanyNumberRow implements ExcelFormattable {
    constructor(public data: PhoneNumber) {}

    toExcelRow(): string[] {
        return [
            '', // Initial on completion. Ignored.
            this.data.site?.name ?? '',
            this.data.label ?? '',
            this.data.type,
            this.data.phoneNumber,
            '', // Temp number. Ignored.
            '', // Lucidchart link. Ignored.
            '', // Notes. Ignored.
        ]
    }
}