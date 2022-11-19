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
                    if (isUsingAdvancedMode(data)) updateAdvancedEmails(notification, data)
                    workingNotications.push(notification)
                }
            }
        }
        setAdjustedNotifications(workingNotications)
        setIsEmailSwapPending(false)
    }, [isDataValidationPending])

    const isUsingAdvancedMode = (data: any) => {
        if ('Advanced Voicemail Emails' in data && data['Advanced Voicemail Emails'] != '') return true
        if ('Advanced Inbound Fax Emails' in data && data['Advanced Inbound Fax Emails'] != '') return true
        if ('Advanced Outbound Fax Emails' in data && data['Advanced Outbound Fax Emails'] != '') return true
        if ('Advanced Inbound Texts Emails' in data && data['Advanced Inbound Texts Emails'] != '') return true
        if ('Advanced Missed Calls Emails' in data && data['Advanced Missed Calls Emails'] != '') return true
        return false
    }

    const updateAdvancedEmails = (notification: NotificationSettings, data: any) => {
        notification.data.advancedMode = true
        updateAdvancedVoicemailEmails(notification, data)
        updateAdvancedInboundFaxEmails(notification, data)
        updateAdvancedOutboundFaxEmails(notification, data)
        updateAdvancedInboundTextEmails(notification, data)
        updateAdvancedMissedCallstEmails(notification, data)
    }

    const updateAdvancedVoicemailEmails = (notification: NotificationSettings, data: any) => {
        if (!('Advanced Voicemail Emails' in data)) return

        const emails = data['Advanced Voicemail Emails'].toString().split(',')
        if (emails.length === 0) return
        notification.data.voicemails.advancedEmailAddresses = emails
        notification.data.voicemails.notifyByEmail = true
    }

    const updateAdvancedInboundFaxEmails = (notification: NotificationSettings, data: any) => {
        if (!('Advanced Inbound Fax Emails' in data)) return

        const emails = data['Advanced Inbound Fax Emails'].toString().split(',')
        if (emails.length === 0) return
        notification.data.inboundFaxes.advancedEmailAddresses = emails
        notification.data.inboundFaxes.notifyByEmail = true
    }

    const updateAdvancedOutboundFaxEmails = (notification: NotificationSettings, data: any) => {
        if (!('Advanced Outbound Fax Emails' in data)) return

        const emails = data['Advanced Outbound Fax Emails'].toString().split(',')
        if (emails.length === 0) return
        notification.data.outboundFaxes.advancedEmailAddresses = emails
        notification.data.outboundFaxes.notifyByEmail = true
    }

    const updateAdvancedInboundTextEmails = (notification: NotificationSettings, data: any) => {
        if (!('Advanced Inbound Texts Emails' in data)) return

        const emails = data['Advanced Inbound Texts Emails'].toString().split(',')
        if (emails.length === 0) return
        notification.data.inboundTexts.advancedEmailAddresses = emails
        notification.data.inboundTexts.notifyByEmail = true
    }

    const updateAdvancedMissedCallstEmails = (notification: NotificationSettings, data: any) => {
        if (!('Advanced Missed Calls Emails' in data)) return

        const emails = data['Advanced Missed Calls Emails'].toString().split(',')
        if (emails.length === 0) return
        notification.data.missedCalls.advancedEmailAddresses = emails
        notification.data.missedCalls.notifyByEmail = true
    }

    return {adjustedNotifications, isEmailSwapPending}
}

export default useSwapNotificationEmails