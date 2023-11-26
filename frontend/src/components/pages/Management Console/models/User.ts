import { DataGridFormattable } from "../../../../models/DataGridFormattable"

export interface UserData {
    id: number
    name: string
    externalId: string
    addedByName: string
    addedByEmail: string
    createdAt: Date
    updatedAt: Date
}

export class User implements DataGridFormattable {
    constructor(public data: UserData) {}

    toDataGridRow(): any {
        return {
            id: this.data.id,
            name: this.data.name,
            addedBy: this.data.addedByName,
        }
    }

    toDataGidHeader(): any {
        return [
            { field: 'name', headerName: 'Name', width: 300 },
            { field: 'addedBy', headerName: 'Added By', width: 300 },
        ]
    }

    property(key: string): any {
        return this.data[key as keyof UserData]
    }
}