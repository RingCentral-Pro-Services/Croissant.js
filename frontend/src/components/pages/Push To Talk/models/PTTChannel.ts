import { DataGridFormattable } from "../../../../models/DataGridFormattable"
import ExcelFormattable from "../../../../models/ExcelFormattable"

export class PTTChannel implements DataGridFormattable, ExcelFormattable {
    constructor(public data: PTTChannelData) {}

    toExcelRow(): string[] {
        return [this.data.id, this.data.name, this.data.members.map((member) => member.extensionId).join(', ')]
    }

    toDataGidHeader() {
        return [
            { field: "name", headerName: "Name", width: 300 },
            { field: "members", headerName: "Members", width: 600 },
        ]
    }

    toDataGridRow(): any {
        return {
            id: this.data.name,
            name: this.data.name,
            members: this.data.members.map((member) => member.extensionId).join(', ')
        }
    }

    property(key: string) {
        return this.data[key as keyof PTTChannelData]
    }
}

export interface PTTChannelData {
    id: string
    name: string
    members: PTTChannelMember[]
}

export interface PTTChannelMember {
    extensionId: string
}