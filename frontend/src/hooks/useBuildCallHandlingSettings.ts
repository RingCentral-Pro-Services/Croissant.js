import { useEffect, useState } from "react"
import { CallHandlingRules } from "../models/CallHandlingRules"

const useBuildCallHandlingSettings = () => {
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
    ])

    const actionMap: Map<string, string> = new Map([
        ['Send new callers to voicemail', 'Voicemail'],
        ['Advise callers of heavy call volume and disconnect', 'Announcement'],
        ['Send new callers to extensions', 'TransferToExtension'],
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

    useEffect(() => {
        const newPayload = {
            ...(callHandling.agentTimeout != -1 && {agentTimeout: callHandling.agentTimeout}),
            ...(callHandling.transferMode != '' && {transferMode: callHandling.transferMode}),
            ...(callHandling.agentTimeout != -1 && {agentTimeout: callHandling.agentTimeout}),
            ...(callHandling.wrapUpTime != -1 && {wrapUpTime: callHandling.wrapUpTime}),
            ...(maxCallersPayload != -1 && {maxCallers: maxCallersPayload}),
            ...(callHandling.maxCallersAction != '' && {maxCallersAction: callHandling.maxCallersAction}),
            ...(callHandling.holdTime != -1 && {holdTime: callHandling.holdTime}),
            ...(callHandling.holdTimeExpirationAction != '' && {holdTimeExpirationAction: callHandling.holdTimeExpirationAction})
        }
        console.log('Call Handling')
        console.log(callHandling)

        console.log('Payload')
        console.log(newPayload)
        setPayload(newPayload)
    }, [callHandling])

    return {setRingType, setUserRingTime, setWrapUpTime, setMaxCallersInQueue, setQueueFullAction, setQueueFullDestination, setMaxWaitTime, setMaxWaitTimeAction, setMaxWaitTimeDestination, setInterruptPeriod, payload}
}

export default useBuildCallHandlingSettings