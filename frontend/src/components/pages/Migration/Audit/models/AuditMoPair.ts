import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { MessageOnlyDataBundle } from "../../Users/models/MessageOnlyDataBundle";

export class AuditMoPair implements ExcelFormattable {
    constructor(private originalMo: MessageOnlyDataBundle, private newMo: MessageOnlyDataBundle | undefined) {
        if (newMo?.extension.data.contact.email.includes('.ps.ringcentral.com')) {
            newMo.extension.data.contact.email = newMo.extension.data.contact.email.replace('.ps.ringcentral.com', '')
        }

        if (!newMo || !newMo?.extendedData?.notifications) {
            return
        }

        // Remove .ps.ringcentral.com from notification email addresses
        if (newMo?.extendedData?.notifications?.emailAddresses) {
            newMo.extendedData.notifications.emailAddresses = newMo?.extendedData.notifications.emailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        // Remove .ps.ringcentral.com from advanced email addresses
        if (newMo?.extendedData?.notifications?.voicemails?.advancedEmailAddresses) {
            newMo.extendedData.notifications.voicemails.advancedEmailAddresses = newMo?.extendedData.notifications.voicemails.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newMo?.extendedData?.notifications?.inboundFaxes?.advancedEmailAddresses) {
            newMo.extendedData.notifications.inboundFaxes.advancedEmailAddresses = newMo?.extendedData.notifications.inboundFaxes.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newMo?.extendedData?.notifications?.outboundFaxes?.advancedEmailAddresses) {
            newMo.extendedData.notifications.outboundFaxes.advancedEmailAddresses = newMo?.extendedData.notifications.outboundFaxes.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newMo?.extendedData?.notifications?.missedCalls?.advancedEmailAddresses) {
            newMo.extendedData.notifications.missedCalls.advancedEmailAddresses = newMo?.extendedData.notifications.missedCalls.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newMo?.extendedData?.notifications?.inboundTexts?.advancedEmailAddresses) {
            newMo.extendedData.notifications.inboundTexts.advancedEmailAddresses = newMo?.extendedData.notifications.inboundTexts.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newMo?.extendedData?.notifications?.smsEmailAddresses) {
            newMo.extendedData.notifications.smsEmailAddresses = newMo?.extendedData.notifications.smsEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }
    }

    toExcelRow(): string[] {
        return [
            this.originalMo.extension.data.extensionNumber,
            this.newMo?.extension.data.extensionNumber ?? '',

            // Name
            this.originalMo.extension.data.name,
            this.newMo?.extension.data.name ?? '',
            this.originalMo.extension.data.name == this.newMo?.extension.data.name ? 'TRUE' : 'FALSE',

            // Site
            this.originalMo.extension.data.site?.name ?? '',
            this.newMo?.extension.data.site?.name ?? '',
            this.originalMo.extension.data.site?.name == this.newMo?.extension.data.site?.name ? 'TRUE' : 'FALSE',

            // Phone numbers
            this.originalMo.extendedData?.directNumbers?.map((n) => n.phoneNumber).join(', ') ?? '',
            this.newMo?.extendedData?.directNumbers?.map((n) => n.phoneNumber).join(', ') ?? '',
            this.originalMo.extendedData?.directNumbers?.map((n) => n.phoneNumber).join(', ') == this.newMo?.extendedData?.directNumbers?.join(', ') ? 'TRUE' : 'FALSE',

            // Email
            this.originalMo.extension.data.contact?.email ?? '',
            this.newMo?.extension.data.contact?.email ?? '',
            this.originalMo.extension.data.contact?.email == this.newMo?.extension.data.contact?.email ? 'TRUE' : 'FALSE',

            // Record name
            this.originalMo.extension.data.contact.pronouncedName?.text ?? '',
            this.newMo?.extension.data.contact.pronouncedName?.text ?? '',
            this.originalMo.extension.data.contact.pronouncedName?.text == this.newMo?.extension.data.contact.pronouncedName?.text ? 'TRUE' : 'FALSE',

            // Regional settings
            this.originalMo.extension.data.regionalSettings?.timezone.name ?? '',
            this.newMo?.extension.data.regionalSettings?.timezone.name ?? '',
            this.originalMo.extension.data.regionalSettings?.timezone.name == this.newMo?.extension.data.regionalSettings?.timezone.name ? 'TRUE' : 'FALSE',

            // Regional format
            this.originalMo.extension.data.regionalSettings?.formattingLocale.name ?? '',
            this.newMo?.extension.data.regionalSettings?.formattingLocale.name ?? '',
            this.originalMo.extension.data.regionalSettings?.formattingLocale.name == this.newMo?.extension.data.regionalSettings?.formattingLocale.name ? 'TRUE' : 'FALSE',

            // User language
            this.originalMo.extension.data.regionalSettings?.language.name ?? '',
            this.newMo?.extension.data.regionalSettings?.language.name ?? '',
            this.originalMo.extension.data.regionalSettings?.language.name == this.newMo?.extension.data.regionalSettings?.language.name ? 'TRUE' : 'FALSE',

            // Time format
            this.originalMo.extension.data.regionalSettings?.timeFormat ?? '',
            this.newMo?.extension.data.regionalSettings?.timeFormat ?? '',
            this.originalMo.extension.data.regionalSettings?.timeFormat == this.newMo?.extension.data.regionalSettings?.timeFormat ? 'TRUE' : 'FALSE',

            // VM greeting
            this.originalMo.extendedData?.greeting ? 'Custom' : 'Default',
            this.newMo?.extendedData?.greeting ? 'Custom' : 'Default',
            this.originalMo.extendedData?.greeting?.type == this.newMo?.extendedData?.greeting?.type ? 'TRUE' : 'FALSE',

            // VM recipient
            this.originalMo.vmRecipient,
            this.newMo?.vmRecipient ?? '',
            this.originalMo.vmRecipient == this.newMo?.vmRecipient ? 'TRUE' : 'FALSE',

            // VM to text
            this.originalMo.extendedData?.notifications?.voicemails.includeTranscription ? 'On' : 'Off',
            this.newMo?.extendedData?.notifications?.voicemails.includeTranscription ? 'On' : 'Off',
            this.originalMo.extendedData?.notifications?.voicemails.includeTranscription == this.newMo?.extendedData?.notifications?.voicemails.includeTranscription ? 'TRUE' : 'FALSE',

            // VM email
            this.originalMo.extendedData?.notifications?.emailAddresses.join('\n') ?? '',
            this.newMo?.extendedData?.notifications?.emailAddresses.join('\n') ?? '',
            this.originalMo.extendedData?.notifications?.emailAddresses.join('\n') == this.newMo?.extendedData?.notifications?.emailAddresses.join('\n') ? 'TRUE' : 'FALSE',

            // VM notification settings
            this.originalMo.extendedData?.notifications?.voicemails.notifyByEmail ? 'On' : 'Off',
            this.newMo?.extendedData?.notifications?.voicemails.notifyByEmail ? 'On' : 'Off',
            this.originalMo.extendedData?.notifications?.voicemails.notifyByEmail == this.newMo?.extendedData?.notifications?.voicemails.notifyByEmail ? 'TRUE' : 'FALSE',

            // Fax notification settings
            this.originalMo.extendedData?.notifications?.inboundFaxes.notifyByEmail ? 'On' : 'Off',
            this.newMo?.extendedData?.notifications?.inboundFaxes.notifyByEmail ? 'On' : 'Off',
            this.originalMo.extendedData?.notifications?.inboundFaxes.notifyByEmail == this.newMo?.extendedData?.notifications?.inboundFaxes.notifyByEmail ? 'TRUE' : 'FALSE',

            // Text notification settings
            this.originalMo.extendedData?.notifications?.inboundTexts.notifyByEmail ? 'On' : 'Off',
            this.newMo?.extendedData?.notifications?.inboundTexts.notifyByEmail ? 'On' : 'Off',
            this.originalMo.extendedData?.notifications?.inboundTexts.notifyByEmail == this.newMo?.extendedData?.notifications?.inboundTexts.notifyByEmail ? 'TRUE' : 'FALSE',
        ]
    }
}