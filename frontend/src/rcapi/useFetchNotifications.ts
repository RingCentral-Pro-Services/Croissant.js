import { useEffect, useState } from "react";
import { Message } from "../models/Message";
import NotificationSettings, { NotificationSettingsPayload } from "../models/NotificationSettings";
import RCExtension from "../models/RCExtension";
import rateLimit from "../helpers/rateLimit";
const axios = require('axios').default;

const useFetchNotifications = (postMessage: (message: Message) => void) => {
    let [notifications, setNotifications] = useState<NotificationSettings[]>([])
    const accessToken = localStorage.getItem('cs_access_token')
    let [shouldFetch, setShouldFetch] = useState(false)
    let [rateLimitInterval, setRateLimitInterval] = useState(0)
    let [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])
    let [isNotificationListPending, setIsNotificationListPending] = useState(true)
    const baseURL = 'https://platform.devtest.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'
    let [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)

    const fetchNotificationSettings = (extensionsList: RCExtension[]) => {
        // Filter out extensions that don't have notification settings
        let filtered = extensionsList.filter((extension: RCExtension) => {
            return (extension.type === 'User' || extension.type === 'Department' || extension.type === 'VirtualUser' || extension.type === 'Voicemail' || extension.type === 'SharedLinesGroup')
        })

        console.log(`Filtered extensions: ${filtered.length}`)

        setNotifications([])
        setIsNotificationListPending(true)
        setFilteredExtensions(filtered)
        setShouldFetch(true)
    }

    useEffect(() => {
        if (!shouldFetch) return
        if (currentExtensionIndex === filteredExtensions.length) return

        let targetUID = localStorage.getItem('target_uid')
        if (!targetUID) return

        let url = baseURL.replace('~', targetUID!)
        url = url.replace('extensionId', `${filteredExtensions[currentExtensionIndex].id}`)

        setTimeout(() => {
            axios
            .get(url, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            })
            .then((res: any) => {
               if (res.status === 200) {
                    // Do something with the response
                    console.log(res)
                    let resData = res.data
                    let bundle: NotificationSettingsPayload = resData
                    let notification = new NotificationSettings(filteredExtensions[currentExtensionIndex], bundle)
                    let newNotifications = [...notifications, notification]
                    setNotifications(newNotifications)
                    console.log(bundle)

                    // Rate limiting
                    setRateLimitInterval(rateLimit(res.headers))
                    if (currentExtensionIndex !== filteredExtensions.length - 1) {
                        // setRateLimitInterval(rateLimit(res.headers))
                        setCurrentExtensionIndex(currentExtensionIndex + 1)
                    }
                    else {
                        setIsNotificationListPending(false)
                        setShouldFetch(false)
                        setRateLimitInterval(0)
                        setCurrentExtensionIndex(0)
                        console.log('Finished fetching notifications')
                    }
               }
               else {
                setShouldFetch(false)
               }
            })
            .catch((error: Error) => {
                console.log('An error occurred', error)
                setShouldFetch(false)
            })

            // setCurrentExtensionIndex(currentExtensionIndex + 1)
        }, rateLimitInterval)

    }, [filteredExtensions, shouldFetch, currentExtensionIndex, accessToken, rateLimitInterval, notifications])

    return {notifications, fetchNotificationSettings, isNotificationListPending}
}

export default useFetchNotifications