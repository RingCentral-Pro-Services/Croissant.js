import { DataGridFormattable } from "../../../../models/DataGridFormattable"

export interface DepartmentData {
    id: number
    name: string
    addedByName: string
    addedByEmail: string
}

export class Department implements DataGridFormattable {
    constructor (public data: DepartmentData) {}

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
        return this.data[key as keyof DepartmentData]
    }

}