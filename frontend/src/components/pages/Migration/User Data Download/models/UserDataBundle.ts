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
            const row = new UserDataRow(this.extension, this.extendedData.devices[i], this.extendedData.businessHoursCallHandling, this.extendedData.afterHoursCallHandling, this.extendedData.notifications, this.extendedData.callerID, this.extendedData.blockedCallSettings, this.extendedData.blockedPhoneNumbers, this.extendedData.presenseLines, this.extendedData.presenseSettings, this.extendedData.presenseAllowedUsers, this.extendedData.intercomStatus, this.extendedData.delegates)
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
    forwarding: {
        notifyMySoftPhones: boolean
        notifyAdminSoftPhones: boolean
        softPhonesRingCount: boolean
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
    payphones: string
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