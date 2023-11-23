import { RegionalSettings } from "../../../../../models/RegionalSettings"
import { BusinessHours, CallHandling, Device, Notifications, PhoneNumber } from "../../../Migration/User Data Download/models/UserDataBundle"

export interface RingGroup {
    id?: string
    originalExtensionId?: string
    hasFatalError?: boolean
    extensionNumber: string
    businessHours?: BusinessHours
    name: string
    email: string
    regionalSettings: RegionalSettings
    type: string
    subType?: string
    site?: {
        id: string
        name: string
    }
    devices: Device[]
    businessHoursCallHandling?: CallHandling
    afterHoursCallHandling?: CallHandling
    notificationSettings?: Notifications
    directNumbers?: PhoneNumber[]
}