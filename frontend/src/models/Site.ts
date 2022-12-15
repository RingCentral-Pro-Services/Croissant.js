import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import { DataGridFormattable } from "./DataGridFormattable";
import { DataTableFormattable } from "./DataTableFormattable";
import ExcelFormattable from "./ExcelFormattable";

export class Site implements ExcelFormattable, DataTableFormattable, DataGridFormattable {
    constructor(public id: string, public name: string, public extensionNumber: number) {}

    toExcelRow(): string[] {
        return [this.id, this.name, `${this.extensionNumber}`]
    }

    toDataTableRow(): string[] {
        return this.toExcelRow()
    }

    toDataGridRow(): any {
        let result = {
            id: this.id,
            name: this.name,
            extensionNumber: this.extensionNumber,
        }

        return result
    }

    toDataGidHeader(): any {
        let result: GridColDef[] = [
            { field: 'id', headerName: 'ID', width: 300 },
            { field: 'name', headerName: 'Name', width: 300 },
            { field: 'extensionNumber', headerName: 'Extension Number', width: 300 },
        ]

        return result
    }

    property(key: string): any {
        if (key === 'site') {
            return this.name ?? 'N/A'
        }
        return this[key as keyof Site]
    }
}