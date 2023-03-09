import { useEffect, useState } from "react"
import { Message } from "../models/Message"
import RCExtension from "../models/RCExtension"
import { SyncError } from "../models/SyncError"
import { RestCentral } from "./RestCentral"

const useUpdateCallHandling = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [shouldUpdate, setShouldUpdate] = useState(false)
    const [shouldUpdateAfterHours, setShouldUpdateAfterHours] = useState(false)
    const [extensions, setExtensions] = useState<RCExtension[]>([])
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [isCallHandlingUpdatePending, setIsCallHandlingUpdatePending] = useState(true)
    const [payload, setPayload] = useState({})
    const [afterHoursPayload, setAfterHoursPayload] = useState({})
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/business-hours-rule'
    const baseAfterHoursURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/after-hours-rule'

    const updateCallHandling = (extensionList: RCExtension[], payload: any, afterHoursPayload: any) => {

        if (Object.keys(payload).length === 0 && Object.keys(afterHoursPayload).length === 0) {
            setProgressValue(Number.MAX_SAFE_INTEGER)
            setIsCallHandlingUpdatePending(false)
            return
        }

        setExtensions(extensionList)
        setPayload(payload)
        setAfterHoursPayload(afterHoursPayload)
        setShouldUpdate(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldUpdate || !accessToken) return
        if (Object.keys(payload).length === 0  || currentExtensionIndex >= extensions.length) {
            setShouldUpdate(false)
            setShouldUpdateAfterHours(true)
            setCurrentExtensionIndex(0)
            return
        }

        setTimeout(async () => {
            const url = baseURL.replace('extensionId', `${extensions[currentExtensionIndex].id}`)
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                const response = await RestCentral.put(url, headers, payload)
                console.log(response)
                if (response.rateLimitInterval > 0) {
                    postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                    setRateLimitInterval(response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }
                updateNext()
            }
            catch (e: any) {
                console.log(`Failed to update call handling for ${extensions[currentExtensionIndex].name}`)
                postMessage(new Message(`Failed to update call handling for ${extensions[currentExtensionIndex].name}. ${e.error}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].name, extensions[currentExtensionIndex].extensionNumber, ['Call Handling Update Failed', ''], e.error))
                updateNext()
            }
        }, rateLimitInterval)

    }, [shouldUpdate, rateLimitInterval, currentExtensionIndex, payload, baseURL, extensions])

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldUpdateAfterHours || !accessToken) return
        if (Object.keys(afterHoursPayload).length === 0 || currentExtensionIndex >= extensions.length) {
            setShouldUpdateAfterHours(false)
            setProgressValue(extensions.length * 2)
            setIsCallHandlingUpdatePending(false)
            return
        }

        setTimeout(async () => {
            const url = baseAfterHoursURL.replace('extensionId', `${extensions[currentExtensionIndex].id}`)
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                const response = await RestCentral.put(url, headers, afterHoursPayload)
                console.log(response)
                if (response.rateLimitInterval > 0) {
                    postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                    setRateLimitInterval(response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }
                updateNextAfterHours()
            }
            catch (e: any) {
                console.log(`Failed to update after hours voicemail greeting for ${extensions[currentExtensionIndex].name}`)
                postMessage(new Message(`Failed to update after hours voicemail greeting ${extensions[currentExtensionIndex].name}. ${e.error}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].name, extensions[currentExtensionIndex].extensionNumber, ['Call Handling Update Failed', ''], e.error))
                updateNext()
            }
        }, rateLimitInterval)

    }, [shouldUpdateAfterHours, rateLimitInterval, currentExtensionIndex, afterHoursPayload, baseURL, extensions])

    const updateNext = () => {
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setProgressValue(currentExtensionIndex)
    }

    const updateNextAfterHours = () => {
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setProgressValue(currentExtensionIndex + extensions.length)
    }

    return {updateCallHandling, isCallHandlingUpdatePending}
}

export default useUpdateCallHandling