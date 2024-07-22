import { DataGridFormattable } from "../../../../../models/DataGridFormattable";
import { PhoneNumber } from "../../../Migration/User Data Download/models/UserDataBundle"

export class PhoneNumberNamePair implements DataGridFormattable {
    constructor(public number: PhoneNumber, public name: string) {}

    toDataGidHeader(): any {
        return [
            { field: 'phoneNumber', headerName: 'Phone Number', width: 200 },
            { field: 'name', headerName: 'Name', width: 300 },
        ]
    }

    toDataGridRow(): any {
        return {
            id: `${this.name}-${this.number.id}`,
            phoneNumber: this.number.phoneNumber,
            name: this.name
        }
    }

    property(key: string) {
        return this[key as keyof PhoneNumberNamePair]
    }
}