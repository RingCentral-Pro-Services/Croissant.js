import { DataGridFormattable } from "./DataGridFormattable";
import { DataTableFormattable } from "./DataTableFormattable";
import { GridColDef } from "@mui/x-data-grid";

export class EditedExtension implements DataTableFormattable, DataGridFormattable {
    constructor (public id: string, public oldFirsstName: string, public newFirstName: string, public oldLastName: string, public newLastName: string, public oldEmail: string, public newEmail: string, public type: string) {}

    toDataTableRow(): string[] {
        return [this.oldFirsstName, this.newFirstName, this.oldLastName, this.newLastName, this.oldEmail, this.newEmail]
    }

    payload() {
        return {contact: {firstName: this.newFirstName, email: this.newEmail, ...(this.type === 'User' && {lastName: this.newLastName})}}
    }

    toDataGridRow(): any {
        let result = {
            id: this.id,
            oldFirsstName: this.oldFirsstName,
            newFirstName: this.newFirstName,
            oldLastName: this.oldLastName,
            newLastName: this.newLastName,
            oldEmail: this.oldEmail,
            newEmail: this.newEmail,
        }

        return result
    }

    toDataGidHeader(): any {
        let result: GridColDef[] = [
            { field: 'oldFirsstName', headerName: 'Old First Name', width: 300 },
            { field: 'newFirstName', headerName: 'New First Name', width: 300 },
            { field: 'oldLastName', headerName: 'Old Last Name', width: 300 },
            { field: 'newLastName', headerName: 'New Last Name', width: 300 },
            { field: 'oldEmail', headerName: 'Old Email', width: 300 },
            { field: 'newEmail', headerName: 'New Email', width: 300 },
        ]

        return result
    }

    property(key: string): any {
        return this[key as keyof EditedExtension]
    }

}