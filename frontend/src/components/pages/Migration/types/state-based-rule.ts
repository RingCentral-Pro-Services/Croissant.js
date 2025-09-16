export type StateBasedRule = {
    id: string
    displayName: string
    dispatching: {
        actions: DispatchingAction[],
        type: 'RingAtOnce' | 'RingInOrder' | 'Custom' | 'Terminate'
    },
    state: {
        id: 'after-hours' | 'work-hours' | 'dnd' | 'forward-all-calls' | 'agent',
        enabled: boolean,
        displayName: string,
        conditions: []
    }
}

export type DispatchingAction = PromptDispatchingAction | ScreeningDispatchingAction | RingGroupAction | RingAlwaysAction | TerminatingAction

export type PromptDispatchingAction = {
    type: 'PlayConnectingMessageAction' | 'PlayConnectingPromptAction' | 'PlayWelcomePromptAction' | 'ScreeningAction',
    greeting: {
        effectiveGreetingType: 'Custom' | 'Preset',
        preset: {
            id: string
        },
        custom?: {
            id: string
        }
    },
    enabled: boolean
}

export type ScreeningDispatchingAction = {
    type: 'ScreeningAction',
    screening: 'NoCallerId' | 'UnknownCallerId' | 'Always',
    enabled: boolean,
    screeningResult: 'AskToAnswer' | 'PlayCallerNameOnly'
}

export type RingGroupAction = {
    type: 'RingGroupAction',
    enabled: boolean,
    targets: RingGroupTarget[],
    customStartOffset: number,
    duration: number
}

export type RingAlwaysAction = {
    type: 'RingAlwaysGroupAction',
    enabled: boolean,
    targets: RingAlwaysTarget[]
}

export type TerminatingAction = {
    type: 'TerminatingAction',
    ringingTargetType: 'ExtensionTerminatingTarget' | 'PhoneNumberTerminatingTarget' | 'PlayAnnouncementTerminatingTarget' | 'VoiceMailTerminatingTarget',
    terminatingTargetType: 'ExtensionTerminatingTarget' | 'PhoneNumberTerminatingTarget' | 'PlayAnnouncementTerminatingTarget' | 'VoiceMailTerminatingTarget'
}

export type RingAlwaysTarget = {
    type: 'AllDesktopRingTarget' | 'AllMobileRingTarget',
    name: string,
    extension: {
        id: string
    }
}

export type RingGroupTarget = {
    extension: {
        id: string
    }
}