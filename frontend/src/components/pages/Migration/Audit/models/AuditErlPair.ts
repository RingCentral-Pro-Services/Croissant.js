import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { ERL } from "../../../Automatic Location Updates/models/ERL";

export class AuditErlPair implements ExcelFormattable {
    constructor(private originalErl: ERL, private newErl: ERL | undefined) {}

    toExcelRow(): string[] {
        return [
            this.originalErl.name,
            this.originalErl.site?.name,
            this.newErl?.site?.name ?? '',
            this.originalErl.site?.name == this.newErl?.site?.name ? 'TRUE' : 'FALSE',
            this.originalErl.address.street,
            this.newErl?.address.street ?? '',
            this.originalErl.address.street == this.newErl?.address.street ? 'TRUE' : 'FALSE',
            this.originalErl.address.street2,
            this.newErl?.address.street2 ?? '',
            this.originalErl.address.street2 == this.newErl?.address.street2 ? 'TRUE' : 'FALSE',
            this.originalErl.address.city,
            this.newErl?.address.city ?? '',
            this.originalErl.address.city == this.newErl?.address.city ? 'TRUE' : 'FALSE',
            this.originalErl.address.state,
            this.newErl?.address.state ?? '',
            this.originalErl.address.state == this.newErl?.address.state ? 'TRUE' : 'FALSE',
            this.originalErl.address.zip,
            this.newErl?.address.zip ?? '',
            this.originalErl.address.zip == this.newErl?.address.zip ? 'TRUE' : 'FALSE',
            this.originalErl.address.country,
            this.newErl?.address.country ?? '',
            this.originalErl.address.country == this.newErl?.address.country ? 'TRUE' : 'FALSE',
        ]
    }
}