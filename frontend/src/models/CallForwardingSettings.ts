export interface CallForwardingSettings {
    extensionID: string
    forwarding: CallForwardingSettingsPayload
}

export interface CallForwardingSettingsPayload {
    notifyMySoftPhones: boolean
    notifyAdminSoftPhones: boolean
    softPhonesRingCount: number
    softPhonesAlwaysRing: boolean
    rules: CallForwardingRule[]
    ringingMode: string
}

export interface CallForwardingRule {
    index: number
    ringCount: number
    enabled: boolean
    forwardingNumbers: ForwardingNumbers[]
}

export interface ForwardingNumbers {
    id: string
    type: string
    uri: string
    phoneNumber: string
    label: string
}