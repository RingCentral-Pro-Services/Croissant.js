import { TransferPayload, UnconditionalForwardingPayload } from "./TransferPayload"

export interface CallHandlingRules {
    transferMode: string
    noAnswerAction: string
    fixedOrderAgents?: FixedOrderAgent[]
    holdAudioInterruptionMode: string
    holdAudioInterruptionPeriod?: number
    holdTimeExpirationAction: string
    agentTimeout?: number
    holdTime: number
    wrapUpTime?: number
    maxCallersAction?: string
    maxCallers: number
    transfer?: TransferPayload[]
    unconditionalForwarding?: UnconditionalForwardingPayload[]
    voicemail?: {
        enabled: boolean
        recipient: {
            uri?: string
            id: string
        }
    }
}

export interface FixedOrderAgent {
    extension: {
        id: string,
        extensionNumber: string,
        name: string,
    }
    index: number
}