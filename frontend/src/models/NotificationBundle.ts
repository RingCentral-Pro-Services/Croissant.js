interface NotificationBundle {
    notifyByEmail: boolean
    notifyBySMS: boolean
    advancedEmailAddresses: string[]
    advancedSMSEmailAddresses: string[]
    includeAttachment: boolean
    markAsRead: boolean
}

export default NotificationBundle