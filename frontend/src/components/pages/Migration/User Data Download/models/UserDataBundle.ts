import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Extension } from "../../../../../models/Extension";
import { Greeting } from "../../../../../models/Greetings";
import { UserDataRow } from "./UserDataRow";

export class UserDataBundle {
    constructor(public extension: Extension, public extendedData: ExtendedUserData | undefined) {}

    toRows(): UserDataRow[] {
        const rows: UserDataRow[] = []
        if (!this.extendedData?.devices) return []

        for (let i = 0; i < this.extendedData?.devices.length; i++) {
            const row = new UserDataRow(this.extension, this.extendedData.devices[i], this.extendedData.businessHoursCallHandling, this.extendedData.afterHoursCallHandling, this.extendedData.notifications, this.extendedData.callerID, this.extendedData.blockedCallSettings, this.extendedData.blockedPhoneNumbers, this.extendedData.presenseLines, this.extendedData.presenseSettings, this.extendedData.presenseAllowedUsers, this.extendedData.intercomStatus, this.extendedData.delegates, this.extendedData.pERLs, this.extendedData.roles, this.extendedData.incommingCallInfo, this.extendedData.businessHours)
            rows.push(row)
        }

        return rows
    }
}

export interface ExtendedUserData {
    devices: Device[]
    businessHoursCallHandling?: CallHandling
    afterHoursCallHandling?: CallHandling
    notifications?: Notifications
    callerID?: CallerID
    blockedCallSettings?: BlockedCallSettings
    blockedPhoneNumbers?: BlockedPhoneNumber[]
    presenseLines?: PresenseLine[]
    presenseSettings?: PresenseSettings
    presenseAllowedUsers?: PresenseAllowedUser[]
    intercomStatus?: IntercomStatus
    delegates?: Delegate[]
    pERLs?: ERL[]
    roles?: Role[]
    incommingCallInfo?: IncommingCallInfo
    businessHours?: BusinessHours
}

export interface Device {
    id: string
    uri: string
    sku: string
    type: string
    name: string
    serial: string
    status: string
    computerName: string
    model: {
        id: string
        name: string
        deviceClass: string
    }
    emergencyServiceAddress: {
        street: string
        street2: string
        city: string
        zip: string
        customerName: string
        state: string
        stateName: string
        country: string
        countryName: string

    }
    phoneLines: [{
        lineType: string
        phoneInfo: {
            phoneNumber: string
        }
    }]
}

export interface CallHandling {
    greetings: Greeting[]
    screening: string
    callHandlingAction: string
    forwarding: {
        notifyMySoftPhones: boolean
        notifyAdminSoftPhones: boolean
        softPhonesRingCount: number
        softPhonesAlwaysRing: boolean
        ringingMode: string
        softPhonesPositionTop: boolean
        rules: [
            {
                index: number
                ringCount: number
                enabled: boolean
                forwardingNumbers: [
                    {
                        id: string
                        phoneNumber: string
                        label: string
                        tyoe: string
                    }
                ]
            }
        ]
    }
    missedCall: {
        actionType: string
        externalNumber: {
            phoneNumber: string
        }
        extension: {
            id: string
            externalNumber: {
                phoneNumber: string
            }
        }
    }
    voicemail: {
        enabled: boolean
        recipient: {
            id: string
        }
    }
}

export interface Notifications {
    uri: string
    emailRecipients: [
        {
            extensionId: string
            fullName: string
            extensionNumber: string
            status: string
            emailAddresses: string
        }
    ]
    emailAddresses: string[]
    smsEmailAddresses: string[]
    advancedMode: boolean
    voicemails: {
        includeTranscription: boolean
        notifyByEmail: boolean
        includeAttachment: boolean
        markAsRead: boolean
    }
    inboundFaxes: {
        notifyByEmail: boolean
        includeAttachment: boolean
        markAsRead: boolean
    }
    missedCalls: {
        notifyByEmail: boolean
    }
    inboundTexts: {
        notifyByEmail: boolean
    }
    outboundFaxes: {
        notifyByEmail: boolean
    }
}

export interface CallerID {
    uri: string
    byDevice: [
        {
            device: {
                id: string
                name: string
            }
            callerId: {
                type: string
                phoneInfo: {
                    phoneNumber: string
                }
            }
        }
    ]
    byFeature: [
        {
            feature: string
            callerId: {
                type: string
                phoneInfo: {
                    phoneNumber: string
                }
            }
        }
    ]
}

export interface BlockedCallSettings {
    mode: string
    noCallerId: string
    payPhones: string
}

export interface BlockedPhoneNumber {
    phoneNumber: string
    label: string
    status: string
}

export interface PresenseLine {
    id: string
    extension: {
        id: string
        extensionNumber: string
        extensionName: string
    }
}

export interface PresenseSettings {
    allowSeeMyPresence: boolean
    ringOnMonitoredCall: boolean
    pickUpCallsOnHold: boolean
}

export interface PresenseAllowedUser {
    id: string
    extensionNumber: string
    extensionName: string
}

export interface IntercomStatus {
    enabled: boolean
}

export interface Delegate {
    extension: {
        extensionNumber: string
        name: string
    }
}

export interface ERL {
    name: string
    visibility: string
    address: {
        street: string
        street2: string
        city: string
        stateName: string
        zip: string
        country: string
        customerName: string
    }
}

export interface Role {
    displayName: string
    siteCompatible: string
    siteRestricted: string
}

export interface IncommingCallInfo {
    displayedNumber: string
    maskUnknown: boolean
    additionalDigits: {
        enabled: boolean
        position: string
        template: string
    }
    condition: string
    announcement: {
        directCalls: string
        callQueueCalls: string
        includeCalledExtensionName: boolean
    }
    pinRequired: boolean
}

export interface BusinessHours {
    schedule: {
        weeklyRanges: {
            monday?: [{
                from: string
                to: string
            }]
            tuesday?: [{
                from: string
                to: string
            }]
            wednesday?: [{
                from: string
                to: string
            }]
            thursday?: [{
                from: string
                to: string
            }]
            friday?: [{
                from: string
                to: string
            }]
            saturday?: [{
                from: string
                to: string
            }]
            sunday?: [{
                from: string
                to: string
            }]
        }
    }
}