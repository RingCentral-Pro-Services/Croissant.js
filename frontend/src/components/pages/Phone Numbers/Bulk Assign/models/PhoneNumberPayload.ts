import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import { DataGridFormattable } from "../../../../../models/DataGridFormattable";

export class PhoneNumberPayload implements DataGridFormattable {
    constructor(public phoneNumber: string, public phoneNumberID: string, public extensionNumber: string, public extensionID: string, public id: string = '') {
        this.id = this.randomID().toString()
    }

    toDataGidHeader(): any {
        return [
            { field: 'phoneNumber', headerName: 'Phone Number', width: 200 },
            { field: 'extensionNumber', headerName: 'Extension', width: 100 },
        ]
    }

    toDataGridRow(): any {
        return {
            id: this.id,
            phoneNumber: this.phoneNumber,
            extensionNumber: this.extensionNumber
        }
    }

    property(key: string) {
        return this[key as keyof PhoneNumberPayload]
    }

    randomID = () => {
        return Math.floor(Math.random() * 1000000)
    }

    payload() {
        return {
            usageType: 'DirectNumber',
            extension: {
                id: this.extensionID
            }
        }
    }

}