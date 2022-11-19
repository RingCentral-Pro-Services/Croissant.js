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
                    handleAdvancedMode(notification, data)
                    workingNotications.push(notification)
                }
            }
        }
        setAdjustedNotifications(workingNotications)
        setIsEmailSwapPending(false)
    }, [isDataValidationPending])

    const handleAdvancedMode = (notification: NotificationSettings, data: any) => {
        if (isUsingAdvancedMode(data)) {
            updateAdvancedEmails(notification, data)
        }
        else {
            notification.data.advancedMode = false
            notification.data.voicemails.advancedEmailAddresses = []
            notification.data.inboundFaxes.advancedEmailAddresses = []
            notification.data.outboundFaxes.advancedEmailAddresses = []
            notification.data.inboundTexts.advancedEmailAddresses = []
            notification.data.missedCalls.advancedEmailAddresses = []
        }
    }

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
        if (!('Advanced Voicemail Emails' in data) || data['Advanced Voicemail Emails'] === '') {
            notification.data.voicemails.notifyByEmail = false
            notification.data.voicemails.markAsRead = false
            notification.data.voicemails.includeAttachment = false
            notification.data.voicemails.advancedEmailAddresses = []
            return
        }

        const emails = data['Advanced Voicemail Emails'].toString().split(',')
        if (emails.length === 0) return
        notification.data.voicemails.advancedEmailAddresses = emails
        notification.data.voicemails.notifyByEmail = true
    }

    const updateAdvancedInboundFaxEmails = (notification: NotificationSettings, data: any) => {
        if (!('Advanced Inbound Fax Emails' in data) || data['Advanced Inbound Fax Emails'] === '') {
            notification.data.inboundFaxes.notifyByEmail = false
            notification.data.inboundFaxes.markAsRead = false
            notification.data.inboundFaxes.includeAttachment = false
            notification.data.inboundFaxes.advancedEmailAddresses = []
            return
        }

        const emails = data['Advanced Inbound Fax Emails'].toString().split(',')
        if (emails.length === 0) return
        notification.data.inboundFaxes.advancedEmailAddresses = emails
        notification.data.inboundFaxes.notifyByEmail = true
    }

    const updateAdvancedOutboundFaxEmails = (notification: NotificationSettings, data: any) => {
        if (!('Advanced Outbound Fax Emails' in data) || data['Advanced Outbound Fax Emails'] === '') {
            notification.data.outboundFaxes.notifyByEmail = false
            notification.data.outboundFaxes.advancedEmailAddresses = []
            return
        }

        const emails = data['Advanced Outbound Fax Emails'].toString().split(',')
        if (emails.length === 0) return
        notification.data.outboundFaxes.advancedEmailAddresses = emails
        notification.data.outboundFaxes.notifyByEmail = true
    }

    const updateAdvancedInboundTextEmails = (notification: NotificationSettings, data: any) => {
        if (!('Advanced Inbound Texts Emails' in data) || data['Advanced Inbound Texts Emails'] === '') {
            notification.data.inboundTexts.notifyByEmail = false
            notification.data.inboundTexts.advancedEmailAddresses = []
            return
        }

        const emails = data['Advanced Inbound Texts Emails'].toString().split(',')
        if (emails.length === 0) return
        notification.data.inboundTexts.advancedEmailAddresses = emails
        notification.data.inboundTexts.notifyByEmail = true
    }

    const updateAdvancedMissedCallstEmails = (notification: NotificationSettings, data: any) => {
        if (!('Advanced Missed Calls Emails' in data) || data['Advanced Missed Calls Emails'] === '') {
            notification.data.missedCalls.notifyByEmail = false
            notification.data.missedCalls.advancedEmailAddresses = []
            return
        }

        const emails = data['Advanced Missed Calls Emails'].toString().split(',')
        if (emails.length === 0) return
        notification.data.missedCalls.advancedEmailAddresses = emails
        notification.data.missedCalls.notifyByEmail = true
    }

    return {adjustedNotifications, isEmailSwapPending}
}

export default useSwapNotificationEmails