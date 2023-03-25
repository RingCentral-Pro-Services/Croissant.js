import { DataGridFormattable } from "../../../../models/DataGridFormattable"
import ExcelFormattable from "../../../../models/ExcelFormattable"

export class UserGroup implements DataGridFormattable, ExcelFormattable {
    constructor(public data: UserGroupData, public id?: string) {
        this.id = Math.floor(Math.random() * 888888 + 111111).toString()
    }

    toExcelRow(): string[] {
        return [
            this.data.id ?? "",
            this.data.displayName,
            this.data.description,
            this.data.managers ? this.data.managers.map(manager => manager.extensionNumber).join(", ") : "",
            this.data.users ? this.data.users.map(user => user.extensionNumber).join(", ") : ""
        ]
    }

    toDataGidHeader() {
        return [
            { field: "name", headerName: "Name", width: 200 },
            { field: "description", headerName: "Description", width: 200 },
            { field: "users", headerName: "Users", width: 200 },
            { field: "managers", headerName: "Managers", width: 200 },
        ]
    }

    toDataGridRow(): any {
        return {
            id: `${this.id}`,
            name: this.data.displayName,
            description: this.data.description,
            users: this.data.users.map(user => user.name).join(", "),
            managers: this.data.managers.map(manager => manager.name).join(", "),
        }
    }

    property(key: string) {
        return this.data[key as keyof UserGroupData]
    }

    payload() {
        const members = this.data.users.map(user => {
            return {
                id: user.id
            }
        })
        const manager = {
            id: this.data.managers[0].id
        }
        return {
            ...(this.data.id && {id: this.data.id}),
            displayName: this.data.displayName,
            ...(this.data.description && {description: this.data.description}),
            members: members,
            managers: [manager]
        }
    }

}

export interface UserGroupData {
    id?: string
    displayName: string
    description: string
    users: UserGroupMember[]
    managers: UserGroupManager[]
}

export interface UserGroupMember {
    id: string
    name?: string
    extensionNumber?: string
}

export interface UserGroupManager {
    id: string
    name?: string
    extensionNumber?: string
}