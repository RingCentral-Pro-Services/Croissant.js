import { useEffect, useState } from "react"
import ExtensionIsolator from "../helpers/ExtensionIsolator"
import { CallHandlingRules } from "../models/CallHandlingRules"
import RCExtension from "../models/RCExtension"
import {TransferPayload, UnconditionalForwardingPayload} from '../models/TransferPayload'

const useBuildCallHandlingSettings = (extensions: RCExtension[]) => {
    const [ringType, setRingType] = useState('')
    const [userRingTime, setUserRingTime] = useState('')
    const [wrapUpTime, setWrapUpTime] = useState('')
    const [maxCallersInQueue, setMaxCallersInQueue] = useState('')
    const [queueFullAction, setQueueFullAction] = useState('')
    const [queueFullDestination, setQueueFullDestination] = useState('')
    const [maxWaitTime, setMaxWaitTime] = useState('')
    const [maxWaitTimeAction, setMaxWaitTimeAction] = useState('')
    const [maxWaitTimeDestination, setMaxWaitTimeDestination] = useState('')
    const [interruptPeriod, setInterruptPeriod] = useState('')
    const [maxCallersPayload, setmaxCallersPayload] = useState(-1)
    const defaultSettings: CallHandlingRules = {
        transferMode: "",
        noAnswerAction: "",
        holdAudioInterruptionMode: "",
        holdTimeExpirationAction: "",
        holdTime: -1,
        fixedOrderAgents: [],
        holdAudioInterruptionPeriod: -1,
        agentTimeout: -1,
        wrapUpTime: -1,
        maxCallersAction: '',
        transfer: [],
        unconditionalForwarding: []
    }
    const [callHandling, setCallHandling] = useState<CallHandlingRules>(defaultSettings)
    const [payload, setPayload] = useState({})
    const map: Map<string, number> = new Map([
        ['2 Rings / 10 Seconds', 10],
        ['3 Rings / 15 Seconds', 15],
        ['4 Rings / 20 Seconds', 20],
        ['5 Rings / 25 Seconds', 25],
        ['6 Rings / 30 Seconds', 30],
        ['9 Rings / 45 Seconds', 45],
        ['12 Rings / 1 Minute', 60],
        ['24 Rings / 2 Minutes', 120],
        ['60 Rings / 5 Minutes', 300],

        ['0 Seconds', 0],
        ['10 Seconds', 10],
        ['15 Seconds', 15],
        ['20 Seconds', 20],
        ['25 Seconds', 25],
        ['30 Seconds', 30],
        ['45 Seconds', 45],
        ['1 Minute', 60],
        ['3 Minutes', 180],
        ['5 Minutes', 300],
        ['10 Minutes', 600],
        ['15 Minutes', 900],
        ["Don't Wait", 1],

        ['5 Callers', 5],
        ['10 Callers', 10],
        ['15 Callers', 15],
        ['20 Callers', 20],
        ['25 Callers', 25],

        ['Every 15 seconds', 15],
        ['Every 20 seconds', 20],
        ['Every 25 seconds', 25],
        ['Every 30 seconds', 30],
        ['Every 40 seconds', 40],
        ['Every 50 seconds', 50],
        ['Every 60 seconds', 60],
    ])

    const actionMap: Map<string, string> = new Map([
        ['Send new callers to voicemail', 'Voicemail'],
        ['Advise callers of heavy call volume and disconnect', 'Announcement'],
        ['Send new callers to extension', 'TransferToExtension'],
        ['Forward new callers to external number', 'UnconditionalForwarding'],
        ['Voicemail', 'Voicemail'],
        ['Extension', 'TransferToExtension'],
        ['External number', 'UnconditionalForwarding'],
    ])

    // Call Handling: Ring Type
    useEffect(() => {
        switch (ringType) {
            case 'Rotating':
                let newPayload = {...callHandling}
                newPayload.transferMode = 'Rotating'
                setCallHandling(newPayload)
                break
            case 'Simultaneous':
                let brandNewPayload = {...callHandling}
                brandNewPayload.transferMode = 'Simultaneous'
                setCallHandling(brandNewPayload)
                break
            case 'Sequential':
                let brandSpankinNewPayload = {...callHandling}
                brandSpankinNewPayload.transferMode = 'FixedOrder'
                setCallHandling(brandSpankinNewPayload)
                break
            default:
                let alsoNewPayload = {...callHandling}
                alsoNewPayload.transferMode = ''
                setCallHandling(alsoNewPayload)
                break
        }
    }, [ringType])

    // Call Handling: User Ring Time
    useEffect(() => {
        if (userRingTime === '' || !userRingTime) {
            let newCallHandling = {...callHandling}
            newCallHandling.agentTimeout = -1
            setCallHandling(newCallHandling)
            return
        }
        
        let newCallHandling = {...callHandling}
        newCallHandling.agentTimeout = map.get(userRingTime)
        setCallHandling(newCallHandling)
    }, [userRingTime])

    // Call Handling: Wrap-up time
    useEffect(() => {
        if (wrapUpTime === '' || !wrapUpTime) {
            let newCallHandling = {...callHandling}
            newCallHandling.wrapUpTime = -1
            setCallHandling(newCallHandling)
            return
        }

        let newCallHandling = {...callHandling}
        newCallHandling.wrapUpTime = map.get(wrapUpTime)
        setCallHandling(newCallHandling)
    }, [wrapUpTime])

    // Call Handling: Max Callers
    useEffect(() => {
        if (maxCallersInQueue === '' || !maxCallersInQueue) {
            setmaxCallersPayload(-1)
            return
        }

        setmaxCallersPayload(map.get(maxCallersInQueue)!)
    }, [maxCallersInQueue])

    // Call Handling: Max Callers Action
    useEffect(() => {
        if (queueFullAction === '' || !queueFullAction) {
            let newCallHandling = {...callHandling}
            newCallHandling.maxCallersAction = ''
            setCallHandling(newCallHandling)
            return
        }

        let newCallHandling = {...callHandling}
        newCallHandling.maxCallersAction = actionMap.get(queueFullAction)
        setCallHandling(newCallHandling)
    }, [queueFullAction])

    // Call Handling: Max wait time
    useEffect(() => {
        if (maxWaitTime === '' || !maxWaitTime) {
            let newCallHandling = {...callHandling}
            newCallHandling.holdTime = -1
            setCallHandling(newCallHandling)
            return
        }

        let newCallHandling = {...callHandling}
        newCallHandling.holdTime = map.get(maxWaitTime)!
        setCallHandling(newCallHandling)
    }, [maxWaitTime])

    // Call Handling: Max wait time action
    useEffect(() => {
        if (maxWaitTimeAction === '' || !maxWaitTimeAction) {
            let newCallHandling = {...callHandling}
            newCallHandling.holdTimeExpirationAction = ''
            setCallHandling(newCallHandling)
            return
        }

        let newCallHandling = {...callHandling}
        newCallHandling.holdTimeExpirationAction = actionMap.get(maxWaitTimeAction)!
        setCallHandling(newCallHandling)
    }, [maxWaitTimeAction])

    // Call Handling: Max wait time destination
    useEffect(() => {
        if (maxWaitTimeDestination === '' || !maxWaitTimeDestination) {
            let newCallHandling = {...callHandling}
            if (maxWaitTimeAction === 'Extension' && newCallHandling.transfer) {
                let newTransfers = newCallHandling.transfer.filter((transfer) => transfer.action != 'HoldTimeExpiration')
                newCallHandling.transfer = newTransfers
            }
            else if (maxWaitTimeAction === 'External number' && newCallHandling.unconditionalForwarding) {
                let newForwarding = newCallHandling.unconditionalForwarding.filter((forward) => forward.action != 'HoldTimeExpiration')
                newCallHandling.unconditionalForwarding = newForwarding
            }
            setCallHandling(newCallHandling)
            return
        }
        
        if (maxWaitTimeAction === 'Extension') {
            // Isolate extension number, add transfer
            const isolator = new ExtensionIsolator()
            const extension = isolator.isolateExtension(maxWaitTimeDestination)
            if (!extension) return
            const id = idForExtension(extension)
            addTransfer('HoldTimeExpiration', `${id}`)
        }
        else if (maxWaitTimeAction === 'External number') {
            // Isolate phone number, add unconditional forward
            const isolator = new ExtensionIsolator()
            const phoneNumber = isolator.isolatePhoneNumber(maxWaitTimeDestination)
            if (!phoneNumber) return
            const forward: UnconditionalForwardingPayload = {
                phoneNumber: phoneNumber,
                action: "HoldTimeExpiration"
            }
            addUnconditionalForwarding('HoldTimeExpiration', phoneNumber)
        }
    }, [maxWaitTimeDestination])

    // Call Handling: Max callers destination
    useEffect(() => {
        if (queueFullAction === '' || !queueFullAction) {
            let newCallHandling = {...callHandling}
            if (queueFullAction === 'Send new callers to extension' && newCallHandling.transfer) {
                let newTransfers = newCallHandling.transfer.filter((transfer) => transfer.action != 'MaxCallers')
                newCallHandling.transfer = newTransfers
            }
            else if (queueFullAction === 'Forward new callers to external number' && newCallHandling.unconditionalForwarding) {
                let newForwarding = newCallHandling.unconditionalForwarding.filter((forward) => forward.action != 'MaxCallers')
                newCallHandling.unconditionalForwarding = newForwarding
            }
            setCallHandling(newCallHandling)
            return
        }
        
        if (queueFullAction === 'Send new callers to extension') {
            // Isolate extension number, add transfer
            const isolator = new ExtensionIsolator()
            const extension = isolator.isolateExtension(queueFullDestination)
            if (!extension) return
            const id = idForExtension(extension)
            addTransfer('MaxCallers', `${id}`)
        }
        else if (queueFullAction === 'Forward new callers to external number') {
            // Isolate phone number, add unconditional forward
            const isolator = new ExtensionIsolator()
            const phoneNumber = isolator.isolatePhoneNumber(queueFullDestination)
            if (!phoneNumber) return
            const forward: UnconditionalForwardingPayload = {
                phoneNumber: phoneNumber,
                action: "MaxCallers"
            }
            addUnconditionalForwarding('MaxCallers', phoneNumber)
        }
    }, [queueFullDestination])

    useEffect(() => {
        if (interruptPeriod === '' || !interruptPeriod) {
            let newCallHandling = {...callHandling}
            newCallHandling.holdAudioInterruptionPeriod = -1
            setCallHandling(newCallHandling)
            return
        }

        let newCallHandling = {...callHandling}
        if (interruptPeriod === 'Never') {
            newCallHandling.holdAudioInterruptionMode = 'Never'
            newCallHandling.holdAudioInterruptionPeriod = -1
        }
        else if (interruptPeriod === 'Only when music ends') {
            newCallHandling.holdAudioInterruptionMode = 'WhenMusicEnds'
            newCallHandling.holdAudioInterruptionPeriod = -1
        }
        else {
            newCallHandling.holdAudioInterruptionMode = 'Periodically'
            newCallHandling.holdAudioInterruptionPeriod = map.get(interruptPeriod)!
        }
        setCallHandling(newCallHandling)
    }, [interruptPeriod])

    const addTransfer = (action: string, id: string) => {
        let newCallHandling = {...callHandling}
        let transfers = newCallHandling.transfer
        for (let index = 0; index < transfers!.length; index++) {
            if (transfers![index].action === action) {
                transfers![index].extension.id = id
                setCallHandling(newCallHandling)
                return
            }
        }
        const transfer: TransferPayload = {
            extension: {
                id: id
            },
            action: action
        }
        newCallHandling.transfer?.push(transfer)
        setCallHandling(newCallHandling)
    }

    const addUnconditionalForwarding = (action: string, phoneNumber: string) => {
        let newCallHandling = {...callHandling}
        let forwarding = newCallHandling.unconditionalForwarding
        for (let index = 0; index < forwarding!.length; index++) {
            if (forwarding![index].action === action) {
                forwarding![index].phoneNumber = phoneNumber
                setCallHandling(newCallHandling)
                return
            }
        }
        const forward: UnconditionalForwardingPayload = {
            phoneNumber: phoneNumber,
            action: action
        }
        newCallHandling.unconditionalForwarding?.push(forward)
        setCallHandling(newCallHandling)
    }

    const idForExtension = (extensionNumber: string) => {
        for (const extension of extensions) {
            if (`${extension.extensionNumber}` == extensionNumber) return extension.id
        }
        return -1
    }

    useEffect(() => {
        const newPayload = {
            ...(callHandling.agentTimeout != -1 && {agentTimeout: callHandling.agentTimeout}),
            ...(callHandling.transferMode != '' && {transferMode: callHandling.transferMode}),
            ...(callHandling.agentTimeout != -1 && {agentTimeout: callHandling.agentTimeout}),
            ...(callHandling.wrapUpTime != -1 && {wrapUpTime: callHandling.wrapUpTime}),
            ...(maxCallersPayload != -1 && {maxCallers: maxCallersPayload}),
            ...(callHandling.maxCallersAction != '' && {maxCallersAction: callHandling.maxCallersAction}),
            ...(callHandling.holdTime != -1 && {holdTime: callHandling.holdTime}),
            ...(callHandling.holdTimeExpirationAction != '' && {holdTimeExpirationAction: callHandling.holdTimeExpirationAction}),
            ...(callHandling.unconditionalForwarding?.length != 0 && {unconditionalForwarding: callHandling.unconditionalForwarding}),
            ...(callHandling.transfer!.length > 0 && {transfer: callHandling.transfer}),
            ...(callHandling.holdAudioInterruptionMode != '' && {holdAudioInterruptionMode: callHandling.holdAudioInterruptionMode}),
            ...(callHandling.holdAudioInterruptionPeriod != -1 && {holdAudioInterruptionPeriod: callHandling.holdAudioInterruptionPeriod})
        }
        console.log('Payload')
        console.log(newPayload)

        setPayload(newPayload)
    }, [callHandling])

    return {setRingType, setUserRingTime, setWrapUpTime, setMaxCallersInQueue, setQueueFullAction, setQueueFullDestination, setMaxWaitTime, setMaxWaitTimeAction, setMaxWaitTimeDestination, setInterruptPeriod, payload}
}

export default useBuildCallHandlingSettings