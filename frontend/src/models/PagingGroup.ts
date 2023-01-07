import { GridColDef } from "@mui/x-data-grid"
import { DataGridFormattable } from "./DataGridFormattable"
import ExcelFormattable from "./ExcelFormattable"
import { ProspectiveExtension } from "./ProspectiveExtension"

export interface PagingGroupData {
    name: string
    extensionNumber: string
    id?: string
    usersAlowedToPage: ProspectiveExtension[]
    devicesToReceivePage: ProspectiveExtension[]
}

export class PagingGroup implements ExcelFormattable, DataGridFormattable {

    public dataGridID: string = ''
    public deviceIDs: string[] = []

    constructor(public data: PagingGroupData) {
        this.dataGridID = this.randomID().toString()
    }

    toExcelRow(): string[] {
        return [
            this.data.name,
            this.data.id ?? '',
            this.data.usersAlowedToPage.map((u) => u.extensionNumber).join(", "),
            this.data.devicesToReceivePage.map((u) => u.extensionNumber).join(", ")
        ]
    }

    toDataGridRow(): any {
        return {
            name: this.data.name,
            id: this.dataGridID,
            extensionNumber: this.data.extensionNumber,
            usersAlowedToPage: this.data.usersAlowedToPage.map((u) => u.extensionNumber).join(", "),
            devicesToReceivePage: this.data.devicesToReceivePage.map((u) => u.extensionNumber).join(", ")
        }
    }

    toDataGidHeader() {
        return [
            { field: 'name', headerName: 'Name', width: 200 },
            { field: 'extensionNumber', headerName: 'Extension', width: 100 },
            { field: 'usersAlowedToPage', headerName: 'Users Allowed to Page', width: 600 },
            { field: 'devicesToReceivePage', headerName: 'Devices to Receive Page', width: 600 },
        ]
    }

    property (key: string)  {
        if (key === 'id') {
            return this.data.id ?? ''
        }
        return this.data[key as keyof PagingGroupData]
    }

    randomID = () => {
        return Math.floor(Math.random() * 1000000)
    }

    payload() {
        return {
            contact: {
                firstName: this.data.name,
            },
            extensionNumber: this.data.extensionNumber,
            type: 'PagingOnly'
        }
    }

    membersPayload() {
        return {
            addedUserIds: this.data.usersAlowedToPage.map((u) => u.id),
            addedDeviceIds: this.deviceIDs
        }
    }

}