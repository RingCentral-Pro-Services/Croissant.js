import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { UserDataRow } from "../../User Data Download/models/UserDataRow";

export class AuditUserRowPair implements ExcelFormattable {
    constructor(private originalUser: UserDataRow, private newUser: UserDataRow | undefined) {
        // Remove leading N from serial number
        if (newUser?.device && newUser.device.serial && newUser.device.serial.startsWith('N')) {
            newUser.device.serial = newUser.device.serial.substring(1);
        }

        // Remove .ps.ringcentral.com from email address
        if (newUser?.extension.data.contact?.email) {
            newUser.extension.data.contact.email = newUser.extension.data.contact.email.replace('.ps.ringcentral.com', '');
        }

        // Remove .ps.ringcentral.com from notification email addresses
        if (newUser?.notifications?.emailAddresses) {
            newUser.notifications.emailAddresses = newUser.notifications.emailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        // Remove .ps.ringcentral.com from advanced email addresses
        if (newUser?.notifications?.voicemails?.advancedEmailAddresses) {
            newUser.notifications.voicemails.advancedEmailAddresses = newUser.notifications.voicemails.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newUser?.notifications?.inboundFaxes?.advancedEmailAddresses) {
            newUser.notifications.inboundFaxes.advancedEmailAddresses = newUser.notifications.inboundFaxes.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newUser?.notifications?.outboundFaxes?.advancedEmailAddresses) {
            newUser.notifications.outboundFaxes.advancedEmailAddresses = newUser.notifications.outboundFaxes.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newUser?.notifications?.missedCalls?.advancedEmailAddresses) {
            newUser.notifications.missedCalls.advancedEmailAddresses = newUser.notifications.missedCalls.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newUser?.notifications?.inboundTexts?.advancedEmailAddresses) {
            newUser.notifications.inboundTexts.advancedEmailAddresses = newUser.notifications.inboundTexts.advancedEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }

        if (newUser?.notifications?.smsEmailAddresses) {
            newUser.notifications.smsEmailAddresses = newUser.notifications.smsEmailAddresses.map((address) => address.replace('.ps.ringcentral.com', ''));
        }
    }

    toExcelRow(): string[] {
        return [
            // Phone number
            this.originalUser.directNumber ?? this.originalUser.device?.phoneLines[0]?.phoneInfo?.phoneNumber ?? '',

            // temp number
            this.newUser?.directNumber ?? this.newUser?.device?.phoneLines[0]?.phoneInfo?.phoneNumber ?? '',

            // Extension
            this.originalUser.extension.data.extensionNumber,
            this.newUser?.extension.data.extensionNumber ?? '',

            // Extension Type
            this.originalUser.type,
            this.newUser?.type ?? '',
            this.originalUser.type == this.newUser?.type ? 'TRUE' : 'FALSE',

            // First name
            this.originalUser.extension.data.contact?.firstName ?? '',
            this.newUser?.extension.data.contact?.firstName ?? '',
            this.originalUser.extension.data.contact?.firstName == this.newUser?.extension.data.contact?.firstName ? 'TRUE' : 'FALSE',

            // Last name
            this.originalUser.extension.data.contact?.lastName ?? '',
            this.newUser?.extension.data.contact?.lastName ?? '',
            this.originalUser.extension.data.contact?.lastName == this.newUser?.extension.data.contact?.lastName ? 'TRUE' : 'FALSE',

            // Email
            this.originalUser.extension.data.contact?.email ?? '',
            this.newUser?.extension.data.contact?.email ?? '',
            this.originalUser.extension.data.contact?.email == this.newUser?.extension.data.contact?.email ? 'TRUE' : 'FALSE',

            // Department
            this.originalUser.extension.data.contact?.department ?? '',
            this.newUser?.extension.data.contact?.department ?? '',
            this.originalUser.extension.data.contact?.department == this.newUser?.extension.data.contact?.department ? 'TRUE' : 'FALSE',

            // Job title
            this.originalUser.extension.data.contact?.jobTitle ?? '',
            this.newUser?.extension.data.contact?.jobTitle ?? '',
            this.originalUser.extension.data.contact?.jobTitle == this.newUser?.extension.data.contact?.jobTitle ? 'TRUE' : 'FALSE',

            // User groups
            this.originalUser.userGroups ?? '',
            this.newUser?.userGroups ?? '',
            this.originalUser.userGroups == this.newUser?.userGroups ? 'TRUE' : 'FALSE',

            // Contact phone
            this.originalUser.extension.data.contact.businessPhone ?? '',
            this.newUser?.extension.data.contact.businessPhone ?? '',
            this.originalUser.extension.data.contact.businessPhone == this.newUser?.extension.data.contact.businessPhone ? 'TRUE' : 'FALSE',

            // Mobile phone
            this.originalUser.extension.data.contact.mobilePhone ?? '',
            this.newUser?.extension.data.contact.mobilePhone ?? '',
            this.originalUser.extension.data.contact.mobilePhone == this.newUser?.extension.data.contact.mobilePhone ? 'TRUE' : 'FALSE',

            // Timezone
            this.originalUser.extension.data.regionalSettings?.timezone?.name ?? '',
            this.newUser?.extension.data.regionalSettings?.timezone?.name ?? '',
            this.originalUser.extension.data.regionalSettings?.timezone?.name == this.newUser?.extension.data.regionalSettings?.timezone?.name ? 'TRUE' : 'FALSE',

            // Regional format
            this.originalUser.extension.data.regionalSettings?.formattingLocale?.name ?? '',
            this.newUser?.extension.data.regionalSettings?.formattingLocale?.name ?? '',
            this.originalUser.extension.data.regionalSettings?.formattingLocale?.name == this.newUser?.extension.data.regionalSettings?.formattingLocale?.name ? 'TRUE' : 'FALSE',

            // Language
            this.originalUser.extension.data.regionalSettings?.language?.name ?? '',
            this.newUser?.extension.data.regionalSettings?.language?.name ?? '',
            this.originalUser.extension.data.regionalSettings?.language?.name == this.newUser?.extension.data.regionalSettings?.language?.name ? 'TRUE' : 'FALSE',

            // Time format
            this.originalUser.extension.data.regionalSettings?.timeFormat ?? '',
            this.newUser?.extension.data.regionalSettings?.timeFormat ?? '',
            this.originalUser.extension.data.regionalSettings?.timeFormat == this.newUser?.extension.data.regionalSettings?.timeFormat ? 'TRUE' : 'FALSE',

            // Business hours
            this.originalUser.prettyBusinessHours(),
            this.newUser?.prettyBusinessHours() ?? '',
            this.originalUser.prettyBusinessHours() == this.newUser?.prettyBusinessHours() ? 'TRUE' : 'FALSE',

            // Role
            this.originalUser.roles?.at(0)?.displayName ?? '',
            this.newUser?.roles?.at(0)?.displayName ?? '',
            this.originalUser.roles?.at(0)?.displayName == this.newUser?.roles?.at(0)?.displayName ? 'TRUE' : 'FALSE',

            // Hidden status
            this.originalUser.extension.data.hidden ? 'No' : 'Yes',
            this.newUser?.extension.data.hidden ? 'No' : 'Yes',
            this.originalUser.extension.data.hidden == this.newUser?.extension.data.hidden ? 'TRUE' : 'FALSE',

            // Site
            this.originalUser.extension.data.site?.name ?? '',
            this.newUser?.extension.data.site?.name ?? '',
            this.originalUser.extension.data.site?.name == this.newUser?.extension.data.site?.name ? 'TRUE' : 'FALSE',

            // Device type
            this.originalUser.device?.type ?? '',
            this.newUser?.device?.type ?? '',
            this.originalUser.device?.type == this.newUser?.device?.type ? 'TRUE' : 'FALSE',

            // Device serial
            this.originalUser.device?.serial ?? '',
            this.newUser?.device?.serial ?? '',
            this.originalUser.device?.serial == this.newUser?.device?.serial ? 'TRUE' : 'FALSE',

            // Device name
            this.originalUser.device?.name ?? '',
            this.newUser?.device?.name ?? '',
            this.originalUser.device?.name == this.newUser?.device?.name ? 'TRUE' : 'FALSE',

            // Default area code
            '',
            '',
            'TRUE',

            // E911 customer name
            this.originalUser.device?.emergencyServiceAddress?.customerName ?? '',
            this.newUser?.device?.emergencyServiceAddress?.customerName ?? '',
            this.originalUser.device?.emergencyServiceAddress?.customerName == this.newUser?.device?.emergencyServiceAddress?.customerName ? 'TRUE' : 'FALSE',

            // E911 street
            this.originalUser.device?.emergencyServiceAddress?.street ?? '',
            this.newUser?.device?.emergencyServiceAddress?.street ?? '',
            this.originalUser.device?.emergencyServiceAddress?.street == this.newUser?.device?.emergencyServiceAddress?.street ? 'TRUE' : 'FALSE',

            // E911 street 2
            this.originalUser.device?.emergencyServiceAddress?.street2 ?? '',
            this.newUser?.device?.emergencyServiceAddress?.street2 ?? '',
            this.originalUser.device?.emergencyServiceAddress?.street2 == this.newUser?.device?.emergencyServiceAddress?.street2 ? 'TRUE' : 'FALSE',

            // E911 city
            this.originalUser.device?.emergencyServiceAddress?.city ?? '',
            this.newUser?.device?.emergencyServiceAddress?.city ?? '',
            this.originalUser.device?.emergencyServiceAddress?.city == this.newUser?.device?.emergencyServiceAddress?.city ? 'TRUE' : 'FALSE',

            // E911 state
            this.originalUser.device?.emergencyServiceAddress?.state ?? '',
            this.newUser?.device?.emergencyServiceAddress?.state ?? '',
            this.originalUser.device?.emergencyServiceAddress?.state == this.newUser?.device?.emergencyServiceAddress?.state ? 'TRUE' : 'FALSE',

            // E911 zip
            this.originalUser.device?.emergencyServiceAddress?.zip ?? '',
            this.newUser?.device?.emergencyServiceAddress?.zip ?? '',
            this.originalUser.device?.emergencyServiceAddress?.zip == this.newUser?.device?.emergencyServiceAddress?.zip ? 'TRUE' : 'FALSE',

            // E911 country
            this.originalUser.device?.emergencyServiceAddress?.country ?? '',
            this.newUser?.device?.emergencyServiceAddress?.country ?? '',
            this.originalUser.device?.emergencyServiceAddress?.country == this.newUser?.device?.emergencyServiceAddress?.country ? 'TRUE' : 'FALSE',

            // Personal ERLs
            this.originalUser.prettyPERLs(),
            this.newUser?.prettyPERLs() ?? '',
            this.originalUser.prettyPERLs() == this.newUser?.prettyPERLs() ? 'TRUE' : 'FALSE',

            // Device locked status
            '',
            '',
            'TRUE',

            // WMI status
            '',
            '',
            'TRUE',

            // Presence lines
            this.originalUser.prettyPresenseLines(),
            this.newUser?.prettyPresenseLines() ?? '',
            this.originalUser.prettyPresenseLines() == this.newUser?.prettyPresenseLines() ? 'TRUE' : 'FALSE',

            // Ring my phone when an extension I monitor rings
            this.originalUser.presenseSettings?.ringOnMonitoredCall ? 'Yes' : 'No',
            this.newUser?.presenseSettings?.ringOnMonitoredCall ? 'Yes' : 'No',
            this.originalUser.presenseSettings?.ringOnMonitoredCall == this.newUser?.presenseSettings?.ringOnMonitoredCall ? 'TRUE' : 'FALSE',

            // Pickup monitored on hold
            this.originalUser.presenseSettings?.pickUpCallsOnHold ? 'Yes' : 'No',
            this.newUser?.presenseSettings?.pickUpCallsOnHold ? 'Yes' : 'No',
            this.originalUser.presenseSettings?.pickUpCallsOnHold == this.newUser?.presenseSettings?.pickUpCallsOnHold ? 'TRUE' : 'FALSE',

            // Allow other users to see my presence status
            this.originalUser.presenseSettings?.allowSeeMyPresence ? 'Yes' : 'No',
            this.newUser?.presenseSettings?.allowSeeMyPresence ? 'Yes' : 'No',
            this.originalUser.presenseSettings?.allowSeeMyPresence == this.newUser?.presenseSettings?.allowSeeMyPresence ? 'TRUE' : 'FALSE',

            // Allowed users
            this.originalUser.presenseAllowedUsers?.sort().map(u => u.extensionName).join('\n') ?? '',
            this.newUser?.presenseAllowedUsers?.sort().map(u => u.extensionName).join('\n') ?? '',
            this.originalUser.presenseAllowedUsers?.sort().map(u => u.extensionName).join('\n') == this.newUser?.presenseAllowedUsers?.sort().map(u => u.extensionName).join('\n') ? 'TRUE' : 'FALSE',

            // Intercom status
            this.originalUser.intercomStatus?.enabled ? 'Yes' : 'No',
            this.newUser?.intercomStatus?.enabled ? 'Yes' : 'No',
            this.originalUser.intercomStatus?.enabled == this.newUser?.intercomStatus?.enabled ? 'TRUE' : 'FALSE',

            // Intercom allowed users
            this.originalUser.intercomUsers?.sort().map(u => u.name).join('\n') ?? '',
            this.newUser?.intercomUsers?.sort().map(u => u.name).join('\n') ?? '',
            this.originalUser.intercomUsers?.sort().map(u => u.name).join('\n') == this.newUser?.intercomUsers?.sort().map(u => u.name).join('\n') ? 'TRUE' : 'FALSE',

            // Delegates
            this.originalUser.delegates?.map((delegate) => delegate.extension.name).sort().join('\n') ?? '',
            this.newUser?.delegates?.map((delegate) => delegate.extension.name).sort().join('\n') ?? '',
            this.originalUser.delegates?.map((delegate) => delegate.extension.name).sort().join('\n') == this.newUser?.delegates?.map((delegate) => delegate.extension.name).sort().join('\n') ? 'TRUE' : 'FALSE',

            // PMI
            this.originalUser.defaultBridge?.pins.web ?? '',
            this.newUser?.defaultBridge?.pins.web ?? '',
            this.originalUser.defaultBridge?.pins.web == this.newUser?.defaultBridge?.pins.web ? 'TRUE' : 'FALSE',

            // Greeting
            this.originalUser.greeting('Introductory'),
            this.newUser?.greeting('Introductory') ?? '',
            this.originalUser.greeting('Introductory') == this.newUser?.greeting('Introductory') ? 'TRUE' : 'FALSE',

            // Call screening
            this.originalUser.businessHoursCallHandling?.screening ? 'Yes' : 'No',
            this.newUser?.businessHoursCallHandling?.screening ? 'Yes' : 'No',
            this.originalUser.businessHoursCallHandling?.screening == this.newUser?.businessHoursCallHandling?.screening ? 'TRUE' : 'FALSE',

            // Connecting message
            this.originalUser.greeting('ConnectingMessage'),
            this.newUser?.greeting('ConnectingMessage') ?? '',
            this.originalUser.greeting('ConnectingMessage') == this.newUser?.greeting('ConnectingMessage') ? 'TRUE' : 'FALSE',

            // Audio while connecting
            this.originalUser.greeting('ConnectingAudio'),
            this.newUser?.greeting('ConnectingAudio') ?? '',
            this.originalUser.greeting('ConnectingAudio') == this.newUser?.greeting('ConnectingAudio') ? 'TRUE' : 'FALSE',

            // Hold music
            this.originalUser.greeting('HoldMusic'),
            this.newUser?.greeting('HoldMusic') ?? '',
            this.originalUser.greeting('HoldMusic') == this.newUser?.greeting('HoldMusic') ? 'TRUE' : 'FALSE',

            // After hours greeting
            this.originalUser.afterHoursGreeting('Introductory'),
            this.newUser?.afterHoursGreeting('Introductory') ?? '',
            this.originalUser.afterHoursGreeting('Introductory') == this.newUser?.afterHoursGreeting('Introductory') ? 'TRUE' : 'FALSE',

            // After hours call screening
            this.originalUser.afterHoursCallHandling?.screening ? 'Yes' : 'No',
            this.newUser?.afterHoursCallHandling?.screening ? 'Yes' : 'No',
            this.originalUser.afterHoursCallHandling?.screening == this.newUser?.afterHoursCallHandling?.screening ? 'TRUE' : 'FALSE',

            // After hours connecting message
            this.originalUser.afterHoursGreeting('ConnectingMessage'),
            this.newUser?.afterHoursGreeting('ConnectingMessage') ?? '',
            this.originalUser.afterHoursGreeting('ConnectingMessage') == this.newUser?.afterHoursGreeting('ConnectingMessage') ? 'TRUE' : 'FALSE',

            // After hours connecting audio
            this.originalUser.afterHoursGreeting('ConnectingAudio'),
            this.newUser?.afterHoursGreeting('ConnectingAudio') ?? '',
            this.originalUser.afterHoursGreeting('ConnectingAudio') == this.newUser?.afterHoursGreeting('ConnectingAudio') ? 'TRUE' : 'FALSE',

            // After hours hold music
            this.originalUser.afterHoursGreeting('HoldMusic'),
            this.newUser?.afterHoursGreeting('HoldMusic') ?? '',
            this.originalUser.afterHoursGreeting('HoldMusic') == this.newUser?.afterHoursGreeting('HoldMusic') ? 'TRUE' : 'FALSE',

            // Bock option
            this.originalUser.blockedCallSettings?.mode ?? '',
            this.newUser?.blockedCallSettings?.mode ?? '',
            this.originalUser.blockedCallSettings?.mode == this.newUser?.blockedCallSettings?.mode ? 'TRUE' : 'FALSE',

            // Blocked numbers
            this.originalUser.blockedPhoneNumbers?.map((n) => n.phoneNumber).sort().join('\n') ?? '',
            this.newUser?.blockedPhoneNumbers?.map((n) => n.phoneNumber).sort().join('\n') ?? '',
            this.originalUser.blockedPhoneNumbers?.map((n) => n.phoneNumber).sort().join('\n') == this.newUser?.blockedPhoneNumbers?.map((n) => n.phoneNumber).sort().join('\n') ? 'TRUE' : 'FALSE',

            // Blocked calls with no caller ID
            this.originalUser.blockedCallSettings?.noCallerId ?? '',
            this.newUser?.blockedCallSettings?.noCallerId ?? '',
            this.originalUser.blockedCallSettings?.noCallerId == this.newUser?.blockedCallSettings?.noCallerId ? 'TRUE' : 'FALSE',

            // Blocked calls from payphones
            this.originalUser.blockedCallSettings?.payPhones ?? '',
            this.newUser?.blockedCallSettings?.payPhones ?? '',
            this.originalUser.blockedCallSettings?.payPhones == this.newUser?.blockedCallSettings?.payPhones ? 'TRUE' : 'FALSE',

            // Forward all calls
            this.originalUser.prettyForwardAllCalls(),
            this.newUser?.prettyForwardAllCalls() ?? '',
            this.originalUser.prettyForwardAllCalls() == this.newUser?.prettyForwardAllCalls() ? 'TRUE' : 'FALSE',

            // Ring type
            this.originalUser.businessHoursCallHandling?.forwarding?.ringingMode ?? '',
            this.newUser?.businessHoursCallHandling?.forwarding?.ringingMode ?? '',
            this.originalUser.businessHoursCallHandling?.forwarding?.ringingMode == this.newUser?.businessHoursCallHandling?.forwarding?.ringingMode ? 'TRUE' : 'FALSE',

            // Softphone ring time
            this.originalUser.businessHoursCallHandling?.forwarding?.softPhonesAlwaysRing ? 'Always Ring' : this.originalUser.prettyRingTime(this.originalUser.businessHoursCallHandling?.forwarding?.softPhonesRingCount),
            this.newUser?.businessHoursCallHandling?.forwarding?.softPhonesAlwaysRing ? 'Always Ring' : this.newUser?.prettyRingTime(this.newUser?.businessHoursCallHandling?.forwarding?.softPhonesRingCount) ?? '',
            this.originalUser.businessHoursCallHandling?.forwarding?.softPhonesAlwaysRing == this.newUser?.businessHoursCallHandling?.forwarding?.softPhonesAlwaysRing ? 'TRUE' : 'FALSE',

            // Device ring time
            this.originalUser.prettyDeviceRingTime(),
            this.newUser?.prettyDeviceRingTime() ?? '',
            this.originalUser.prettyDeviceRingTime() == this.newUser?.prettyDeviceRingTime() ? 'TRUE' : 'FALSE',

            // Missed calls
            this.originalUser.businessHoursCallHandling?.missedCall?.actionType ?? '',
            this.newUser?.businessHoursCallHandling?.missedCall?.actionType ?? '',
            this.originalUser.businessHoursCallHandling?.missedCall?.actionType == this.newUser?.businessHoursCallHandling?.missedCall?.actionType ? 'TRUE' : 'FALSE',

            // Voicemail greeting
            this.originalUser.greeting('Voicemail'),
            this.newUser?.greeting('Voicemail') ?? '',
            this.originalUser.greeting('Voicemail') == this.newUser?.greeting('Voicemail') ? 'TRUE' : 'FALSE',

            // Voicemail recipient
            this.originalUser.businessHoursCallHandling?.voicemail?.recipient.displayName ?? '',
            this.newUser?.businessHoursCallHandling?.voicemail?.recipient.displayName ?? '',
            this.originalUser.businessHoursCallHandling?.voicemail?.recipient.displayName == this.newUser?.businessHoursCallHandling?.voicemail?.recipient.displayName ? 'TRUE' : 'FALSE',

            // After hours ring type
            this.originalUser.afterHoursCallHandling?.callHandlingAction === 'ForwardCalls' ? this.originalUser.afterHoursCallHandling?.forwarding?.ringingMode ?? '' : '',
            this.newUser?.afterHoursCallHandling?.callHandlingAction === 'ForwardCalls' ? this.newUser?.afterHoursCallHandling?.forwarding?.ringingMode ?? '' : '',
            this.originalUser.afterHoursCallHandling?.callHandlingAction === 'ForwardCalls' ? this.originalUser.afterHoursCallHandling?.forwarding?.ringingMode == this.newUser?.afterHoursCallHandling?.forwarding?.ringingMode ? 'TRUE' : 'FALSE' : '',

            // After hours softphone ring time
            this.originalUser.afterHoursCallHandling?.callHandlingAction === 'ForwardCalls' ? this.originalUser.prettyRingTime(this.originalUser.afterHoursCallHandling?.forwarding?.softPhonesRingCount) : '',
            this.newUser?.afterHoursCallHandling?.callHandlingAction === 'ForwardCalls' ? this.newUser?.prettyRingTime(this.newUser.afterHoursCallHandling?.forwarding?.softPhonesRingCount) : '',
            this.originalUser.afterHoursCallHandling?.callHandlingAction === 'ForwardCalls' ? this.originalUser.prettyRingTime(this.originalUser.afterHoursCallHandling?.forwarding?.softPhonesRingCount) == this.newUser?.prettyRingTime(this.newUser.afterHoursCallHandling?.forwarding?.softPhonesRingCount) ? 'TRUE' : 'FALSE' : '',

            // After hours device ring time
            this.originalUser.prettyAfterHoursDeviceRingTime(),
            this.newUser?.prettyAfterHoursDeviceRingTime() ?? '',
            this.originalUser.prettyAfterHoursDeviceRingTime() == this.newUser?.prettyAfterHoursDeviceRingTime() ? 'TRUE' : 'FALSE',

            // After hours Missed calls
            this.originalUser.afterHoursCallHandling?.missedCall?.actionType ?? '',
            this.newUser?.afterHoursCallHandling?.missedCall?.actionType ?? '',
            this.originalUser.afterHoursCallHandling?.missedCall?.actionType == this.newUser?.afterHoursCallHandling?.missedCall?.actionType ? 'TRUE' : 'FALSE',

            // After hours voicemail greeting
            this.originalUser.afterHoursGreeting('Voicemail'),
            this.newUser?.afterHoursGreeting('Voicemail') ?? '',
            this.originalUser.afterHoursGreeting('Voicemail') == this.newUser?.afterHoursGreeting('Voicemail') ? 'TRUE' : 'FALSE',

            // After hours voicemail
            this.originalUser.afterHoursCallHandling?.voicemail?.recipient.displayName ?? '',
            this.newUser?.afterHoursCallHandling?.voicemail?.recipient.displayName ?? '',
            this.originalUser.afterHoursCallHandling?.voicemail?.recipient.displayName == this.newUser?.afterHoursCallHandling?.voicemail?.recipient.displayName ? 'TRUE' : 'FALSE',

            // Custom rules
            this.originalUser.prettyCustomRules(),
            this.newUser?.prettyCustomRules() ?? '',
            this.originalUser.prettyCustomRules() == this.newUser?.prettyCustomRules() ? 'TRUE' : 'FALSE',

            // Incomming call information
            this.originalUser.prettyIncommingCallInfo(),
            this.newUser?.prettyIncommingCallInfo() ?? '',
            this.originalUser.prettyIncommingCallInfo() == this.newUser?.prettyIncommingCallInfo() ? 'TRUE' : 'FALSE',

            // Voicemail to text
            this.originalUser.notifications?.voicemails.includeTranscription ? 'Yes' : 'No',
            this.newUser?.notifications?.voicemails.includeTranscription ? 'Yes' : 'No',
            this.originalUser.notifications?.voicemails.includeTranscription == this.newUser?.notifications?.voicemails.includeTranscription ? 'TRUE' : 'FALSE',

            // Notification email
            this.originalUser.notifications?.emailAddresses.sort().join('\n') ?? '',
            this.newUser?.notifications?.emailAddresses.sort().join('\n') ?? '',
            this.originalUser.notifications?.emailAddresses.sort().join('\n') == this.newUser?.notifications?.emailAddresses.sort().join('\n') ? 'TRUE' : 'FALSE',

            // Advanced voicemail email
            this.originalUser.notifications?.voicemails?.advancedEmailAddresses?.sort().join('\n') ?? '',
            this.newUser?.notifications?.voicemails?.advancedEmailAddresses?.sort().join('\n') ?? '',
            this.originalUser.notifications?.voicemails?.advancedEmailAddresses?.sort().join('\n') == this.newUser?.notifications?.voicemails?.advancedEmailAddresses?.sort().join('\n') ? 'TRUE' : 'FALSE',

            // Advanced inbound fax email
            this.originalUser.notifications?.inboundFaxes?.advancedEmailAddresses?.sort().join('\n') ?? '',
            this.newUser?.notifications?.inboundFaxes?.advancedEmailAddresses?.sort().join('\n') ?? '',
            this.originalUser.notifications?.inboundFaxes?.advancedEmailAddresses?.sort().join('\n') == this.newUser?.notifications?.inboundFaxes?.advancedEmailAddresses?.sort().join('\n') ? 'TRUE' : 'FALSE',

            // Advanced outbound fax email
            this.originalUser.notifications?.outboundFaxes?.advancedEmailAddresses?.sort().join('\n') ?? '',
            this.newUser?.notifications?.outboundFaxes?.advancedEmailAddresses?.sort().join('\n') ?? '',
            this.originalUser.notifications?.outboundFaxes?.advancedEmailAddresses?.sort().join('\n') == this.newUser?.notifications?.outboundFaxes?.advancedEmailAddresses?.sort().join('\n') ? 'TRUE' : 'FALSE',

            // Advanced missed call email
            this.originalUser.notifications?.missedCalls?.advancedEmailAddresses?.sort().join('\n') ?? '',
            this.newUser?.notifications?.missedCalls?.advancedEmailAddresses?.sort().join('\n') ?? '',
            this.originalUser.notifications?.missedCalls?.advancedEmailAddresses?.sort().join('\n') == this.newUser?.notifications?.missedCalls?.advancedEmailAddresses?.sort().join('\n') ? 'TRUE' : 'FALSE',

            // Advanced inbound text email
            this.originalUser.notifications?.inboundTexts?.advancedEmailAddresses?.sort().join('\n') ?? '',
            this.newUser?.notifications?.inboundTexts?.advancedEmailAddresses?.sort().join('\n') ?? '',
            this.originalUser.notifications?.inboundTexts?.advancedEmailAddresses?.sort().join('\n') == this.newUser?.notifications?.inboundTexts?.advancedEmailAddresses?.sort().join('\n') ? 'TRUE' : 'FALSE',

            // SMS email
            this.originalUser.notifications?.smsEmailAddresses?.sort().join('\n') ?? '',
            this.newUser?.notifications?.smsEmailAddresses?.sort().join('\n') ?? '',
            this.originalUser.notifications?.smsEmailAddresses?.sort().join('\n') == this.newUser?.notifications?.smsEmailAddresses?.sort().join('\n') ? 'TRUE' : 'FALSE',

            // Voicemail notifications
            this.originalUser.prettyVoicemailNotificationSettings(),
            this.newUser?.prettyVoicemailNotificationSettings() ?? '',
            this.originalUser.prettyVoicemailNotificationSettings() == this.newUser?.prettyVoicemailNotificationSettings() ? 'TRUE' : 'FALSE',

            // Fax notifications
            this.originalUser.prettyFaxNotificationSettings(),
            this.newUser?.prettyFaxNotificationSettings() ?? '',
            this.originalUser.prettyFaxNotificationSettings() == this.newUser?.prettyFaxNotificationSettings() ? 'TRUE' : 'FALSE',

            // Missed call notifications
            this.originalUser.notifications?.missedCalls.notifyByEmail ? 'Yes' : 'No',
            this.newUser?.notifications?.missedCalls.notifyByEmail ? 'Yes' : 'No',
            this.originalUser.notifications?.missedCalls.notifyByEmail == this.newUser?.notifications?.missedCalls.notifyByEmail ? 'TRUE' : 'FALSE',

            // Fax transmission results
            this.originalUser.notifications?.outboundFaxes.notifyByEmail ? 'Yes' : 'No',
            this.newUser?.notifications?.outboundFaxes.notifyByEmail ? 'Yes' : 'No',
            this.originalUser.notifications?.outboundFaxes.notifyByEmail == this.newUser?.notifications?.outboundFaxes.notifyByEmail ? 'TRUE' : 'FALSE',

            // Text notifications
            this.originalUser.notifications?.inboundTexts.notifyByEmail ? 'Yes' : 'No',
            this.newUser?.notifications?.inboundTexts.notifyByEmail ? 'Yes' : 'No',
            this.originalUser.notifications?.inboundTexts.notifyByEmail == this.newUser?.notifications?.inboundTexts.notifyByEmail ? 'TRUE' : 'FALSE',

            // Cost center
            this.originalUser.extension.data.costCenter?.name ?? '',
            this.newUser?.extension.data.costCenter?.name ?? '',
            this.originalUser.extension.data.costCenter?.name == this.newUser?.extension.data.costCenter?.name ? 'TRUE' : 'FALSE',
        ]
    }
}