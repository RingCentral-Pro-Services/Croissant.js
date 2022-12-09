import { useEffect, useState } from "react"
import { CallForwardingSettings } from "../models/CallForwardingSettings"
import { Message } from "../models/Message"
import { SyncError } from "../models/SyncError"
import { RestCentral } from "./RestCentral"

const useAdjustCallForwarding = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [callHandlingSettings, setCallHandlingSettings] = useState<CallForwardingSettings[]>([])
    const [isCallHandlingSettingsPending, setIsCallHandlingSettingsPending] = useState(true)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [shouldFetch, setShouldFetch] = useState(false)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/business-hours-rule'

    const adjustCallForwarding = (callHandlingSettings: CallForwardingSettings[]) => {
        setCallHandlingSettings(callHandlingSettings)
        setShouldFetch(true)
        setIsCallHandlingSettingsPending(true)
        setCurrentExtensionIndex(0)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldFetch || !accessToken) return
        if (currentExtensionIndex >= callHandlingSettings.length) {
            setIsCallHandlingSettingsPending(false)
            setShouldFetch(false)
            return
        }

        setTimeout(async () => {
            const url = baseURL.replace('extensionId', `${callHandlingSettings[currentExtensionIndex].extensionID}`)
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                const response = await RestCentral.put(url, headers, {forwarding: callHandlingSettings[currentExtensionIndex].forwarding})
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }

                updateNext()
            }
            catch (e: any) {
                console.log('Something went horibly wrong')
                console.log(e)
                postMessage(new Message(`Something went wrong while adjusting call forwarding settings for extension ${callHandlingSettings[currentExtensionIndex].extensionID}`, 'error'))
                updateNext()
            }
        }, rateLimitInterval)
        
    }, [callHandlingSettings, shouldFetch, currentExtensionIndex, rateLimitInterval, baseURL])

    const updateNext = () => {
        if (currentExtensionIndex >= callHandlingSettings.length) {
            setIsCallHandlingSettingsPending(false)
            setShouldFetch(false)
            setProgressValue(Number.MAX_SAFE_INTEGER)
            return
        }
        else {
            setCurrentExtensionIndex(currentExtensionIndex + 1)
            setProgressValue(currentExtensionIndex + 1)
        }
    }

    return { adjustCallForwarding, isCallHandlingSettingsPending }
}

export default useAdjustCallForwarding