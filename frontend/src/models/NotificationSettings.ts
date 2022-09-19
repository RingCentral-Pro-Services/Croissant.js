import CSVFormattable from "./CSVFormattable"
import NotificationBundle from "./NotificationBundle"
import RCExtension from "./RCExtension"

class NotificationSettings implements CSVFormattable {
    constructor(public extension: RCExtension, public data: NotificationSettingsPayload) {}

    toRow(): string {
        return `${this.extension.id},${this.extension.name},${this.extension.extensionNumber},${this.extension.prettyType[this.extension.type]},"${this.data.emailAddresses ?? ""}"`
    }
}

export interface NotificationSettingsPayload {
    uri: string
    emailAddresses: string[]
    includeManagers: boolean
    advancedMode: boolean
    voicemails: NotificationBundle
    inboundFaxes: NotificationBundle
    outboundFaxes: NotificationBundle
    inboundTexts: NotificationBundle
    missedCalls: NotificationBundle
}

export default NotificationSettings