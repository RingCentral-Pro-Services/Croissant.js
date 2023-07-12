import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Extension } from "../../../../../models/Extension";
import { BusinessHours, CallHandling, CustomRule, Notifications, PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class CallQueueDataBundle implements ExcelFormattable {
    public hasEncounteredFatalError = false
    public tempExtension = ''
    
    constructor(public extension: Extension, public extendedData?: ExtendedQueueData, public phoneNumberMap?: Map<string, PhoneNumber>) {}

    toExcelRow(): string[] {
        return [
            '', // Initial upon completion column. Ignored
            this.extension.data.name,
            this.extension.data.extensionNumber,
            '', // Temp extension number. Ignored
            this.extendedData?.directNumbers?.map((number) => number.phoneNumber).join(', ') ?? '',
            this.getTempNumbers(),
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
            this.prettyMaxCallersAction(),
            this.prettyMaxCallersDestination(),
            this.prettyWaitTimeAction(),
            this.prettyWaitTimeDestination(),
            this.prettyMemberStatus(), // Member status. Ignored for now
            this.prettyQueueStatus(), // Queue status. Ignored for now
            '', // Display information. Ignored
            this.extendedData?.customRules?.map((rule) => rule.name).join(', ') ?? '',
            this.extendedData?.pickupMembers?.map((member) => member.extensionNumber).join(', ') ?? '',
            `${this.extendedData?.otherSettings?.alertTimer ? this.extendedData?.otherSettings?.alertTimer : ''}`,
            this.prettyAfterHoursAction(),
            this.prettyAfterHoursDestination(),
            this.greeting('Voicemail'),
            this.extendedData?.businessHoursCallHandling?.voicemail?.recipient?.displayName ?? '',
            this.afterHoursGreeting('Voicemail'),
            this.extendedData?.afterHoursCallHandling?.voicemail?.recipient?.displayName ?? '',
            this.extendedData?.notifications?.emailAddresses?.join(', ') ?? '',
            this.extendedData?.notifications?.voicemails.advancedEmailAddresses?.join(', ') ?? '',
            this.prettyVoicemailNotificationSettings(),
            this.prettyFaxNotificationSettings(),
            this.extendedData!.notifications?.missedCalls.notifyByEmail ? 'Notify' : 'Do not notify',
            this.extendedData!.notifications?.inboundTexts.notifyByEmail ? 'Notify' : 'Do not notify',
            this.extension.data.costCenter?.name ?? '',
            this.prettyOverflowSettings(),
            '', // Notes. Ignored
        ]
    }

    prettyPickupMembers() {
        if (!this.extendedData?.pickupMembers) return ''
        let result = ''
        for (let i = 0; i < this.extendedData.pickupMembers.length; i++) {
            const member = this.extendedData.pickupMembers[i]
            result += `${member.name} - Ext. ${member.extensionNumber}`

            if (i != this.extendedData.pickupMembers.length - 1) result += '\n'
        }
        return result
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

    prettyOverflowSettings() {
        if (!this.extendedData?.overflow || !this.extendedData.overflow.enabled || !this.extendedData.overflow.items) return ''
        let result = ''

        for (let i = 0; i < this.extendedData.overflow.items.length; i++) {
            const overflowQueue = this.extendedData.overflow.items[i]
            result += `${overflowQueue.name} - Ext. ${overflowQueue.extensionNumber}`

            if (i != this.extendedData.overflow.items.length - 1) result += '\n'
        }

        return result
    }

    prettyMemberStatus() {
        if (!this.extendedData?.memberPresense) return ''
        let result = ''

        for (let i = 0; i < this.extendedData.memberPresense.length; i++) {
            const member = this.extendedData.memberPresense[i]
            result += `${member.member.name} - ${member.acceptQueueCalls ? 'ON' : 'OFF'}`
            if (i != this.extendedData.memberPresense.length - 1) result += '\n'
        }

        return result
    }

    prettyQueueStatus() {
        if (!this.extendedData?.memberPresense) return ''
        let result = ''

        for (let i = 0; i < this.extendedData.memberPresense.length; i++) {
            const member = this.extendedData.memberPresense[i]
            result += `${member.member.name} - ${member.acceptCurrentQueueCalls ? 'ON' : 'OFF'}`
            if (i != this.extendedData.memberPresense.length - 1) result += '\n'
        }
        
        return result
    }

    prettyWaitTimeAction() {
        switch (this.extendedData?.businessHoursCallHandling?.queue?.holdTimeExpirationAction) {
            case 'TransferToExtension':
                return 'Extension →'
            case 'UnconditionalForwarding':
                return 'External Number →'
            case 'Voicemail':
                return 'Voicemail'
            default:
                return ''
        }
    }

    prettyWaitTimeDestination() {
        if (this.extendedData?.businessHoursCallHandling?.queue?.holdTimeExpirationAction === 'TransferToExtension') {
            if (this.extendedData?.businessHoursCallHandling?.queue.transfer) {
                for (const transfer of this.extendedData?.businessHoursCallHandling?.queue.transfer) {
                    if (transfer.action === 'HoldTimeExpiration') {
                        return `${transfer.extension.extensionNumber}`
                    }
                }
            }
        }
        else if (this.extendedData?.businessHoursCallHandling?.queue?.holdTimeExpirationAction === 'UnconditionalForwarding') {
            if (this.extendedData?.businessHoursCallHandling?.queue.unconditionalForwarding) {
                for (const transfer of this.extendedData?.businessHoursCallHandling?.queue.unconditionalForwarding) {
                    if (transfer.action === 'HoldTimeExpiration') {
                        return transfer.phoneNumber
                    }
                }
            }
        }
        return ''
    }

    prettyMaxCallersAction() {
        if (!this.extendedData?.businessHoursCallHandling?.queue) return ''

        switch (this.extendedData!.businessHoursCallHandling?.queue.maxCallersAction) {
            case 'TransferToExtension':
                return 'Extension →'
            case 'UnconditionalForwarding':
                return 'External Number →'
            case 'Voicemail':
                return 'Send new callers to voicemail'
            case 'Announcement':
                return 'Advise callers of heavy call volume and disconnect'
            default:
                return ''
        }
    }

    prettyMaxCallersDestination() {
        if (!this.extendedData?.businessHoursCallHandling?.queue) return ''

        if (this.extendedData?.businessHoursCallHandling?.queue?.maxCallersAction === 'TransferToExtension') {
            if (this.extendedData.businessHoursCallHandling.queue.transfer) {
                for (const transfer of this.extendedData.businessHoursCallHandling.queue.transfer) {
                    if (transfer.action === 'MaxCallers') {
                        return `${transfer.extension.extensionNumber}`
                    }
                }
            }
        }
        else if (this.extendedData.businessHoursCallHandling.queue?.maxCallersAction === 'UnconditionalForwarding') {
            if (this.extendedData.businessHoursCallHandling.queue.unconditionalForwarding) {
                for (const transfer of this.extendedData.businessHoursCallHandling.queue.unconditionalForwarding) {
                    if (transfer.action === 'MaxCallers') {
                        return transfer.phoneNumber
                    }
                }
            }
        }
        return ''
    }

    prettyAfterHoursAction() {
        switch (this.extendedData?.afterHoursCallHandling?.callHandlingAction) {
            case 'TransferToExtension':
                return 'Forward to Extension →'
            case 'UnconditionalForwarding':
                return 'Forward to External Number →'
            case 'TakeMessagesOnly':
                return 'Send to Voicemail'
            case 'PlayAnnouncementOnly':
                return 'Play an Announcement'
            default:
                return ''
        }
    }

    prettyAfterHoursDestination() {
        if (!this.extendedData?.afterHoursCallHandling) return ''
        const callHandling = this.extendedData.afterHoursCallHandling

        if (callHandling.callHandlingAction === 'TransferToExtension') {
            if (callHandling.transfer) {
                return `${callHandling.transfer.extension.id}`
            }
        }
        else if (callHandling.callHandlingAction === 'UnconditionalForwarding') {
            if (this.extendedData.afterHoursCallHandling.unconditionalForwarding) {
                return callHandling.unconditionalForwarding?.phoneNumber ?? ''
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
    overflow?: OverflowSettings
}

export interface OverflowSettings {
    enabled: boolean
    items: OverflowQueue[]
}

export interface OverflowQueue {
    id: string
    extensionNumber: string
    name: string
    status: string
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