export class UserGroupDataBundle {
    constructor(public data: UserGroupBaseData) {}
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