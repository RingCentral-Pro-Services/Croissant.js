import ExcelFormattable from "../../../../../models/ExcelFormattable"

export class CustomRoleExport implements ExcelFormattable {
    constructor(public role: Role) {}

    toExcelRow(): string[] {
        return [
            this.role.displayName,
            this.role.description ?? '',
            this.role.permissions.find((permission) => permission.id === '')?.readOnly ? 'Yes' : 'No' ?? ''
        ]
    }
}

export interface Role {
    uri?: string
    id?: string
    displayName: string
    description?: string
    custom: boolean
    scope: string
    hidden: boolean
    lastUpdated?: boolean
    siteCompatible: boolean
    permissions: RolePermission[]
}

export interface RolePermission {
    uri: string
    id: string 
    assignable?: boolean
    readOnly?: boolean
    siteCompatible?: boolean
}