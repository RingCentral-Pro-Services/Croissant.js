import { useEffect, useState } from "react";
import NotificationSettings from "../models/NotificationSettings";
import useValidateExcelData from "../hooks/useValidateExcelData";
import { notificationSchema } from "../helpers/schemas";
import { Message } from "../models/Message";
import { SyncError } from "../models/SyncError";

const useSwapNotificationEmails = (notifications: NotificationSettings[], excelData: any, isExcelDataPending: boolean, postMessage: (message: Message) => void, postError: (error: SyncError) => void) => {
    const [adjustedNotifications, setAdjustedNotifications] = useState<NotificationSettings[]>([])
    const [isEmailSwapPending, setIsEmailSwapPending] = useState(true)
    const {validatedData, isDataValidationPending, validate} = useValidateExcelData(notificationSchema, postMessage, postError)

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        
        let workingNotications: NotificationSettings[] = []
        let validNotifications = notifications.filter((notification) => {
            return notification.extension.extensionNumber !== undefined
        })
        
        for (const data of validatedData) {
            const targetID = data['Mailbox ID']
            const newEmailAddresses = data['Email Addresses'].split(',')

            for (let notification of validNotifications) {
                if (notification.extension.id == targetID) {
                    notification.data.emailAddresses = newEmailAddresses
                    workingNotications.push(notification)
                }
            }
        }
        setAdjustedNotifications(workingNotications)
        setIsEmailSwapPending(false)
    }, [isDataValidationPending])

    return {adjustedNotifications, isEmailSwapPending}
}

export default useSwapNotificationEmails