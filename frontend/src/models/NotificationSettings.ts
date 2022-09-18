import NotificationBundle from "./NotificationBundle"

class NotificationSettings {
    constructor(public id: number, public emailAddresses: string[], public includeManagers: boolean, public advancedMode: boolean, notificationBundles: NotificationBundle[]) {}
}

export default NotificationSettings