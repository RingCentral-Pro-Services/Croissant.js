import { GridColDef } from "@mui/x-data-grid";
import { DataGridFormattable } from "../../../../../models/DataGridFormattable";
import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Extension } from "../../../../../models/Extension";

export class DuplicateEmail implements ExcelFormattable, DataGridFormattable {
    constructor( public email: string, public extensions: Extension[] ) {}

    toExcelRow(): string[] {
        return [
            this.email,
            `${this.extensions.length}`,
            this.extensions.map((ext) => `${ext.data.name} - ${ext.data.extensionNumber}`).join(", "),
            this.extensions.map((ext) => ext.prettyType()).join(", ")
        ]
    }

    toDataGridRow(): any {
        return {
            id: this.email,
            email: this.email,
            count: this.extensions.length,
            extensions: this.extensions.map((ext) => `${ext.data.name} - ${ext.data.extensionNumber}`).join(", "),
            types: this.extensions.map((ext) => ext.prettyType()).join(", ")
        }
    }

    toDataGidHeader(): any {
        return [
            { field: 'email', headerName: 'Email', width: 200 },
            { field: 'count', headerName: 'Appearances', width: 100 },
            { field: 'extensions', headerName: 'Extensions', width: 500 },
            { field: 'types', headerName: 'Types', width: 300 },
        ]
    }

    property(key: string): any {
        return this[key as keyof DuplicateEmail]
    }
}