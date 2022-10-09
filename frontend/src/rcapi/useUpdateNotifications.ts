import { useEffect, useState } from "react"
import { Message } from "../models/Message"
import NotificationSettings from "../models/NotificationSettings"
import { RestCentral } from "./RestCentral"

const useUpdateNotifications = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void) => {
    const [notifications, setNotifications] = useState<NotificationSettings[]>([])
    const [shouldUpdate, setShouldUpdate] = useState(false)
    let [rateLimitInterval, setRateLimitInterval] = useState(0)
    let [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [isNotificationUpdatePending, setIsNotificationUpdatePending] = useState(true)
    const accessToken = localStorage.getItem('cs_access_token')
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'

    const updateNotifications = (notifications: NotificationSettings[]) => {
        setRateLimitInterval(0)
        setNotifications(notifications)
        setCurrentExtensionIndex(0)
        setIsNotificationUpdatePending(true)
        setShouldUpdate(true)
    }

    useEffect(() => {
        if (!shouldUpdate) return
        if (currentExtensionIndex >= notifications.length) {
            setShouldUpdate(false)
            setProgressValue(notifications.length)
            return
        }

        console.log(notifications[currentExtensionIndex])
        const url = baseURL.replace('extensionId', `${notifications[currentExtensionIndex].extension.id}`)
        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
        setTimeout(async () => {
            try {
                let response = await RestCentral.put(url, headers, notifications[currentExtensionIndex].data)
                // console.log(response)
                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                setRateLimitInterval(response.rateLimitInterval)
            }
            catch (error) {
                console.log('Oh no! Something went wrong')
                console.log(error)
                postMessage(new Message(`Something went wrong updating notifications for ${notifications[currentExtensionIndex].extension.name} - Ext. ${notifications[currentExtensionIndex].extension.extensionNumber}`, 'error'))
            }
            increaseProgress()
            setCurrentExtensionIndex(currentExtensionIndex + 1)
        }, rateLimitInterval)
    }, [currentExtensionIndex, rateLimitInterval, notifications])

    const increaseProgress = () => {
        setProgressValue((prev: any) => prev + 1)
    }

    return {updateNotifications, isNotificationUpdatePending}
}

export default useUpdateNotifications