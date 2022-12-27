import { useEffect, useState } from "react"
import { Device } from "../models/Device"
import { Message } from "../models/Message"
import RCExtension from "../models/RCExtension"
import { SyncError } from "../models/SyncError"
import { RestCentral } from "./RestCentral"

const useDeviceMap = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [deviceMap, setDeviceMap] = useState<Map<string, Device[]>>(new Map())
    const [extensions, setExtensions] = useState<RCExtension[]>([])
    const [isDeviceMapPending, setIsDeviceMapPending] = useState(true)
    const [shouldFetch, setShouldFetch] = useState(false)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/device'
    
    const getDeviceMap = (extensions: RCExtension[]) => {
        setExtensions(extensions)
        setShouldFetch(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem("cs_access_token")
        if (!accessToken || !shouldFetch) {
            return
        }
        if (currentExtensionIndex >= extensions.length) {
            setIsDeviceMapPending(false)
            return
        }

        setTimeout(async () => {
            const url = baseURL.replace("extensionId", `${extensions[currentExtensionIndex].id}`)
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                const response = await RestCentral.get(url, headers)
                console.log(response)
                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message('Rate limit reached. Waiting 60 seconds before continuing...', 'info'), response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }

                const devices = response.data.records as Device[]
                const newDeviceMap = new Map(deviceMap)
                newDeviceMap.set(`${extensions[currentExtensionIndex].id}`, devices)
                setDeviceMap(newDeviceMap)
                fetchNext()
            }
            catch (e: any) {
                postMessage(new Message(`Failed to fetch devices for extension ${extensions[currentExtensionIndex].name}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].name, extensions[currentExtensionIndex].extensionNumber, ['Failed to get devices', ''], e.rror ?? ''))
                console.log(`Failed to fetch devices for extension ${extensions[currentExtensionIndex].name}`)
                console.log(e)
            }
        }, rateLimitInterval)
    }, [extensions, shouldFetch, currentExtensionIndex])

    const fetchNext = () => {
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setProgressValue(currentExtensionIndex + 1)
    }

    return { deviceMap, isDeviceMapPending, getDeviceMap }

}

export default useDeviceMap