export interface TransferPayload {
    extension: {
        id: string
        name?: string
        extensionNumber?: string
    }
    action: string
}

export interface UnconditionalForwardingPayload {
    phoneNumber: string
    action: string
}