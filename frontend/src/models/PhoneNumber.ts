export interface PhoneNumber {
    uri: string
    id: string
    extension: {
        uri: string
        id: string
        name: string
        extensionNumber: string
    }
    label: string
    location: string
    phoneNumber: string
    type: string
    usageType: string
    tollType: string
    paymentType: string
    contactCenterProvider: string
    vanityPattern: string
}
