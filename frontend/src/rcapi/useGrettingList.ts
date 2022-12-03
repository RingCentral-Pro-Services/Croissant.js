import { useState, useEffect } from "react"
import { GreetingResource } from "../models/GreetingResource"
import { RestCentral } from "./RestCentral"

const useGreetingList = () => {
    const [shouldFetchCallQueueAudio, setShouldFetchCallQueueAudio] = useState(false)
    const [shouldFetchHoldMusic, setShouldFetchHoldMusic] = useState(false)
    const [isGreetingListPending, setIsGreetingListPending] = useState(true)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [callQueueConnectingAudio, setCallQueueConnectingAudio] = useState(<string[]>[])
    const [callQueueInterruptAudio, setCallQueueInterruptAudio] = useState(<string[]>[])
    const [callQueueGreetingAudio, setCallQueueGreetingAudio] = useState<string[]>([])
    const [holdMusicAudio, setHoldMusicAudio] = useState<string[]>([])
    const [connectingAudioMap, setConnectingAudioMap] = useState<Map<string, GreetingResource>>(new Map())
    const [interruptAudioMap, setInterruptAudioMap] = useState<Map<string, GreetingResource>>(new Map())
    const [greetingAudioMap, setGreetingAudioMap] = useState<Map<string, GreetingResource>>(new Map())
    const [holdMusicMap, setHoldMusicMap] = useState<Map<string, GreetingResource>>(new Map())
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting'

    const fetchGreetings = () => {
        setShouldFetchCallQueueAudio(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldFetchCallQueueAudio || !accessToken) return

        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }

        setTimeout(async () => {
            try {
                const url = `${baseURL}?page=1&perPage=1000&usageType=DepartmentExtensionAnsweringRule`
                const response = await RestCentral.get(url,  headers)
                const allGreetings = response.data.records as GreetingResource[]

                // Intro audio
                const introGreetings = allGreetings.filter((greeting) => greeting.type === 'Introductory')
                const introGreetingNames = introGreetings.map((greeting) => greeting.name)
                introGreetingNames.sort()

                // Connecting audio
                const connectingGreetings = allGreetings.filter((greeting) => greeting.type === 'ConnectingAudio')
                const connectingGreetingNames = connectingGreetings.map((greeting) => greeting.name)
                connectingGreetingNames.sort()

                // Interrupt audio
                const interruptGreetings = allGreetings.filter((greeting) => greeting.type === 'InterruptPrompt')
                const interruptGreetingNames = interruptGreetings.map((greeting) => greeting.name)
                interruptGreetingNames.sort()

                createMaps(introGreetings, connectingGreetings, interruptGreetings)
                setCallQueueConnectingAudio(connectingGreetingNames)
                setCallQueueGreetingAudio(introGreetingNames)
                setCallQueueInterruptAudio(interruptGreetingNames)
                setShouldFetchCallQueueAudio(false)
                // setIsGreetingListPending(false)
                setShouldFetchHoldMusic(true)
            }
            catch (e: any) {
                console.log('Failed to fetch call queue greetings')
                console.log(e)
            }
        }, rateLimitInterval)
    }, [shouldFetchCallQueueAudio])

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldFetchHoldMusic || !accessToken) return

        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }

        setTimeout(async () => {
            try {
                const url = `${baseURL}?page=1&perPage=1000&usageType=ExtensionAnsweringRule`
                const response = await RestCentral.get(url, headers)
                const holdMusic = response.data.records as GreetingResource[]
                const holdMusicNames = holdMusic.map((greeting) => greeting.name)
                holdMusicNames.sort()

                setHoldMusicAudio(holdMusicNames)
                let map = new Map<string, GreetingResource>()
                for (const greeting of holdMusic) {
                    map.set(greeting.name, greeting)
                }
                setHoldMusicMap(map)
                setIsGreetingListPending(false)
            }
            catch (e: any) {
                console.log('Failed to fetch hold music')
                console.log(e)
            }
        })
    }, [shouldFetchHoldMusic])

    const createMaps = (introGreetings: GreetingResource[], connectingGreetings: GreetingResource[], interruptGreetings: GreetingResource[]) => {
        let introMap = new Map<string, GreetingResource>()
        let connectingMap = new Map<string, GreetingResource>()
        let interruptMap = new Map<string, GreetingResource>()

        for (const greeting of introGreetings) {
            introMap.set(greeting.name, greeting)
        }

        for (const greeting of connectingGreetings) {
            connectingMap.set(greeting.name, greeting)
        }

        for (const greeting of interruptGreetings) {

            interruptMap.set(greeting.name, greeting)
        }

        setConnectingAudioMap(connectingMap)
        setInterruptAudioMap(interruptMap)
        setGreetingAudioMap(introMap)
    }

    return {fetchGreetings, callQueueConnectingAudio, callQueueGreetingAudio, holdMusicAudio, callQueueInterruptAudio, isGreetingListPending, connectingAudioMap, holdMusicMap, interruptAudioMap, greetingAudioMap}

}

export default useGreetingList