import { useEffect, useState } from "react"

const useBuildCustomGreetings = () => {
    const [introGreetingFile, setIntroGreetingFile] = useState<File | null>(null)
    const [connectingGreetingFile, setConnectingGreetingFile] = useState<File | null>(null)
    const [onHoldGreetingFile, setOnHoldGreetingFile] = useState<File | null>(null)
    const [intterruptGreetingFile, setIntterruptGreetingFile] = useState<File | null>(null)
    const [introGreetingPayload, setIntroGreetingPayload] = useState<FormData>(new FormData())
    const [connectingGreetingPayload, setConnectingGreetingPayload] = useState<FormData>(new FormData())
    const [onHoldGreetingPayload, setOnHoldGreetingPayload] = useState<FormData>(new FormData())
    const [intterruptGreetingPayload, setIntterruptGreetingPayload] = useState<FormData>(new FormData())
    const [voicemailGreetingFile, setVoicemailGreetingFile] = useState<File | null>(null)
    const [voicemailGreetingPayload, setVoicemailGreetingPayload] = useState<FormData>(new FormData())
    const [afterHoursVoicemailGreetingFile, setAfterHoursVoicemailGreetingFile] = useState<File | null>(null)
    const [afterHoursVoicemailGreetingPayload, setAfterHoursVoicemailGreetingPayload] = useState<FormData>(new FormData())
    const [progressMultiplier, setProgressMultiplier] = useState(0)

    useEffect(() => {
        if (!introGreetingFile) return
        const formData = new FormData()
        formData.append('type', 'Introductory')
        formData.append('answeringRuleId', 'business-hours-rule')
        formData.append('binary', introGreetingFile, introGreetingFile.name)
        setIntroGreetingPayload(formData)
    }, [introGreetingFile])

    useEffect(() => {
        if (!connectingGreetingFile) return
        console.log('Adding connecting greeting')
        const formData = new FormData()
        formData.append('type', 'ConnectingAudio')
        formData.append('answeringRuleId', 'business-hours-rule')
        formData.append('binary', connectingGreetingFile, connectingGreetingFile.name)
        setConnectingGreetingPayload(formData)
    }, [connectingGreetingFile])

    useEffect(() => {
        if (!onHoldGreetingFile) return
        console.log('Adding on hold greeting')
        const formData = new FormData()
        formData.append('type', 'HoldMusic')
        formData.append('answeringRuleId', 'business-hours-rule')
        formData.append('binary', onHoldGreetingFile, onHoldGreetingFile.name)
        console.log('Setting on hold greeting payload')
        setOnHoldGreetingPayload(formData)
    }, [onHoldGreetingFile])

    useEffect(() => {
        if (!intterruptGreetingFile) return
        const formData = new FormData()
        formData.append('type', 'InterruptPrompt')
        formData.append('answeringRuleId', 'business-hours-rule')
        formData.append('binary', intterruptGreetingFile, intterruptGreetingFile.name)
        setIntterruptGreetingPayload(formData)
    }, [intterruptGreetingFile])

    useEffect(() => {
        if (!voicemailGreetingFile) return
        const formData = new FormData()
        formData.append('type', 'Voicemail')
        formData.append('answeringRuleId', 'business-hours-rule')
        formData.append('binary', voicemailGreetingFile, voicemailGreetingFile.name)
        setVoicemailGreetingPayload(formData)
    }, [voicemailGreetingFile])

    useEffect(() => {
        console.log('Setting after hours voicemail greeting payload')
        if (!afterHoursVoicemailGreetingFile) return
        const formData = new FormData()
        formData.append('type', 'Voicemail')
        formData.append('answeringRuleId', 'after-hours-rule')
        formData.append('binary', afterHoursVoicemailGreetingFile, afterHoursVoicemailGreetingFile.name)
        setAfterHoursVoicemailGreetingPayload(formData)
    }, [afterHoursVoicemailGreetingFile])

    useEffect(() => {
        let multiplier = 0
        if (introGreetingPayload.has('binary')) multiplier += 1
        if (connectingGreetingPayload.has('binary')) multiplier += 1
        if (onHoldGreetingPayload.has('binary')) multiplier += 1
        if (intterruptGreetingPayload.has('binary')) multiplier += 1
        if (voicemailGreetingPayload.has('binary')) multiplier += 1
        if (afterHoursVoicemailGreetingPayload.has('binary')) multiplier += 1
        
        setProgressMultiplier(multiplier)
    }, [introGreetingPayload, connectingGreetingPayload, onHoldGreetingPayload, intterruptGreetingPayload, voicemailGreetingPayload, afterHoursVoicemailGreetingPayload])

    return {setIntroGreetingFile, setConnectingGreetingFile, setOnHoldGreetingFile, setIntterruptGreetingFile, setVoicemailGreetingFile, setAfterHoursVoicemailGreetingFile, introGreetingPayload, connectingGreetingPayload, onHoldGreetingPayload, intterruptGreetingPayload, voicemailGreetingPayload, afterHoursVoicemailGreetingPayload, progressMultiplier}
}

export default useBuildCustomGreetings