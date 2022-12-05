import { useEffect, useState } from "react"
import { Message } from "../models/Message"
import RCExtension from "../models/RCExtension"
import { SyncError } from "../models/SyncError"
import { RestCentral } from "./RestCentral"

const useApplyRegionalSettings = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [payload, setPayload] = useState({})
    const [extensions, setExtensions] = useState<RCExtension[]>([])
    const [shouldUpdate, setShouldUpdate] = useState(false)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [isRegionalSettingApplicationPending, setIsRegionalSettingApplicationPending] = useState(true)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'

    const applyRegionalSettings = (extensions: RCExtension[], payload: any) => {
        setExtensions(extensions)
        setPayload(payload)
        setShouldUpdate(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldUpdate || !accessToken) return
        if (currentExtensionIndex >= extensions.length || Object.keys(payload).length === 0) {
            setProgressValue(extensions.length)
            setShouldUpdate(false)
            setIsRegionalSettingApplicationPending(false)
            return
        }

        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }

        setTimeout(async () => {
            const url = baseURL.replace('extensionId', `${extensions[currentExtensionIndex].id}`)
            try {
                const response = await RestCentral.put(url, headers, {regionalSettings: payload})
                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }
                updateNext()
            }
            catch (e: any) {
                console.log(`Something went wrong updating regional settings for ${extensions[currentExtensionIndex].name}`)
                console.log(e)
                postMessage(new Message(`Failed to update regional settings for ${extensions[currentExtensionIndex].name} Ext. ${extensions[currentExtensionIndex].extensionNumber}. ${e.error}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].name, extensions[currentExtensionIndex].extensionNumber, ['Regional settings update failed', ''], e.error))
                updateNext()
            }
        }, rateLimitInterval)

    }, [shouldUpdate, rateLimitInterval, currentExtensionIndex, extensions, payload, baseURL])

    const updateNext = () => {
        if (currentExtensionIndex >= extensions.length) {
            setShouldUpdate(false)
            setIsRegionalSettingApplicationPending(false)
            setProgressValue(extensions.length * 2)
        }
        else {
            setProgressValue(currentExtensionIndex)
            setCurrentExtensionIndex(currentExtensionIndex + 1)
        }
    }

    return {applyRegionalSettings, isRegionalSettingApplicationPending}
}

export default useApplyRegionalSettings