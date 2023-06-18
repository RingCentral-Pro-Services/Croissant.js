import { Extension } from "../../../../../models/Extension";
import { BusinessHours, CallHandling, Notifications, PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class CallQueueDataBundle {
    constructor(public extension: Extension, public extendedData?: ExtendedQueueData, public phoneNumberMap?: Map<string, string>) {}
}

export interface ExtendedQueueData {
    businessHours?: BusinessHours
    directNumbers?: PhoneNumber[]
    businessHoursCallHandling?: CallHandling
    afterHoursCallHandling?: CallHandling
    members?: CallQueueMember[]
    notifications?: Notifications
    otherSettings?: OtherSettings
    memberPresense?: MemberPresenseStatus[]
    pickupMembers?: PickupMember[]
    managers?: QueueManager[]
}

interface CallQueueMember {
    uri?: string
    id: string
    extensionNumber: string
}

interface OtherSettings {
    editableMemberStatus: boolean
    alertTimer: number
}

export interface MemberPresenseStatus {
    member: {
        id: string
        name?: string
        extensionNumber?: string
        site?: {
            id: string
            name: string
        }
    }
    acceptQueueCalls?: boolean
    acceptCurrentQueueCalls: boolean
}

interface PickupMember {
    id: string
    name?: string
    extensionNumber?: string
    site?: {
        id: string
        name?: string
    }
}

export interface QueueManager {
    extension: {
        id: string
        name?: string
        extensionNumber?: string
        site?: {
            id: string
            name?: string
        }
    }
    permission: string
}