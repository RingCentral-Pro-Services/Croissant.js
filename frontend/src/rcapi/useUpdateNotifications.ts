import { useEffect, useState } from "react"
import NotificationSettings from "../models/NotificationSettings"
import { RestCentral } from "./RestCentral"

const useUpdateNotifications = () => {
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
                setRateLimitInterval(response.rateLimitInterval)
            }
            catch (error) {
                console.log('Oh no! Something went wrong')
                console.log(error)
            }
            setCurrentExtensionIndex(currentExtensionIndex + 1)
        }, rateLimitInterval)
    }, [currentExtensionIndex, rateLimitInterval, notifications])

    return {updateNotifications, isNotificationUpdatePending}
}

export default useUpdateNotifications