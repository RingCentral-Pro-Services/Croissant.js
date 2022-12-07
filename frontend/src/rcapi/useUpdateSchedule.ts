import { useEffect, useState } from "react"
import { Message } from "../models/Message"
import RCExtension from "../models/RCExtension"
import { SyncError } from "../models/SyncError"
import { RestCentral } from "./RestCentral"

const useUpdateSchedule = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [extensions, setExtensions] = useState<RCExtension[]>([])
    const [payload, setPayload] = useState({})
    const [isScheduleUpdatePending, setIsScheduleUpdatePending] = useState(true)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [shouldUpdate, setShouldUpdate] = useState(false)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/business-hours'

    const updateSchedule = (extensions: RCExtension[], payload: any) => {
        if (Object.keys(payload).length === 0) {
            setIsScheduleUpdatePending(false)
            setProgressValue(Number.MAX_SAFE_INTEGER)
            return
        }
        setPayload(payload)
        setIsScheduleUpdatePending(true)
        setExtensions(extensions)
        setShouldUpdate(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldUpdate || !accessToken) {
            console.log('Not updating schedule')
            return
        }

        if (currentExtensionIndex >= extensions.length) {
            console.log('Finished updating schedule')
            setIsScheduleUpdatePending(false)
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
                const response = await RestCentral.put(url, headers, payload)
                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message(`Rate limit reached. Pausing for ${response.rateLimitInterval}ms`, 'info'), response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }
                updateNext()
            }
            catch (e: any) {
                console.log('Oh no! Something went wrong updating schedule')
                console.log(e)
                postMessage(new Message(`Error updating schedule for ${extensions[currentExtensionIndex].name}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].name, extensions[currentExtensionIndex].extensionNumber, ['Schedule update failed', ''], e.error))
                updateNext()
            }
        }, rateLimitInterval)

    }, [shouldUpdate, extensions, baseURL, currentExtensionIndex, rateLimitInterval])

    const updateNext = () => {
        if (currentExtensionIndex >= extensions.length) {
            setIsScheduleUpdatePending(false)
            setShouldUpdate(false)
            setProgressValue(Number.MAX_SAFE_INTEGER)
        }
        else {
            setCurrentExtensionIndex(currentExtensionIndex + 1)
            setProgressValue(currentExtensionIndex)
        }
    }

    return {updateSchedule, isScheduleUpdatePending}
}

export default useUpdateSchedule