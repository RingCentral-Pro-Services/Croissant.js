import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Extension } from "../../../../../models/Extension";
import { Greeting } from "../../../../../models/Greetings";
import { Notifications, PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class MessageOnlyDataBundle implements ExcelFormattable {
    public hasEncounteredFatalError = false
    
    constructor(public extension: Extension, public extendedData?: ExtendedMOData, public phoneNumberMap?: Map<string, PhoneNumber>) {}

    toExcelRow(): string[] {
        return [
            '', // Initial on completion. Ignored.
            this.extension.prettyType(),
            this.extension.data.name,
            this.extension.data.extensionNumber,
            this.extendedData?.directNumbers?.map((number) => number.phoneNumber).join(', ') ?? '',
            this.getTempNumbers(), // Temp number. Ignored.
            this.extension.data.site?.name ?? '',
            this.extension.data.contact.email,
            this.extension.data.contact.pronouncedName?.text ?? '',
            this.extension.data.regionalSettings?.timezone.description ?? '',
            this.extension.data.regionalSettings?.formattingLocale.name ?? '',
            this.extension.data.regionalSettings?.language.name ?? '',
            this.extension.data.regionalSettings?.timeFormat ?? '',
            this.extendedData?.greeting ? 'Custom' : 'Default',
            this.extendedData?.vmRecipientID ? this.extendedData.vmRecipientID : this.extension.data.name,
            this.extendedData?.notifications?.voicemails.includeTranscription ? '' : '', // Come back to this
            this.extendedData?.notifications?.emailAddresses.join(', ') ?? '',
            this.prettyVoicemailNotificationSettings(),
            this.prettyFaxNotificationSettings(),
            this.extendedData!.notifications?.inboundTexts.notifyByEmail ? 'Notify' : 'Do not notify',
        ]
    }

    getTempNumbers() {
        if (!this.extendedData?.directNumbers) return ''
        let result = ''

        for (let i = 0; i < this.extendedData!.directNumbers.length; i++) {
            const tempNumber = this.phoneNumberMap?.get(this.extendedData!.directNumbers[i].phoneNumber)?.phoneNumber
            if (!tempNumber) continue
            result += `${tempNumber}`
            if (i !== this.extendedData!.directNumbers.length - 1) result += '\n'
        }

        return result
    }

    prettyVoicemailNotificationSettings() {
        if (!this.extendedData!.notifications) return ''

        if (this.extendedData!.notifications.voicemails.notifyByEmail) {
            if (this.extendedData!.notifications.voicemails.includeAttachment && this.extendedData!.notifications.voicemails.markAsRead) {
                return 'Notify and attach and mark as read'
            }
            else if (this.extendedData!.notifications.voicemails.includeAttachment) {
                return 'Notify and attach'
            }
            return 'Notify'
        }

        return 'Do not notify'
    }

    prettyFaxNotificationSettings() {
        if (!this.extendedData!.notifications?.inboundFaxes.notifyByEmail) return 'Do not notify'

        if (this.extendedData!.notifications.inboundFaxes.notifyByEmail) {
            if (this.extendedData!.notifications.inboundFaxes.includeAttachment && this.extendedData!.notifications.inboundFaxes.markAsRead) {
                return 'Notify and attach and mark as read'
            }
            else if (this.extendedData!.notifications.inboundFaxes.includeAttachment) {
                return 'Notify and attach'
            }
            return 'Notify'
        }

        return 'Do not notify'
    }

}

interface ExtendedMOData {
    notifications?: Notifications
    directNumbers?: PhoneNumber[]
    vmRecipientID?: string
    greeting?: Greeting
}