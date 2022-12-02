import { DataTableFormattable } from "./DataTableFormattable";

export class EditedExtension implements DataTableFormattable {
    constructor (public id: string, public oldFirsstName: string, public newFirstName: string, public oldLastName: string, public newLastName: string, public oldEmail: string, public newEmail: string, public type: string) {}

    toDataTableRow(): string[] {
        return [this.oldFirsstName, this.newFirstName, this.oldLastName, this.newLastName, this.oldEmail, this.newEmail]
    }

    payload() {
        return {contact: {firstName: this.newFirstName, email: this.newEmail, ...(this.type === 'User' && {lastName: this.newLastName})}}
    }
}