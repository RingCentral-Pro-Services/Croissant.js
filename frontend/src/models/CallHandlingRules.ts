import { TransferPayload, UnconditionalForwardingPayload } from "./TransferPayload"

export interface CallHandlingRules {
    transferMode: string
    noAnswerAction: string
    fixedOrderAgents?: string[]
    holdAudioInterruptionMode: string
    holdAudioInterruptionPeriod?: number
    holdTimeExpirationAction: string
    agentTimeout?: number
    holdTime: number
    wrapUpTime?: number
    maxCallersAction?: string
    transfer?: TransferPayload[]
    unconditionalForwarding?: UnconditionalForwardingPayload[]
}