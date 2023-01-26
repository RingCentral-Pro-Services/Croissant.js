import { GridValidRowModel, GridColDef } from "@mui/x-data-grid";
import { DataGridFormattable } from "./DataGridFormattable";
import ExcelFormattable from "./ExcelFormattable";

export class IntercomStatus implements ExcelFormattable, DataGridFormattable {
    constructor(
        public id: string,
        public extensionName: string,
        public extensionNumber: string,
        public intercomStatus: string,
        public intercomDevice: string,
        public intercomDeviceId: string,
        public users?: IntercomUser[]
    ) {}

    toDataGridRow(): any {
        return {
            id: this.id,
            extensionName: this.extensionName,
            extensionNumber: this.extensionNumber,
            intercomStatus: this.intercomStatus,
            intercomDevice: this.intercomDevice,
            users: this.users?.map(user => user.extensionNumber).join(', ') ?? ''
        }
    }

    toDataGidHeader(): GridColDef<any, any, any>[] {
        return [
            { field: 'id', headerName: 'ID', width: 100 },
            { field: 'extensionName', headerName: 'Extension Name', width: 200 },
            { field: 'extensionNumber', headerName: 'Extension Number', width: 200 },
            { field: 'intercomStatus', headerName: 'Intercom Status', width: 200 },
            { field: 'intercomDevice', headerName: 'Intercom Device', width: 200 },
            { field: 'users', headerName: 'Users', width: 200 },
        ]
    }

    property(key: string) {
        return this[key as keyof IntercomStatus]
    }

    toExcelRow() {
        return [this.id, this.extensionName, this.extensionNumber, this.intercomStatus, this.intercomDevice, this.users?.map(user => user.extensionNumber).join(', ') ?? '']
    }

    payload() {
        return {
            enabled: this.intercomStatus === 'Enabled',
            ...(this.intercomStatus === 'Enabled' && { device: {id: this.intercomDeviceId }}),
        }
    }
}

export interface IntercomUser {
    id: string
    name: string
    extensionNumber: string
}