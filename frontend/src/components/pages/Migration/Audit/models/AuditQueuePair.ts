import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { CallQueueDataBundle } from "../../Users/models/CallQueueDataBundle";

export class AuditQueuePair implements ExcelFormattable {
    constructor(private originalQueue: CallQueueDataBundle, private newQueue: CallQueueDataBundle | undefined) {

        if (!newQueue || !newQueue?.extendedData?.notifications) {
            return
        }

        // Remove .ps.ringcentral.com from email address
        if (newQueue?.extension.data.contact?.email) {
            newQueue.extension.data.contact.email = newQueue?.extension.data.contact.email.replace('.ps.ringcentral.com', '');
        }

        // Remove .ps.ringcentral.com from notification email addresses
        if (newQueue?.extendedData?.notifications?.emailAddresses) {
            newQueue.extendedData.notifications.emailAddresses = newQueue?.extendedData.notifications.emailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        // Remove .ps.ringcentral.com from advanced email addresses
        if (newQueue?.extendedData?.notifications?.voicemails?.advancedEmailAddresses) {
            newQueue.extendedData.notifications.voicemails.advancedEmailAddresses = newQueue?.extendedData.notifications.voicemails.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newQueue?.extendedData?.notifications?.inboundFaxes?.advancedEmailAddresses) {
            newQueue.extendedData.notifications.inboundFaxes.advancedEmailAddresses = newQueue?.extendedData.notifications.inboundFaxes.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newQueue?.extendedData?.notifications?.outboundFaxes?.advancedEmailAddresses) {
            newQueue.extendedData.notifications.outboundFaxes.advancedEmailAddresses = newQueue?.extendedData.notifications.outboundFaxes.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newQueue?.extendedData?.notifications?.missedCalls?.advancedEmailAddresses) {
            newQueue.extendedData.notifications.missedCalls.advancedEmailAddresses = newQueue?.extendedData.notifications.missedCalls.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newQueue?.extendedData?.notifications?.inboundTexts?.advancedEmailAddresses) {
            newQueue.extendedData.notifications.inboundTexts.advancedEmailAddresses = newQueue?.extendedData.notifications.inboundTexts.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newQueue?.extendedData?.notifications?.smsEmailAddresses) {
            newQueue.extendedData.notifications.smsEmailAddresses = newQueue?.extendedData.notifications.smsEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }
    }

    toExcelRow(): string[] {
        return [
            // Padding for unused columns
            '',
            '',
            '',
            '',

            // Name
            this.originalQueue.extension.data.name,
            this.newQueue?.extension.data.name ?? '',
            this.originalQueue.extension.data.name == this.newQueue?.extension.data.name ? 'TRUE' : 'FALSE',

            // Extension
            this.originalQueue.extension.data.extensionNumber,
            this.newQueue?.extension.data.extensionNumber ?? '',
            this.originalQueue.extension.data.extensionNumber == this.newQueue?.extension.data.extensionNumber ? 'TRUE' : 'FALSE',

            // Site
            this.originalQueue.extension.data.site?.name ?? '',
            this.newQueue?.extension.data.site?.name ?? '',
            this.originalQueue.extension.data.site?.name == this.newQueue?.extension.data.site?.name ? 'TRUE' : 'FALSE',

            // Email
            this.originalQueue.extension.data.contact?.email ?? '',
            this.newQueue?.extension.data.contact?.email ?? '',
            this.originalQueue.extension.data.contact?.email == this.newQueue?.extension.data.contact?.email ? 'TRUE' : 'FALSE',

            // Phone numbers
            this.originalQueue.extendedData?.directNumbers?.map((n) => n.phoneNumber).join('\n') ?? '',
            this.newQueue?.extendedData?.directNumbers?.map((n) => n.phoneNumber).join('\n') ?? '',
            this.originalQueue.extendedData?.directNumbers?.map((n) => n.phoneNumber).join('\n') == this.newQueue?.extendedData?.directNumbers?.map((n) => n.phoneNumber).join('\n') ? 'TRUE' : 'FALSE',

            // Queue manager
            this.originalQueue.extendedData?.managers?.sort().map((m) => m.extension.name).join('\n') ?? '',
            this.newQueue?.extendedData?.managers?.sort().map((m) => m.extension.name).join('\n') ?? '',
            this.originalQueue.extendedData?.managers?.sort().map((m) => m.extension.name).join('\n') == this.newQueue?.extendedData?.managers?.map((m) => m.extension.name).join('\n') ? 'TRUE' : 'FALSE',

            // Business hours
            this.originalQueue.prettyBusinessHours(),
            this.newQueue?.prettyBusinessHours() ?? '',
            this.originalQueue.prettyBusinessHours() == this.newQueue?.prettyBusinessHours() ? 'TRUE' : 'FALSE',

            // Regional settings
            this.originalQueue.extension.data.regionalSettings?.timezone.name ?? '',
            this.newQueue?.extension.data.regionalSettings?.timezone.name ?? '',
            this.originalQueue.extension.data.regionalSettings?.timezone.name == this.newQueue?.extension.data.regionalSettings?.timezone.name ? 'TRUE' : 'FALSE',

            // Regional format
            this.originalQueue.extension.data.regionalSettings?.formattingLocale.name ?? '',
            this.newQueue?.extension.data.regionalSettings?.formattingLocale.name ?? '',
            this.originalQueue.extension.data.regionalSettings?.formattingLocale.name == this.newQueue?.extension.data.regionalSettings?.formattingLocale.name ? 'TRUE' : 'FALSE',

            // User language
            this.originalQueue.extension.data.regionalSettings?.language.name ?? '',
            this.newQueue?.extension.data.regionalSettings?.language.name ?? '',
            this.originalQueue.extension.data.regionalSettings?.language.name == this.newQueue?.extension.data.regionalSettings?.language.name ? 'TRUE' : 'FALSE',

            // Time format
            this.originalQueue.extension.data.regionalSettings?.timeFormat ?? '',
            this.newQueue?.extension.data.regionalSettings?.timeFormat ?? '',
            this.originalQueue.extension.data.regionalSettings?.timeFormat == this.newQueue?.extension.data.regionalSettings?.timeFormat ? 'TRUE' : 'FALSE',

            // Greeting
            this.originalQueue.prettyGreeting(this.originalQueue.greeting('Introductory')),
            this.newQueue?.prettyGreeting(this.newQueue.greeting('Introductory')) ?? '',
            this.originalQueue.prettyGreeting(this.originalQueue.greeting('Introductory')) == this.newQueue?.prettyGreeting(this.newQueue.greeting('Introductory')) ? 'TRUE' : 'FALSE',

            // Audio while connecting
            this.originalQueue.prettyGreeting(this.originalQueue.greeting('ConnectingAudio')),
            this.newQueue?.prettyGreeting(this.newQueue.greeting('ConnectingAudio')) ?? '',
            this.originalQueue.prettyGreeting(this.originalQueue.greeting('ConnectingAudio')) == this.newQueue?.prettyGreeting(this.newQueue.greeting('ConnectingAudio')) ? 'TRUE' : 'FALSE',

            // Interrupt audio
            this.originalQueue.prettyInterruptPeriod(this.originalQueue.extendedData!.businessHoursCallHandling?.queue?.holdAudioInterruptionMode ?? '', this.originalQueue.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionPeriod ?? 0),
            this.newQueue?.prettyInterruptPeriod(this.newQueue.extendedData!.businessHoursCallHandling?.queue?.holdAudioInterruptionMode ?? '', this.newQueue.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionPeriod ?? 0) ?? '',
            this.originalQueue.prettyInterruptPeriod(this.originalQueue.extendedData!.businessHoursCallHandling?.queue?.holdAudioInterruptionMode ?? '', this.originalQueue.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionPeriod ?? 0) == this.newQueue?.prettyInterruptPeriod(this.newQueue.extendedData!.businessHoursCallHandling?.queue?.holdAudioInterruptionMode ?? '', this.newQueue.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionPeriod ?? 0) ? 'TRUE' : 'FALSE',

            // Interrupt prompt
            this.originalQueue.extendedData!.businessHoursCallHandling!.queue?.holdAudioInterruptionPeriod ? this.originalQueue.greeting('InterruptPrompt') : '',
            this.newQueue?.extendedData!.businessHoursCallHandling!.queue?.holdAudioInterruptionPeriod ? this.newQueue?.greeting('InterruptPrompt') ?? '' : '',
            this.originalQueue.greeting('InterruptPrompt') == this.newQueue?.greeting('InterruptPrompt') ? 'TRUE' : 'FALSE',

            // Hold music
            this.originalQueue.prettyGreeting(this.originalQueue.greeting('HoldMusic')),
            this.newQueue?.prettyGreeting(this.newQueue.greeting('HoldMusic')) ?? '',
            this.originalQueue.prettyGreeting(this.originalQueue.greeting('HoldMusic')) == this.newQueue?.prettyGreeting(this.newQueue.greeting('HoldMusic')) ? 'TRUE' : 'FALSE',

            // Ring type
            this.originalQueue.prettyRingType(this.originalQueue.extendedData?.businessHoursCallHandling?.queue?.transferMode ?? ''),
            this.newQueue?.prettyRingType(this.newQueue.extendedData?.businessHoursCallHandling?.queue?.transferMode ?? '') ?? '',
            this.originalQueue.prettyRingType(this.originalQueue.extendedData?.businessHoursCallHandling?.queue?.transferMode ?? '') == this.newQueue?.prettyRingType(this.newQueue.extendedData?.businessHoursCallHandling?.queue?.transferMode ?? '') ? 'TRUE' : 'FALSE',

            // Members
            this.originalQueue.extendedData?.members?.map((member) => member.extensionNumber).join(', ') ?? '',
            this.newQueue?.extendedData?.members?.map((member) => member.extensionNumber).join(', ') ?? '',
            this.originalQueue.extendedData?.members?.map((member) => member.extensionNumber).join(', ') == this.newQueue?.extendedData?.members?.map((member) => member.extensionNumber).join(', ') ? 'TRUE' : 'FALSE',

            // Queue status
            this.originalQueue.prettyQueueStatus(),
            this.newQueue?.prettyQueueStatus() ?? '',
            this.originalQueue.prettyQueueStatus() == this.newQueue?.prettyQueueStatus() ? 'TRUE' : 'FALSE',

            // User ring time
            this.originalQueue.extendedData?.businessHoursCallHandling?.queue?.transferMode === 'Simultaneous' ? 'N/A (simultaneous)' : this.originalQueue.prettyTime(this.originalQueue.extendedData?.businessHoursCallHandling?.queue?.agentTimeout ?? 0),
            this.newQueue?.extendedData?.businessHoursCallHandling?.queue?.transferMode === 'Simultaneous' ? 'N/A (simultaneous)' : this.newQueue?.prettyTime(this.newQueue.extendedData?.businessHoursCallHandling?.queue?.agentTimeout ?? 0) ?? '',
            this.originalQueue.extendedData?.businessHoursCallHandling?.queue?.transferMode === 'Simultaneous' ? 'TRUE' : this.originalQueue.prettyTime(this.originalQueue.extendedData?.businessHoursCallHandling?.queue?.agentTimeout ?? 0) == this.newQueue?.prettyTime(this.newQueue.extendedData?.businessHoursCallHandling?.queue?.agentTimeout ?? 0) ? 'TRUE' : 'FALSE',

            // Total ring time
            this.originalQueue.prettyTime(this.originalQueue.extendedData?.businessHoursCallHandling?.queue?.holdTime ?? 0),
            this.newQueue?.prettyTime(this.newQueue.extendedData?.businessHoursCallHandling?.queue?.holdTime ?? 0) ?? '',
            this.originalQueue.prettyTime(this.originalQueue.extendedData?.businessHoursCallHandling?.queue?.holdTime ?? 0) == this.newQueue?.prettyTime(this.newQueue.extendedData?.businessHoursCallHandling?.queue?.holdTime ?? 0) ? 'TRUE' : 'FALSE',

            // Wrap up time
            this.originalQueue.prettyTime(this.originalQueue.extendedData?.businessHoursCallHandling?.queue?.wrapUpTime ?? 0),
            this.newQueue?.prettyTime(this.newQueue.extendedData?.businessHoursCallHandling?.queue?.wrapUpTime ?? 0) ?? '',
            this.originalQueue.prettyTime(this.originalQueue.extendedData?.businessHoursCallHandling?.queue?.wrapUpTime ?? 0) == this.newQueue?.prettyTime(this.newQueue.extendedData?.businessHoursCallHandling?.queue?.wrapUpTime ?? 0) ? 'TRUE' : 'FALSE',

            // Callers in queue
            `${this.originalQueue.extendedData?.businessHoursCallHandling?.queue?.maxCallers ?? ''}`,
            `${this.newQueue?.extendedData?.businessHoursCallHandling?.queue?.maxCallers ?? ''}`,
            this.originalQueue.extendedData?.businessHoursCallHandling?.queue?.maxCallers == this.newQueue?.extendedData?.businessHoursCallHandling?.queue?.maxCallers ? 'TRUE' : 'FALSE',

            // Max callers action
            this.originalQueue.prettyMaxCallersAction(),
            this.newQueue?.prettyMaxCallersAction() ?? '',
            this.originalQueue.prettyMaxCallersAction() == this.newQueue?.prettyMaxCallersAction() ? 'TRUE' : 'FALSE',

            // Max callers destination
            this.originalQueue.prettyMaxCallersDestination(),
            this.newQueue?.prettyMaxCallersDestination() ?? '',
            this.originalQueue.prettyMaxCallersDestination() == this.newQueue?.prettyMaxCallersDestination() ? 'TRUE' : 'FALSE',

            // Max wait time action
            this.originalQueue.prettyWaitTimeAction(),
            this.newQueue?.prettyWaitTimeAction() ?? '',
            this.originalQueue.prettyWaitTimeAction() == this.newQueue?.prettyWaitTimeAction() ? 'TRUE' : 'FALSE',

            // Max wait time destination
            this.originalQueue.prettyWaitTimeDestination(),
            this.newQueue?.prettyWaitTimeDestination() ?? '',
            this.originalQueue.prettyWaitTimeDestination() == this.newQueue?.prettyWaitTimeDestination() ? 'TRUE' : 'FALSE',

            // Member status
            this.originalQueue.prettyMemberStatus(),
            this.newQueue?.prettyMemberStatus() ?? '',
            this.originalQueue.prettyMemberStatus() == this.newQueue?.prettyMemberStatus() ? 'TRUE' : 'FALSE',

            // Queue status ???
            this.originalQueue.prettyQueueStatus(),
            this.newQueue?.prettyQueueStatus() ?? '',
            this.originalQueue.prettyQueueStatus() == this.newQueue?.prettyQueueStatus() ? 'TRUE' : 'FALSE',

            // Display settings
            '',
            '',
            'TRUE',

            // Custom rules
            this.originalQueue.prettyCustomRules(),
            this.newQueue?.prettyCustomRules() ?? '',
            this.originalQueue.prettyCustomRules() == this.newQueue?.prettyCustomRules() ? 'TRUE' : 'FALSE',

            // Pickup members
            this.originalQueue.prettyPickupMembers(),
            this.newQueue?.prettyPickupMembers() ?? '',
            this.originalQueue.prettyPickupMembers() == this.newQueue?.prettyPickupMembers() ? 'TRUE' : 'FALSE',

            // Alert timer
            `${this.originalQueue.extendedData?.otherSettings?.alertTimer ? this.originalQueue.extendedData?.otherSettings?.alertTimer : ''}`,
            `${this.newQueue?.extendedData?.otherSettings?.alertTimer ? this.newQueue?.extendedData?.otherSettings?.alertTimer : ''}`,
            this.originalQueue.extendedData?.otherSettings?.alertTimer == this.newQueue?.extendedData?.otherSettings?.alertTimer ? 'TRUE' : 'FALSE',

            // After hours action
            this.originalQueue.prettyAfterHoursAction(),
            this.newQueue?.prettyAfterHoursAction() ?? '',
            this.originalQueue.prettyAfterHoursAction() == this.newQueue?.prettyAfterHoursAction() ? 'TRUE' : 'FALSE',

            // After hours destination
            this.originalQueue.prettyAfterHoursDestination(),
            this.newQueue?.prettyAfterHoursDestination() ?? '',
            this.originalQueue.prettyAfterHoursDestination() == this.newQueue?.prettyAfterHoursDestination() ? 'TRUE' : 'FALSE',

            // Voicemail greeting
            this.originalQueue.greeting('Voicemail'),
            this.newQueue?.greeting('Voicemail') ?? '',
            this.originalQueue.greeting('Voicemail') == this.newQueue?.greeting('Voicemail') ? 'TRUE' : 'FALSE',

            // Voiocemail recipients
            this.originalQueue.extendedData?.businessHoursCallHandling?.voicemail?.recipient?.displayName ?? '',
            this.newQueue?.extendedData?.businessHoursCallHandling?.voicemail?.recipient?.displayName ?? '',
            this.originalQueue.extendedData?.businessHoursCallHandling?.voicemail?.recipient?.displayName == this.newQueue?.extendedData?.businessHoursCallHandling?.voicemail?.recipient?.displayName ? 'TRUE' : 'FALSE',

            // After hours greeting
            this.originalQueue.afterHoursGreeting('Voicemail'),
            this.newQueue?.afterHoursGreeting('Voicemail') ?? '',
            this.originalQueue.afterHoursGreeting('Voicemail') == this.newQueue?.afterHoursGreeting('Voicemail') ? 'TRUE' : 'FALSE',

            // After hours voicemail repcipients
            this.originalQueue.extendedData?.afterHoursCallHandling?.voicemail?.recipient?.displayName ?? '',
            this.newQueue?.extendedData?.afterHoursCallHandling?.voicemail?.recipient?.displayName ?? '',
            this.originalQueue.extendedData?.afterHoursCallHandling?.voicemail?.recipient?.displayName == this.newQueue?.extendedData?.afterHoursCallHandling?.voicemail?.recipient?.displayName ? 'TRUE' : 'FALSE',

            // Voicemail notification settings
            this.originalQueue.prettyVoicemailNotificationSettings(),
            this.newQueue?.prettyVoicemailNotificationSettings() ?? '',
            this.originalQueue.prettyVoicemailNotificationSettings() == this.newQueue?.prettyVoicemailNotificationSettings() ? 'TRUE' : 'FALSE',

            // Voicemail notification email
            this.originalQueue.extendedData?.notifications?.emailAddresses?.sort().join('\n') ?? '',
            this.newQueue?.extendedData?.notifications?.emailAddresses?.sort().join('\n') ?? '',
            this.originalQueue.extendedData?.notifications?.emailAddresses?.sort().join('\n') == this.newQueue?.extendedData?.notifications?.voicemails.advancedEmailAddresses?.join('\n') ? 'TRUE' : 'FALSE',

            // Voicemail messages ???
            '',
            '',
            'TRUE',

            // Inbound fax
            this.originalQueue.prettyFaxNotificationSettings(),
            this.newQueue?.prettyFaxNotificationSettings() ?? '',
            this.originalQueue.prettyFaxNotificationSettings() == this.newQueue?.prettyFaxNotificationSettings() ? 'TRUE' : 'FALSE',

            // Missed calls
            this.originalQueue.extendedData!.notifications?.missedCalls.notifyByEmail ? 'Notify' : 'Do not notify',
            this.newQueue?.extendedData!.notifications?.missedCalls.notifyByEmail ? 'Notify' : 'Do not notify',
            this.originalQueue.extendedData!.notifications?.missedCalls.notifyByEmail == this.newQueue?.extendedData!.notifications?.missedCalls.notifyByEmail ? 'TRUE' : 'FALSE',

            // Inbound text
            this.originalQueue.extendedData!.notifications?.inboundTexts.notifyByEmail ? 'Notify' : 'Do not notify',
            this.newQueue?.extendedData!.notifications?.inboundTexts.notifyByEmail ? 'Notify' : 'Do not notify',
            this.originalQueue.extendedData!.notifications?.inboundTexts.notifyByEmail == this.newQueue?.extendedData!.notifications?.inboundTexts.notifyByEmail ? 'TRUE' : 'FALSE',

            // Cost center
            this.originalQueue.extension.data.costCenter?.name ?? '',
            this.newQueue?.extension.data.costCenter?.name ?? '',
            this.originalQueue.extension.data.costCenter?.name == this.newQueue?.extension.data.costCenter?.name ? 'TRUE' : 'FALSE',

            // Overflow queue
            this.originalQueue.prettyOverflowSettings(),
            this.newQueue?.prettyOverflowSettings() ?? '',
            this.originalQueue.prettyOverflowSettings() == this.newQueue?.prettyOverflowSettings() ? 'TRUE' : 'FALSE',
        ]
    }
}