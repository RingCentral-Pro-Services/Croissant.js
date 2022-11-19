export interface CallHandlingRules {
    transferMode: 'Rotating' | 'Simultaneous' | 'FixedOrder'
    noAnswerAction: 'WaitPrimaryMembers' | 'WaitPrimaryAndOverflowMembers' | 'Voicemail' | 'TransferToExtension' | 'UnconditionalForwarding'
    fixedOrderAgents?: string[]
    holdAudioInterruptionMode: 'Never' | 'WhenMusicEnds' | 'Periodically'
    holdAudioInterruptionPeriod?: 15 | 20 | 25 | 30 | 40 | 50 | 60
    holdTimeExpirationAction: 'Voicemail' | 'TransferToExtension' | 'UnconditionalForwarding'
    agentTimeout?: 10 | 15 | 20 | 30 | 45 | 60 | 120 | 300
    holdTime: 0 | 10 | 15 | 20 | 25 | 30 | 60 | 120 | 180 | 240 | 300 | 600 | 900
    wrapUpTime?: number 
}