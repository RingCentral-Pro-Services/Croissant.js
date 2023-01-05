import { GridColDef, GridValidRowModel } from "@mui/x-data-grid"
import { DataGridFormattable } from "./DataGridFormattable"
import ExcelFormattable from "./ExcelFormattable"

export interface CallMonitoringGroupData {
    name: string
    id?: string
    monitoredExtensions?: string[]
    monitoringExtensions?: string[]
    members?: CallMonitoringMember[]
}

export interface CallMonitoringMember {
    id: string
    permissions: string[]
    extensionNumber?: string
}


export class CallMonitoringGroup implements ExcelFormattable, DataGridFormattable {
    constructor(public data: CallMonitoringGroupData) {
        this.data.members = []
        if (!this.data.id) {
            this.data.id = this.randomID().toString()
        }
    }

    addMember(id: string, permission: string) {
        if (!this.hasMember(id)) {
            this.data.members!.push({
                id,
                permissions: [permission],
            })
        }
        else {
            const member = this.data.members!.find((member) => member.id === id)
            if (member) {
                member.permissions.push(permission)
            }
        }
    }

    hasMember(id: string) {
        return this.data.members!.some((member) => member.id === id)
    }

    toExcelRow(): string[] {
        return [
            this.data.name,
            this.data.members?.filter((member) => member.permissions.includes('Monitored')).map((member) => member.id).join(',')!,
            this.data.members?.filter((member) => member.permissions.includes('Monitoring')).map((member) => member.id).join(',')!
        ]
    }

    toDataGridRow(): any {
        return {
            id: this.data.id ?? '',
            name: this.data.name,
            monitoredExtensions: this.data.monitoredExtensions,
            monitoringExtensions: this.data.monitoringExtensions
        } 
    }

    toDataGidHeader() {
        return [
            { field: 'name', headerName: 'Name', width: 200 },
            { field: 'monitoredExtensions', headerName: 'Monitored Extensions', width: 500 },
            { field: 'monitoringExtensions', headerName: 'Monitoring Extensions', width: 500 },
        ]
    }

    property(key: string) {
        return this.data[key as keyof CallMonitoringGroupData]
    }

    payload() {
        return {
            name: this.data.name
        }
    }

    membersPayload() {
        return {
            addedExtensions: this.data.members
        }
    }

    randomID = () => {
        return Math.floor(Math.random() * 1000000)
    }
}