import { DataGridFormattable } from "../../../../models/DataGridFormattable";

export interface CustomFieldAssignmentData {
    customFieldId: string;
    extensionId: string
    value: string;
    name: string
    extensionName: string
}

export class CustomFieldAssignment implements DataGridFormattable{
    constructor(public data: CustomFieldAssignmentData) {}

    toDataGridRow(): any {
        return {
            id: this.data.extensionId,
            name: this.data.name,
            extension: this.data.extensionName,
            value: this.data.value
        }
    }

    toDataGidHeader(): any {
        return [
            { field: 'extension', headerName: 'Extension', width: 200 },
            { field: 'name', headerName: 'Custom Field Name', width: 200 },
            { field: 'value', headerName: 'Value', width: 200 },
        ]
    }

    property(key: string): any {
        return this[key as keyof CustomFieldAssignment]
    }

}