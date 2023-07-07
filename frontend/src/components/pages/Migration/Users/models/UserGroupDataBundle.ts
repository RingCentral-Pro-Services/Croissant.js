import ExcelFormattable from "../../../../../models/ExcelFormattable"

export class UserGroupDataBundle implements ExcelFormattable {
    constructor(public data: UserGroupBaseData) {}

    toExcelRow(): string[] {
        return [
            this.data.displayName,
            this.data.managers.map((manager) => `${manager.firstName} ${manager.lastName} - Ext. ${manager.extensionNumber}`).join(', '),
            this.data.members?.map((member) => member.extensionNumber).join(', ') ?? '',
            this.data.description ?? ''
        ]
    }
}

interface UserGroupBaseData {
    uri?: string
    id?: string
    displayName: string
    description: string
    managers: UserGroupManager[]
    members?: UserGroupMember[]
}

export interface UserGroupManager {
    uri?: string
    id: string
    extensionNumber?: string
    firstName?: string
    lastName?: string
}

export interface UserGroupMember {
    uri?: string
    id: string
    extensionNumber?: string
}