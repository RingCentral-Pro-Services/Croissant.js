export interface Role {
    uri?: string
    id?: string
    displayName: string
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