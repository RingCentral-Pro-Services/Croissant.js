import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import { DataGridFormattable } from "../../../../../models/DataGridFormattable";

export class PhoneNumberPayload implements DataGridFormattable {
    constructor(public phoneNumber: string, public phoneNumberID: string, public extensionNumber: string, public extensionID?: string, public id: string = '') {
        this.id = this.randomID().toString()
    }

    toDataGidHeader(): any {
        return [
            { field: 'phoneNumber', headerName: 'Phone Number', width: 200 },
            { field: 'extensionNumber', headerName: 'Extension', width: 300 },
        ]
    }

    toDataGridRow(): any {
        return {
            id: this.id,
            phoneNumber: this.phoneNumber,
            extensionNumber: this.extensionNumber !== '' ? this.extensionNumber : 'Auto-Receptionist'
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
            usageType: this.extensionID ? 'DirectNumber' : 'CompanyNumber',
            ... (this.extensionID && { extension: { id: this.extensionID } })
        }
    }

}