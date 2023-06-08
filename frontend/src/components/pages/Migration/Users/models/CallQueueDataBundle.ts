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
}

interface CallQueueMember {
    uri?: string
    id: string
    extensionNumber: string
}