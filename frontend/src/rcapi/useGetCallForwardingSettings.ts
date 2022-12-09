import { useEffect, useState } from "react"
import { CallForwardingSettings } from "../models/CallForwardingSettings"
import { Message } from "../models/Message"
import RCExtension from "../models/RCExtension"
import { SyncError } from "../models/SyncError"
import { RestCentral } from "./RestCentral"

const useGetCallForwardingSettings = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [extensions, setExtensions] = useState<RCExtension[]>([])
    const [callForwardingSettings, setCallForwardingSettings] = useState<CallForwardingSettings[]>([])
    const [isCallForwardingSettingsPending, setIsCallForwardingSettingsPending] = useState(true)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [shouldFetch, setShouldFetch] = useState(false)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/business-hours-rule'

    const fetchCallForwardingSettings = (extensions: RCExtension[]) => {
        setExtensions(extensions)
        setShouldFetch(true)
        setIsCallForwardingSettingsPending(true)
        setCurrentExtensionIndex(0)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldFetch || !accessToken) return
        if (currentExtensionIndex >= extensions.length) {
            setIsCallForwardingSettingsPending(false)
            setShouldFetch(false)
            setProgressValue(Number.MAX_SAFE_INTEGER)
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
                const response = await RestCentral.get(url, headers)
                if (response.rateLimitInterval > 0) {
                    postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                    setRateLimitInterval(response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }

                let settingsList: CallForwardingSettings[] = [...callForwardingSettings]
                const settings: CallForwardingSettings = {
                    extensionID: `${extensions[currentExtensionIndex].id}`,
                    extensionName: extensions[currentExtensionIndex].name,
                    extensionNumber: extensions[currentExtensionIndex].extensionNumber,
                    forwarding: response.data.forwarding
                }
                settingsList.push(settings)
                setCallForwardingSettings(settingsList)

                updateNext()
            }
            catch (e: any) {
                console.log(`Failed to get call handling for ${extensions[currentExtensionIndex].name}`)
                postMessage(new Message(`Failed to get call handling for ${extensions[currentExtensionIndex].name}. ${e.error}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].name, extensions[currentExtensionIndex].extensionNumber, ['Failed to get call handling', '', e.error ?? '']))
            }
        }, rateLimitInterval)

    }, [rateLimitInterval, currentExtensionIndex, shouldFetch, extensions])

    const updateNext = () => {
        if (currentExtensionIndex >= extensions.length) {
            setIsCallForwardingSettingsPending(false)
            setShouldFetch(false)
            setProgressValue(Number.MAX_SAFE_INTEGER)
            return
        }
        else {
            setCurrentExtensionIndex(currentExtensionIndex + 1)
            setProgressValue(currentExtensionIndex)
        }
    }

    return { fetchCallForwardingSettings, isCallForwardingSettingsPending, callForwardingSettings }
}

export default useGetCallForwardingSettings