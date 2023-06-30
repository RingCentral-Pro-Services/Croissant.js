import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Extension } from "../../../../../models/Extension";
import { BusinessHours, CallHandling, CustomRule, Notifications, PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class CallQueueDataBundle implements ExcelFormattable {
    public hasEncounteredFatalError = false
    
    constructor(public extension: Extension, public extendedData?: ExtendedQueueData, public phoneNumberMap?: Map<string, PhoneNumber>) {}

    toExcelRow(): string[] {
        return [
            '', // Initial upon completion column. Ignored
            this.extension.data.name,
            this.extension.data.extensionNumber,
            '', // Temp extension number. Ignored
            this.extendedData?.directNumbers?.map((number) => number.phoneNumber).join(', ') ?? '',
            '', // Temp number. Ignored
            this.extension.data.site?.name ?? '',
            this.extension.data.contact.email ?? '',
            this.extension.data.contact.pronouncedName?.text ?? '',
            this.prettyBusinessHours(),
            this.extension.data.regionalSettings?.timezone.description ?? '',
            this.extension.data.regionalSettings?.formattingLocale.name ?? '',
            this.extension.data.regionalSettings?.language.name ?? '',
            this.extension.data.regionalSettings?.timeFormat ?? '',
            this.prettyGreeting(this.greeting('Introductory')),
            this.prettyGreeting(this.greeting('ConnectingAudio')),
            this.prettyInterruptPeriod(this.extendedData!.businessHoursCallHandling?.queue?.holdAudioInterruptionMode ?? '', this.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionPeriod ?? 0),
            this.extendedData!.businessHoursCallHandling!.queue?.holdAudioInterruptionPeriod ? this.greeting('InterruptPrompt') : '' ,
            this.prettyGreeting(this.greeting('HoldMusic')),
            this.prettyRingType(this.extendedData?.businessHoursCallHandling?.queue?.transferMode ?? ''),
            this.extendedData?.members?.map((member) => member.extensionNumber).join(', ') ?? '',
            this.extendedData?.otherSettings?.editableMemberStatus ? 'Yes' : 'No',
            this.extendedData?.businessHoursCallHandling?.queue?.transferMode === 'Simultaneous' ? 'N/A (simultaneous)' : this.prettyTime(this.extendedData?.businessHoursCallHandling?.queue?.agentTimeout ?? 0),
            this.prettyTime(this.extendedData?.businessHoursCallHandling?.queue?.holdTime ?? 0),
            this.prettyTime(this.extendedData?.businessHoursCallHandling?.queue?.wrapUpTime ?? 0),
            `${this.extendedData?.businessHoursCallHandling?.queue?.maxCallers}`,
            this.extendedData?.businessHoursCallHandling?.queue?.noAnswerAction ?? '',
            '', // Member status. Ignored for now
            '', // Queue status. Ignored for now
            '', // Display information. Ignored
            this.extendedData?.customRules?.map((rule) => rule.name).join(', ') ?? '',
            this.extendedData?.pickupMembers?.map((member) => member.extensionNumber).join(', ') ?? '',
            `${this.extendedData?.otherSettings?.alertTimer}`,
            this.extendedData?.afterHoursCallHandling?.callHandlingAction ?? '',
            '', // After hours notes. Ignored
            this.greeting('Voicemail'),
            this.extendedData?.businessHoursCallHandling?.voicemail?.recipient?.displayName ?? '',
            this.afterHoursGreeting('Voicemail'),
            this.extendedData?.afterHoursCallHandling?.voicemail?.recipient?.displayName ?? '',
            this.extendedData?.notifications?.emailAddresses?.join(', ') ?? '',
            this.prettyVoicemailNotificationSettings(),
            this.prettyFaxNotificationSettings(),
            this.extendedData!.notifications?.missedCalls.notifyByEmail ? 'Notify' : 'Do not notify',
            this.extendedData!.notifications?.inboundTexts.notifyByEmail ? 'Notify' : 'Do not notify',
            this.extension.data.costCenter?.name ?? '',
            '', // Notes. Ignored
        ]
    }

    greeting(name: string) {
        for (const greeting of this.extendedData!.businessHoursCallHandling!.greetings ?? []) {
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
        for (const greeting of this.extendedData!.afterHoursCallHandling?.greetings ?? []) {
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

    prettyGreeting(value: string) {
        if (value === 'Default' || value === 'Ring Tones') return value
        else if (value === 'None') return 'Off'
        else {
            return `Music (${value})`
        }
    }

    prettyRingType(rawType: string) {
        if (rawType === 'FixedOrder') {
            return 'Sequential'
        }
        return rawType
    }

    prettyBusinessHours() {
        let result = ''

        if (!this.extendedData!.businessHours) return result
        if (Object.keys(this.extendedData!.businessHours.schedule).length === 0) return '24/7'

        const weeklyRanges = this.extendedData!.businessHours.schedule.weeklyRanges
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

    prettyInterruptPeriod(interruptMode: string, interruptPeriod: number) {
        if (interruptMode === 'Never') return 'Never'
        else if (interruptMode === 'Periodically') {
            return this.prettyTime(interruptPeriod)
        }
        else {
            return 'Only when music ends'
        }
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

    prettyTime(time: number) {
        let result = ''

        if (time === 1) {
            return `Don't Wait`
        }
        if (time >= 60) {
            result = `${time / 60} min`
        }
        else {
            result = `${time} secs`
        }

        return result
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

export interface ExtendedQueueData {
    businessHours?: BusinessHours
    directNumbers?: PhoneNumber[]
    businessHoursCallHandling?: CallHandling
    afterHoursCallHandling?: CallHandling
    members?: CallQueueMember[]
    notifications?: Notifications
    otherSettings?: OtherSettings
    memberPresense?: MemberPresenseStatus[]
    pickupMembers?: PickupMember[]
    managers?: QueueManager[]
    customRules?: CustomRule[]
}

interface CallQueueMember {
    uri?: string
    id: string
    extensionNumber: string
}

interface OtherSettings {
    editableMemberStatus: boolean
    alertTimer: number
}

export interface MemberPresenseStatus {
    member: {
        id: string
        name?: string
        extensionNumber?: string
        site?: {
            id: string
            name: string
        }
    }
    acceptQueueCalls?: boolean
    acceptCurrentQueueCalls: boolean
}

interface PickupMember {
    id: string
    name?: string
    extensionNumber?: string
    site?: {
        id: string
        name?: string
    }
}

export interface QueueManager {
    extension: {
        id: string
        name?: string
        extensionNumber?: string
        site?: {
            id: string
            name?: string
        }
    }
    permission: string
}