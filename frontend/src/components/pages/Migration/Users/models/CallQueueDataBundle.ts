import { CallHandlingRules } from "../../../../../models/CallHandlingRules";
import { Extension } from "../../../../../models/Extension";
import { BusinessHours, Notifications, PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class CallQueueDataBundle {
    constructor(public extension: Extension, public extendedData?: ExtendedQueueData) {}
}

export interface ExtendedQueueData {
    businessHours?: BusinessHours
    directNumbers?: PhoneNumber[]
    businessHoursCallHandling?: CallHandlingRules
    afterHoursCallHandling?: CallHandlingRules
    members?: CallQueueMember[]
    notifications?: Notifications
    otherSettings?: OtherSettings
    memberPresense?: MemberPresenseStatus
    pickupMembers?: PickupMember[]
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

interface MemberPresenseStatus {
    member: {
        id: string
        name?: string
        extensionNumber?: string
        site?: {
            id: string
            name: string
        }
    }
    acceptQueueCalls: boolean
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