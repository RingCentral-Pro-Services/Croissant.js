import { useState } from "react";
import { Message } from "../models/Message";
import NotificationSettings, { NotificationSettingsPayload } from "../models/NotificationSettings";
import RCExtension from "../models/RCExtension";
import { RestCentral } from "./RestCentral";
import { wait } from "../helpers/rcapi";

const useFetchNotifications = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, setProgressValue: (value: (any)) => void, setMaxProgressValue: (value: (any)) => void) => {
    let [notifications, setNotifications] = useState<NotificationSettings[]>([])
    let [isNotificationListPending, setIsNotificationListPending] = useState(true)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/notification-settings'
    const baseWaitingPeriod = 250

    const fetchNotificationSettings = async (extensionsList: RCExtension[]) => {
        // Filter out extensions that don't have notification settings
        let filtered = extensionsList.filter((extension: RCExtension) => {
            return extension.extensionNumber !== undefined && (extension.type === 'User' || extension.type === 'Department' || extension.type === 'VirtualUser' || extension.type === 'Voicemail' || extension.type === 'SharedLinesGroup')
        })
        setMaxProgressValue(filtered.length)

        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const notifications: NotificationSettings[] = []

        for (let index = 0; index < filtered.length; index++) {
            const notificationPacket = await getNotifications(filtered[index], accessToken)
            if (!notificationPacket) continue
            notifications.push(notificationPacket)
            setProgressValue(index)
        }

        setIsNotificationListPending(false)
        setProgressValue(Number.MAX_VALUE)
        setNotifications(notifications)
        console.log('Finished fetching notifications')

    }

    const getNotifications = async (extension: RCExtension, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.get(baseURL.replace('extensionId', `${extension.id}`), headers)
            
            let resData = response.data
            let bundle: NotificationSettingsPayload = resData
            let notification = new NotificationSettings(extension, bundle)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message('Rate limit reached. Waitinf for 60 seconds', 'info'), response.rateLimitInterval / 1000)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return notification
        }
        catch (e: any) {
            console.log(`Failed to get notification settings`)
            console.log(e)
            postMessage(new Message(`Failed to get notification settings ${e.error ?? ''}`, 'error'))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {notifications, fetchNotificationSettings, isNotificationListPending}
}

export default useFetchNotifications