import { useEffect, useState } from "react"
import { GreetingResource } from "../models/GreetingResource"
import { Greeting } from "../models/Greetings"

const useBuildGreetingSettings = (connectingAudioMap: Map<string, GreetingResource>, interruptAudioMap: Map<string, GreetingResource>, greetingAudioMap: Map<string, GreetingResource>, holdMusicMap: Map<string, GreetingResource>, voicemailGreetingMap: Map<string, GreetingResource>) => {
    const [introGreeting, setIntroGreeting] = useState('')
    const [audioWhileConnecting, setAudioWhileConnecting] = useState('')
    const [holdMusic, setHoldMusic] = useState('')
    const [interruptAudio, setInterruptAudio] = useState('')
    const [voicemailGreeting, setVoicemailGreeting] = useState('')
    const [afterHoursVoicemailGreeting, setAfterHoursVoicemailGreeting] = useState('')
    const [payload, setPayload] = useState({})
    const [greetings, setGreetings] = useState<Greeting[]>([])
    const [afterHoursGreetings, setAfterHoursGreetings] = useState<Greeting[]>([])

    const INTRO_GREETING = 'Introductory'
    const CONNECTING_AUDIO = 'ConnectingAudio'
    const HOLD_MUSIC = 'HoldMusic'
    const INTERRUPT_AUDIO = 'InterruptPrompt'
    const VOICEMAIL_GREETING = 'Voicemail'

    useEffect(() => {
        if (introGreeting === '' || !introGreeting) {
            if (hasGreeting(INTRO_GREETING)) deleteGreeting(INTRO_GREETING)
        }
        else {
            const resource = greetingAudioMap.get(introGreeting)
            const greeting: Greeting = {
                type: INTRO_GREETING,
                preset: {
                    id: resource!.id,
                    name: resource!.name
                }
            }

            updateGreeting(INTRO_GREETING, greeting)
        }
    }, [introGreeting])
    
    useEffect(() => {
        if (audioWhileConnecting === '' || !audioWhileConnecting) {
            if (hasGreeting(CONNECTING_AUDIO)) deleteGreeting(CONNECTING_AUDIO)
        }
        else {
            const resource = connectingAudioMap.get(audioWhileConnecting)
            const greeting: Greeting = {
                type: CONNECTING_AUDIO,
                preset: {
                    id: resource!.id,
                    name: resource!.name
                }
            }

            updateGreeting(CONNECTING_AUDIO, greeting)
        }
    }, [audioWhileConnecting])

    useEffect(() => {
        if (holdMusic === '' || !holdMusic) {
            if (hasGreeting(HOLD_MUSIC)) deleteGreeting(HOLD_MUSIC)
        }
        else {
            const resource = holdMusicMap.get(holdMusic)
            const greeting: Greeting = {
                type: HOLD_MUSIC,
                preset: {
                    id: resource!.id,
                    name: resource!.name
                }
            }

            updateGreeting(HOLD_MUSIC, greeting)
        }
    }, [holdMusic])

    useEffect(() => {
        if (interruptAudio === '' || !interruptAudio) {
            if (hasGreeting(INTERRUPT_AUDIO)) deleteGreeting(INTERRUPT_AUDIO)
        }
        else {
            const resource = interruptAudioMap.get(interruptAudio)
            const greeting: Greeting = {
                type: INTERRUPT_AUDIO,
                preset: {
                    id: resource!.id,
                    name: resource!.name
                }
            }

            updateGreeting(INTERRUPT_AUDIO, greeting)
        }
    }, [interruptAudio])

    useEffect(() => {
        if (voicemailGreeting === '' || !voicemailGreeting) {
            if (hasGreeting(VOICEMAIL_GREETING)) deleteGreeting(VOICEMAIL_GREETING)
        }
        else {
            const resource = voicemailGreetingMap.get(voicemailGreeting)
            const greeting: Greeting = {
                type: VOICEMAIL_GREETING,
                preset: {
                    id: resource!.id,
                    name: resource!.name
                }
            }

            updateGreeting(VOICEMAIL_GREETING, greeting)
        }
    }, [voicemailGreeting])

    useEffect(() => {
        if (afterHoursVoicemailGreeting === '' || !afterHoursVoicemailGreeting) {
            // if (hasGreeting(VOICEMAIL_GREETING)) deleteGreeting(VOICEMAIL_GREETING)
        }
        else {
            const resource = voicemailGreetingMap.get(afterHoursVoicemailGreeting)
            const greeting: Greeting = {
                type: VOICEMAIL_GREETING,
                preset: {
                    id: resource!.id,
                    name: resource!.name
                }
            }
            
            setAfterHoursGreetings([greeting])
        }
    }, [afterHoursVoicemailGreeting])

    useEffect(() => {
        console.log('Greetings')
        console.log(greetings)
    }, [greetings])

    const updateGreeting = (type: string, greeting: Greeting) => {
        if (hasGreeting(type)) {
            let newGreetings = [...greetings]
            for (let index = 0; index < newGreetings.length; index++) {
                if (newGreetings[index].type === type) {
                    console.log('Found existing greeting. Updating...')
                    newGreetings[index] = greeting
                }
            }
            setGreetings(newGreetings)
        }
        else {
            let newGreetings = [...greetings]
            newGreetings.push(greeting)
            setGreetings(newGreetings)
        }
    }

    const hasGreeting = (type: string) => {
        for (const greeting of greetings) {
            if (greeting.type === type) return true
        }
        return false
    }

    const deleteGreeting = (type: string) => {
        let newGreetings = [...greetings].filter((greeting) => greeting.type != type)
        setGreetings(newGreetings)
    }

    return {setIntroGreeting, setAudioWhileConnecting, setHoldMusic, setInterruptAudio, setVoicemailGreeting, setAfterHoursVoicemailGreeting, greetings, afterHoursGreetings}
}

export default useBuildGreetingSettings