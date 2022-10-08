import { useEffect, useState } from "react";
import NotificationSettings from "../models/NotificationSettings";

const useSwapNotificationEmails = (notifications: NotificationSettings[], excelData: any, isExcelDataPending: boolean) => {
    const [adjustedNotifications, setAdjustedNotifications] = useState<NotificationSettings[]>([])
    const [isEmailSwapPending, setIsEmailSwapPending] = useState(true)

    useEffect(() => {
        if (isExcelDataPending) return
        let workingNotications: NotificationSettings[] = []
        let validNotifications = notifications.filter((notification) => {
            return notification.extension.extensionNumber !== undefined
        })
        
        for (const data of excelData) {
            const targetID = data['Mailbox ID']
            const newEmailAddresses = data['Email Addresses'].split(',')
            // console.log(`Email Addresses: ${newEmailAddresses}`)

            for (let notification of validNotifications) {
                if (notification.extension.id == targetID) {
                    notification.data.emailAddresses = newEmailAddresses
                    workingNotications.push(notification)
                }
            }
        }
        setAdjustedNotifications(workingNotications)
        setIsEmailSwapPending(false)

    }, [isExcelDataPending])

    return {adjustedNotifications, isEmailSwapPending}
}

export default useSwapNotificationEmails