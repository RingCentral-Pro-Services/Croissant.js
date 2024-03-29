import { useEffect, useState } from "react"
import { Message } from "../models/Message"
import RCExtension from "../models/RCExtension"
import { SyncError } from "../models/SyncError"
import { RestCentral } from "./RestCentral"

const useUploadCustomGreetings = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [extensions, setExtensions] = useState<RCExtension[]>([])
    const [isGreetingsUploadPending, setIsGreetingsUploadPending] = useState(true)
    const [introGreetingPayload, setIntroGreetingPayload] = useState<FormData>(new FormData())
    const [connectingGreetingPayload, setConnectingGreetingPayload] = useState<FormData>(new FormData())
    const [onHoldGreetingPayload, setOnHoldGreetingPayload] = useState<FormData>(new FormData())
    const [intterruptGreetingPayload, setIntterruptGreetingPayload] = useState<FormData>(new FormData())
    const [voicemailGreetingPayload, setVoicemailGreetingPayload] = useState<FormData>(new FormData())
    const [afterHoursVoicemailGreetingPayload, setAfterHoursVoicemailGreetingPayload] = useState<FormData>(new FormData())
    const [shouldUploadIntroGreeting, setShouldUploadIntroGreeting] = useState(false)
    const [shouldUploadConnectingGreeting, setShouldUploadConnectingGreeting] = useState(false)
    const [shouldUploadOnHoldGreeting, setShouldUploadOnHoldGreeting] = useState(false)
    const [shouldUploadIntterruptGreeting, setShouldUploadIntterruptGreeting] = useState(false)
    const [shouldUploadVoicemailGreeting, setShouldUploadVoicemailGreeting] = useState(false)
    const [shouldUploadAfterHoursVoicemailGreeting, setShouldUploadAfterHoursVoicemailGreeting] = useState(false)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [progress, setProgress] = useState(0)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/greeting'

    const uploadGreetings = (extensions: RCExtension[], introGreetingPayload: FormData, connectingGreetingPayload: FormData, onHoldGreetingPayload: FormData, intterruptGreetingPayload: FormData, voicemailGreetingPayload: FormData, afterHoursVoicemailGreetingPayload: FormData) => {
        setExtensions(extensions)
        setIntroGreetingPayload(introGreetingPayload)
        setConnectingGreetingPayload(connectingGreetingPayload)
        setOnHoldGreetingPayload(onHoldGreetingPayload)
        setIntterruptGreetingPayload(intterruptGreetingPayload)
        setVoicemailGreetingPayload(voicemailGreetingPayload)
        setAfterHoursVoicemailGreetingPayload(afterHoursVoicemailGreetingPayload)
        setShouldUploadIntroGreeting(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldUploadIntroGreeting || !accessToken) return
        if (!introGreetingPayload.has('binary') || currentExtensionIndex >= extensions.length) {
            setCurrentExtensionIndex(0)
            setShouldUploadIntroGreeting(false)
            setShouldUploadConnectingGreeting(true)
            return
        }

        setTimeout(async () => {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                let url = baseURL.replace('extensionId', `${extensions[currentExtensionIndex].id}`)
                url += '?apply=true'
                let response = await RestCentral.post(url, headers, introGreetingPayload)
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message('Rate limit reached. Waiting 60 seconds before continuing.', 'info'), 60000)
                }
                else {
                    setRateLimitInterval(250)
                }

                uploadNext()
            }
            catch (e: any) {
                console.log('It failed')
                console.log(e)
                postMessage(new Message(`Failed to upload intro greeting for ${extensions[currentExtensionIndex].name}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].name, extensions[currentExtensionIndex].extensionNumber, ['Custom intro greeting failed', ''], e.error ?? ''))
                uploadNext()
            }
        }, rateLimitInterval)
    }, [shouldUploadIntroGreeting, rateLimitInterval, extensions, introGreetingPayload, currentExtensionIndex, baseURL])

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldUploadConnectingGreeting || !accessToken) return
        if (!connectingGreetingPayload.has('binary') || currentExtensionIndex >= extensions.length) {
            setCurrentExtensionIndex(0)
            setShouldUploadConnectingGreeting(false)
            setShouldUploadOnHoldGreeting(true)
            return
        }

        setTimeout(async () => {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                let url = baseURL.replace('extensionId', `${extensions[currentExtensionIndex].id}`)
                url += '?apply=true'
                let response = await RestCentral.post(url, headers, connectingGreetingPayload)
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postMessage(new Message('Rate limit reached. Waiting 60 seconds before continuing.', 'info'))
                }
                else {
                    setRateLimitInterval(250)
                }

                uploadNext()
            }
            catch (e: any) {
                console.log('It failed')
                console.log(e)
                postMessage(new Message(`Failed to upload connecting audio for ${extensions[currentExtensionIndex].name}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].name, extensions[currentExtensionIndex].extensionNumber, ['Custom connecting audio failed', ''], e.error ?? ''))
                uploadNext()
            }
        }, rateLimitInterval)
    }, [shouldUploadConnectingGreeting, rateLimitInterval, extensions, introGreetingPayload, currentExtensionIndex, baseURL])

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldUploadOnHoldGreeting || !accessToken) return
        if (!onHoldGreetingPayload.has('binary') || currentExtensionIndex >= extensions.length) {
            setCurrentExtensionIndex(0)
            setShouldUploadOnHoldGreeting(false)
            setShouldUploadIntterruptGreeting(true)
            return
        }

        setTimeout(async () => {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                let url = baseURL.replace('extensionId', `${extensions[currentExtensionIndex].id}`)
                url += '?apply=true'
                let response = await RestCentral.post(url, headers, onHoldGreetingPayload)
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postMessage(new Message('Rate limit reached. Waiting 60 seconds before continuing.', 'info'))
                }
                else {
                    setRateLimitInterval(250)
                }

                uploadNext()
            }
            catch (e: any) {
                console.log('It failed')
                console.log(e)
                postMessage(new Message(`Failed to upload hold audio for ${extensions[currentExtensionIndex].name}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].name, extensions[currentExtensionIndex].extensionNumber, ['Custom hold audio failed', ''], e.error ?? ''))
                uploadNext()
            }
        }, rateLimitInterval)
    }, [shouldUploadOnHoldGreeting, rateLimitInterval, extensions, introGreetingPayload, currentExtensionIndex, baseURL])

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldUploadIntterruptGreeting || !accessToken) return
        if (!intterruptGreetingPayload.has('binary') || currentExtensionIndex >= extensions.length) {
            setCurrentExtensionIndex(0)
            setShouldUploadIntterruptGreeting(false)
            setShouldUploadVoicemailGreeting(true)
            return
        }

        setTimeout(async () => {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                let url = baseURL.replace('extensionId', `${extensions[currentExtensionIndex].id}`)
                url += '?apply=true'
                let response = await RestCentral.post(url, headers, intterruptGreetingPayload)
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postMessage(new Message('Rate limit reached. Waiting 60 seconds before continuing.', 'info'))
                }
                else {
                    setRateLimitInterval(250)
                }

                uploadNext()
            }
            catch (e: any) {
                console.log('It failed')
                console.log(e)
                postMessage(new Message(`Failed to upload interrupt audio for ${extensions[currentExtensionIndex].name}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].name, extensions[currentExtensionIndex].extensionNumber, ['Custom interrupt audio failed', ''], e.error ?? ''))
                uploadNext()
            }
        }, rateLimitInterval)
    }, [shouldUploadIntterruptGreeting, rateLimitInterval, extensions, introGreetingPayload, currentExtensionIndex, baseURL])

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldUploadVoicemailGreeting || !accessToken) return
        if (!voicemailGreetingPayload.has('binary') || currentExtensionIndex >= extensions.length) {
            setCurrentExtensionIndex(0)
            setShouldUploadVoicemailGreeting(false)
            setShouldUploadAfterHoursVoicemailGreeting(true)
            return
        }

        setTimeout(async () => {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                let url = baseURL.replace('extensionId', `${extensions[currentExtensionIndex].id}`)
                url += '?apply=true'
                let response = await RestCentral.post(url, headers, voicemailGreetingPayload)
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postMessage(new Message('Rate limit reached. Waiting 60 seconds before continuing.', 'info'))
                }
                else {
                    setRateLimitInterval(250)
                }

                uploadNext()
            }
            catch (e: any) {
                console.log('It failed')
                console.log(e)
                postMessage(new Message(`Failed to upload voicemail greeting for ${extensions[currentExtensionIndex].name} ${e.error}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].name, extensions[currentExtensionIndex].extensionNumber, ['Custom voicemail failed', ''], e.error ?? ''))
                uploadNext()
            }
        }, rateLimitInterval)
    }, [shouldUploadVoicemailGreeting, rateLimitInterval, extensions, voicemailGreetingPayload, currentExtensionIndex, baseURL])

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldUploadAfterHoursVoicemailGreeting || !accessToken) return
        if (!afterHoursVoicemailGreetingPayload.has('binary') || currentExtensionIndex >= extensions.length) {
            setCurrentExtensionIndex(0)
            setShouldUploadAfterHoursVoicemailGreeting(false)
            setProgressValue(Number.MAX_SAFE_INTEGER)
            setIsGreetingsUploadPending(false)
            return
        }

        setTimeout(async () => {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                let url = baseURL.replace('extensionId', `${extensions[currentExtensionIndex].id}`)
                url += '?apply=true'
                let response = await RestCentral.post(url, headers, afterHoursVoicemailGreetingPayload)
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postMessage(new Message('Rate limit reached. Waiting 60 seconds before continuing.', 'info'))
                }
                else {
                    setRateLimitInterval(250)
                }

                uploadNext()
            }
            catch (e: any) {
                console.log('It failed')
                console.log(e)
                postMessage(new Message(`Failed to upload after hours voicemail greeting for ${extensions[currentExtensionIndex].name} Verify that this queue's schedule is not set to 24/7. ${e.error}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].name, extensions[currentExtensionIndex].extensionNumber, ['Custom voicemail failed', ''], e.error ?? ''))
                uploadNext()
            }
        }, rateLimitInterval)
    }, [shouldUploadAfterHoursVoicemailGreeting, rateLimitInterval, extensions, afterHoursVoicemailGreetingPayload, currentExtensionIndex, baseURL])

    const uploadNext = () => {
        if (currentExtensionIndex >= extensions.length) {
            setShouldUploadIntroGreeting(false)
            return
        }
        else {
            setCurrentExtensionIndex(currentExtensionIndex + 1)
            setProgress(progress + 1)
            setProgressValue(progress)
        }
    }

    return { uploadGreetings, isGreetingsUploadPending }
}

export default useUploadCustomGreetings