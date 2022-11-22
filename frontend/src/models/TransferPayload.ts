export interface TransferPayload {
    extension: {
        id: string
    }
    action: string
}

export interface UnconditionalForwardingPayload {
    phoneNumber: string
    action: string
}