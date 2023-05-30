import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Extension } from "../../../../../models/Extension";
import { BlockedCallSettings, BlockedPhoneNumber, BusinessHours, CallerID, CallHandling, DefaultBridge, Delegate, Device, ERL, ForwardAllCalls, IncommingCallInfo, IntercomStatus, Notifications, PresenseAllowedUser, PresenseLine, PresenseSettings, Role } from "./UserDataBundle";

export class UserDataRow implements ExcelFormattable {
    constructor(public extension: Extension, public type: string, public device?: Device, public directNumber?: string, 
                public businessHoursCallHandling?: CallHandling, public afterHoursCallHandling?: CallHandling,
                public notifications?: Notifications, public callerID?: CallerID, public blockedCallSettings?: BlockedCallSettings,
                public blockedPhoneNumbers?: BlockedPhoneNumber[], public presenseLines?: PresenseLine[], public presenseSettings?: PresenseSettings,
                public presenseAllowedUsers?: PresenseAllowedUser[], public intercomStatus?: IntercomStatus, public delegates?: Delegate[], public erls?: ERL[],
                public roles?: Role[], public incommingCallInfo?: IncommingCallInfo, public businessHours?: BusinessHours, public forwardAllCalls?: ForwardAllCalls,
                public defaultBridge?: DefaultBridge, public userGroups?: string) {}

    toExcelRow(): string[] {
        console.log(this)
        return [
            '', // Initial upon completion
            this.type,
            this.extension.data.extensionNumber,
            '', // Temporary extension
            this.extension.data.contact.firstName,
            this.extension.data.contact.lastName ?? '',
            this.extension.data.contact.email,
            this.extension.data.contact.department ?? '',
            this.extension.data.contact.jobTitle ?? '',
            this.userGroups ?? '', // User groups
            this.extension.data.contact.businessPhone ?? '',
            this.extension.data.contact.mobilePhone ?? '',
            this.extension.data.regionalSettings?.formattingLocale.name ?? '',
            this.extension.data.regionalSettings?.formattingLocale.name ?? '',
            this.extension.data.regionalSettings?.language.name ?? '',
            this.extension.data.regionalSettings?.timeFormat ?? '',
            this.prettyBusinessHours(),
            this.roles?.at(0)?.displayName ?? '',
            this.extension.data.hidden ? 'ON' : 'OFF',
            '', // Receive RC communications
            '', // Send email when phone added
            this.extension.data.site?.name ?? '',
            this.device?.phoneLines[0].phoneInfo.phoneNumber ?? this.directNumber ?? '',
            '', // Temp number
            this.device ? this.device?.model?.name ?? 'RingCentral Phone App' : '',
            this.device?.serial ?? '',
            this.device?.name ?? '',
            '', // Default area code
            this.device?.emergencyServiceAddress?.customerName ?? '',
            this.device?.emergencyServiceAddress?.street ?? '',
            this.device?.emergencyServiceAddress?.street2 ?? '',
            this.device?.emergencyServiceAddress?.city ?? '',
            this.device?.emergencyServiceAddress?.stateName ?? '',
            this.device?.emergencyServiceAddress?.zip ?? '',
            this.device?.emergencyServiceAddress?.countryName ?? '',
            '', // Device locked?
            '', // WMI
            this.prettyPresenseLines(),
            this.presenseSettings?.ringOnMonitoredCall === true ? 'ON' : 'OFF',
            this.presenseSettings?.pickUpCallsOnHold === true ? 'ON' : 'OFF',
            this.presenseSettings?.allowSeeMyPresence === true ? 'ON' : 'OFF',
            this.prettyPresenseUsers(),
            this.intercomStatus?.enabled ? 'ON' : 'OFF',
            this.prettyDelegates(),
            this.defaultBridge?.pins.web ?? '',
            this.greeting('Introductory'),
            this.businessHoursCallHandling?.screening ?? '',
            this.greeting('ConnectingMessage'),
            this.greeting('ConnectingAudio'),
            this.greeting('HoldMusic'),
            this.afterHoursGreeting('Introductory'),
            this.afterHoursCallHandling?.callHandlingAction === 'ForwardCalls' ? this.afterHoursCallHandling?.screening ?? '' : '',
            this.afterHoursGreeting('ConnectingMessage'),
            this.afterHoursGreeting('ConnectingAudio'),
            this.afterHoursGreeting('HoldMusic'),
            this.blockedCallSettings?.mode ?? '',
            this.blockedPhoneNumbers?.map((number) => number.phoneNumber).join(', ') ?? '',
            '', // Robocalls
            '', // Trusted numbers
            this.blockedCallSettings?.noCallerId ?? '',
            this.blockedCallSettings?.payPhones ?? '',
            this.prettyForwardAllCalls(),
            this.businessHoursCallHandling?.forwarding.ringingMode ?? '',
            this.prettyRingTime(this.businessHoursCallHandling?.forwarding.softPhonesRingCount),
            this.prettyDeviceRingTime(),
            this.prettyVoicemailAction(),
            this.greeting('Voicemail'),
            this.businessHoursCallHandling?.voicemail.recipient.id ?? '',
            this.afterHoursCallHandling?.callHandlingAction === 'ForwardCalls' ? this.afterHoursCallHandling?.forwarding.ringingMode ?? '' : '',
            this.afterHoursCallHandling?.callHandlingAction === 'ForwardCalls' ? this.prettyRingTime(this.afterHoursCallHandling?.forwarding.softPhonesRingCount) : '',
            this.prettyAfterHoursDeviceRingTime(),
            this.prettyAfterHoursVoicemailAction(),
            this.afterHoursGreeting('Voicemail'),
            this.afterHoursCallHandling?.voicemail.recipient.id ?? '',
            '', // Custom roles
            this.prettyIncommingCallInfo(),
            this.notifications?.voicemails.includeTranscription ? 'ON' : 'OFF',
            this.prettyPERLs(),
            this.notifications?.emailAddresses?.join('\n') ?? '',
            this.prettyVoicemailNotificationSettings(),
            this.prettyFaxNotificationSettings(),
            this.notifications?.missedCalls.notifyByEmail ? 'Notify' : 'Do not notify',
            this.notifications?.outboundFaxes.notifyByEmail ? 'Notify' : 'Do not notify',
            this.notifications?.inboundTexts.notifyByEmail ? 'Notify' : 'Do not notify',
            this.prettyDeviceCallerID(),
            this.callerIDNumber('FaxNumber'),
            this.callerIDNumber('CallFlip'),
            this.callerIDNumber('RingOut'),
            this.callerIDNumber('RingMe'),
            this.callerIDNumber('AdditionalSoftphone'),
            this.callerIDNumber('Alternate'),
            this.callerIDNumber('CommonPhone'),
            this.callerIDNumber('MobileApp'),
            this.callerIDNumber('Delegated'),
            this.extension.data.costCenter?.name ?? ''
        ]
    }

    greeting(name: string) {
        for (const greeting of this.businessHoursCallHandling?.greetings ?? []) {
            if (greeting.type === name) {
                if ('preset' in greeting) {
                    return greeting.preset.name    
                }
                else {
                    return 'Custom'
                }
            }
        }
        return ''
    }

    afterHoursGreeting(name: string) {
        if (this.afterHoursCallHandling?.callHandlingAction !== 'ForwardCalls') return ''

        for (const greeting of this.afterHoursCallHandling?.greetings ?? []) {
            if (greeting.type === name) {
                if ('preset' in greeting) {
                    return greeting.preset.name    
                }
                else {
                    return 'Custom'
                }
            }
        }
        return ''
    }

    prettyVoicemailAction() {
        if (!this.businessHoursCallHandling?.missedCall) return 'Send to Voicemail'

        let result = ''
        switch(this.businessHoursCallHandling.missedCall.actionType) {
            case 'PlayGreetingAndDisconnect':
                result = 'Play Announcement'
                break
            case 'ConnectToExtension':
                result = `Transfer to ${this.businessHoursCallHandling.missedCall.extension.id}`
                break
            case 'ConnectToExternalNumber':
                result = `Transfer to ${this.businessHoursCallHandling.missedCall.externalNumber.phoneNumber}`
                break
            default:
                result = ''
                break
        }
        return result
    }

    prettyAfterHoursVoicemailAction() {
        if (!this.afterHoursCallHandling?.missedCall) return 'Send to Voicemail'

        let result = ''
        switch(this.afterHoursCallHandling.missedCall.actionType) {
            case 'PlayGreetingAndDisconnect':
                result = 'Play Announcement'
                break
            case 'ConnectToExtension':
                result = `Transfer to ${this.afterHoursCallHandling.missedCall.extension.id}`
                break
            case 'ConnectToExternalNumber':
                result = `Transfer to ${this.afterHoursCallHandling.missedCall.externalNumber.phoneNumber}`
                break
            default:
                result = ''
        }
        return result
    }

    prettyPresenseLines() {
        if (!this.presenseLines) return ''

        let result = ''

        for (const line of this.presenseLines) {
            result += `Line ${line.id} - ${line.extension.extensionName}\n`
        }

        return result
    }

    prettyPresenseUsers() {
        if (!this.presenseAllowedUsers) return ''

        let result = ''

        for (const line of this.presenseAllowedUsers) {
            result += `${line.extensionName} - ${line.extensionNumber}\n`
        }

        return result
    }

    prettyRingTime(rawRingCount: number | undefined) {
        if (!rawRingCount) return ''
        return `${rawRingCount} Rings / ${rawRingCount * 5} Seconds`
    }

    prettyDeviceRingTime() {
        let result = ''

        if (!this.businessHoursCallHandling || !this.businessHoursCallHandling.forwarding.rules) return result

        for (let i = 0; i < this.businessHoursCallHandling?.forwarding.rules.length; i++) {
            const rule = this.businessHoursCallHandling.forwarding.rules[i]
            result += `${rule.index} -- ${this.prettyRingTime(rule.ringCount)}\n`
            for (const endpoint of rule.forwardingNumbers) {
                result += `${endpoint.label} ${endpoint.phoneNumber}\n`
            }
            result += '\n'
        }

        return result
    }

    prettyAfterHoursDeviceRingTime() {
        let result = ''

        if (!this.afterHoursCallHandling || !this.afterHoursCallHandling.forwarding.rules || this.afterHoursCallHandling.callHandlingAction !== 'ForwardCalls') return result

        for (let i = 0; i < this.afterHoursCallHandling?.forwarding.rules.length; i++) {
            const rule = this.afterHoursCallHandling.forwarding.rules[i]
            result += `${rule.index} -- ${this.prettyRingTime(rule.ringCount)}\n`
            for (const endpoint of rule.forwardingNumbers) {
                result += `${endpoint.label} ${endpoint.phoneNumber}\n`
            }
            result += '\n'
        }

        return result
    }

    prettyDelegates() {
        if (!this.delegates) return ''

        let result = ''

        for (const delegate of this.delegates) {
            result += `${delegate.extension.name} - ${delegate.extension.extensionNumber}\n`
        }

        return result
    }

    prettyVoicemailNotificationSettings() {
        if (!this.notifications) return ''

        if (this.notifications.voicemails.notifyByEmail) {
            if (this.notifications.voicemails.includeAttachment && this.notifications.voicemails.markAsRead) {
                return 'Notify and attach and mark as read'
            }
            else if (this.notifications.voicemails.includeAttachment) {
                return 'Notify and attach'
            }
            return 'Notify'
        }

        return 'Do not notify'
    }

    prettyFaxNotificationSettings() {
        if (!this.notifications?.inboundFaxes.notifyByEmail) return 'Do not notify'

        if (this.notifications.inboundFaxes.notifyByEmail) {
            if (this.notifications.inboundFaxes.includeAttachment && this.notifications.inboundFaxes.markAsRead) {
                return 'Notify and attach and mark as read'
            }
            else if (this.notifications.inboundFaxes.includeAttachment) {
                return 'Notify and attach'
            }
            return 'Notify'
        }

        return 'Do not notify'
    }

    callerIDNumber(feature: string) {
        if (!this.callerID) return ''

        for (const callerIdOption of this.callerID.byFeature) {
            if (callerIdOption.feature === feature) {
                if (Object.keys(callerIdOption.callerId).length === 0) return 'Not set'
                if (callerIdOption.callerId.type !== 'PhoneNumber') return callerIdOption.callerId.type
                return callerIdOption.callerId.phoneInfo.phoneNumber
            }
        }
        return ''
    }

    prettyDeviceCallerID() {
        let result = ''

        if (!this.callerID || !this.device) return ''

        for (const callerIdOption of this.callerID?.byDevice) {
            if (Object.keys(callerIdOption.callerId).length === 0) result += `${callerIdOption.device.name} - Not set\n`
            if (callerIdOption.callerId.type !== 'PhoneNumber') result += `${callerIdOption.device.name} - ${callerIdOption.callerId.type}`
            result += `${callerIdOption.device.name} - ${callerIdOption.callerId.phoneInfo.phoneNumber}\n`
        }

        return result
    }

    prettyPERLs() {
        let result = ''

        if (!this.erls) return result

        for (const erl of this.erls) {
            result += `${erl.name} -----------\n`
            result += `${erl.address.customerName}\n`
            result += `${erl.address.street}\n`
            if (erl.address.street2) {
                result += `${erl.address.street2}\n`
            }
            result += `${erl.address.city}\n`
            result += `${erl.address.country}\n`
            result += `${erl.address.zip}\n\n`
        }
        
        return result
    }

    prettyIncommingCallInfo() {
        let result = ''
        if (!this.incommingCallInfo) return result

        const callInfo = this.incommingCallInfo
        result += `Displayed Number: ${callInfo.displayedNumber}\n`
        result += `Play announcement (Direct calls): ${callInfo.announcement.directCalls}\n`
        result += `Play announcement (Queue calls): ${callInfo.announcement.callQueueCalls}`
        return result
    }

    prettyBusinessHours() {
        let result = ''

        if (!this.businessHours) return result
        if (Object.keys(this.businessHours.schedule).length === 0) return '24/7'

        const weeklyRanges = this.businessHours.schedule.weeklyRanges
        if (weeklyRanges.sunday) {
            result += `Sunday: ${this.convertTo12HourTime(weeklyRanges.sunday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.sunday[0].to)}\n`
        }
        if (weeklyRanges.monday) {
            result += `Monday: ${this.convertTo12HourTime(weeklyRanges.monday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.monday[0].to)}\n`
        }
        if (weeklyRanges.tuesday) {
            result += `Tuesday: ${this.convertTo12HourTime(weeklyRanges.tuesday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.tuesday[0].to)}\n`
        }
        if (weeklyRanges.wednesday) {
            result += `Wednesday: ${this.convertTo12HourTime(weeklyRanges.wednesday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.wednesday[0].to)}\n`
        }
        if (weeklyRanges.thursday) {
            result += `Thursday: ${this.convertTo12HourTime(weeklyRanges.thursday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.thursday[0].to)}\n`
        }
        if (weeklyRanges.friday) {
            result += `Friday: ${this.convertTo12HourTime(weeklyRanges.friday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.friday[0].to)}\n`
        }
        if (weeklyRanges.saturday) {
            result += `Saturday: ${this.convertTo12HourTime(weeklyRanges.saturday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.saturday[0].to)}\n`
        }
        return result
    }

    prettyForwardAllCalls() {
        if (!this.forwardAllCalls || !this.forwardAllCalls.enabled) return 'Disabled'

        // UnconditionalForwarding, TransferToExtension, TakeMessagesOnly, PlayAnnouncementOnly
        if (this.forwardAllCalls.callHandlingAction === 'UnconditionalForwarding') {
            return `Forward to ${this.forwardAllCalls.externalNumber.phoneNumber}`
        }
        else if (this.forwardAllCalls.callHandlingAction === 'TransferToExtension') {
            return `Forward to ${this.forwardAllCalls.extension?.name}`
        }
        else if (this.forwardAllCalls.callHandlingAction === 'TakeMessagesOnly') {
            return `Forward to voicemail`
        }
        else if (this.forwardAllCalls.callHandlingAction === 'PlayAnnouncementOnly') {
            return `Forward to announcement`
        }
        return ''
    }

    convertTo12HourTime(time: string) {
        const hour = parseInt(time.split(':')[0])
        const minute = time.split(':')[1]
        if (hour === 0) return `12:${minute} AM`
        if (hour === 12) return `12:${minute} PM`
        if (hour < 12) return `${hour}:${minute} AM`
        return `${hour - 12}:${minute} PM`
    }
}