import CSVFormattable from "./CSVFormattable";
import ExcelFormattable from "./ExcelFormattable";
import { DataTableFormattable } from "./DataTableFormattable";
import RCExtension from "./RCExtension";
import { CallHandlingRules } from "./CallHandlingRules";
import { Greeting } from "./Greetings";
import { TransferPayload, UnconditionalForwardingPayload } from "./TransferPayload";
import { DataGridFormattable } from "./DataGridFormattable";
import { PhoneNumber } from "./PhoneNumber";
import { CallQueueManager } from "./CallQueueManager";
import { BusinessHours } from "../components/pages/Migration/User Data Download/models/UserDataBundle";

class CallQueue implements CSVFormattable, ExcelFormattable, DataTableFormattable, DataGridFormattable {

    public businessHours?: BusinessHours

    constructor(
        public extension: RCExtension,
        public siteID: number | string,
        public members: string[],
        public handlingRules?: CallHandlingRules,
        public greetings?: Greeting[],
        public transferExtension?: string,
        public unconditionalForwardNumber?: string,
        public maxWaitTimeDestination?: string,
        public maxCallersDestination?: string,
        public afterHoursAction?: string,
        public afterHoursDestination?: string,
        public phoneNumbers?: PhoneNumber[],
        public pin?: string,
        public managers?: string[],
        public editableMemberStatus?: string,
        public voicemailRecipient?: string,
        public sendEmailNotifications?: boolean,
        public includeAttachment?: boolean,
        public markAsRead?: boolean,
        public notificationEmails?: string[],
        ) {
        // this.sortMembers()
    }

    toRow(): string {
        return `${this.extension.name},${this.extension.extensionNumber},${this.extension.site},${this.extension.status},"${this.members}"`
    }

    toExcelRow(): string[] {
        return [
            this.extension.name,
            this.extension.contact.pronouncedName?.type === 'Recorded' ? 'Custom Audio' : this.extension.contact.pronouncedName?.text ?? '',
            `${this.extension.extensionNumber}`,
            this.extension.site,
            this.extension.status,
            this.phoneNumbers?.map((p) => p.phoneNumber).join(', ') || '', 
            this.managers?.join(',') || '',
            this.extension.contact.email ?? '',
            '',
            `${this.members}`,
            this.prettyBusinessHours(),
            this.prettyGreeting(this.greeting('Introductory')),
            this.prettyGreeting(this.greeting('ConnectingAudio')),
            this.prettyGreeting(this.greeting('HoldMusic')),
            this.prettyInterruptPeriod(this.handlingRules?.holdAudioInterruptionMode ?? '',
            this.handlingRules?.holdAudioInterruptionPeriod ?? 0),
            this.handlingRules?.holdAudioInterruptionPeriod ? this.greeting('InterruptPrompt') : '' ,
            this.prettyRingType(this.handlingRules?.transferMode ?? ''),
            this.handlingRules?.transferMode === 'Simultaneous' ? 'N/A (simultaneous)' : this.prettyTime(this.handlingRules?.agentTimeout ?? 0),
            this.prettyTime(this.handlingRules?.holdTime ?? 0),
            this.prettyTime(this.handlingRules?.wrapUpTime ?? 0),
            this.editableMemberStatus ?? '',
            `${this.handlingRules?.maxCallers}`,
            this.prettyMaxCallersAction(),
            this.prettyMaxCallersDestination() ?? '' ,
            this.prettyWaitTimeAction(),
            this.prettyWaitTimeDestination() ?? '',
            this.greeting('Voicemail'),
            this.voicemailRecipient ?? '',
            this.prettyNotificationSettings(),
            this.notificationEmails ? this.notificationEmails.join(',') : '',
            this.prettyAfterHoursAction(),
            this.afterHoursDestination ?? ''
        ]
    }

    toDataTableRow(): string[] {
        return [this.extension.name, `${this.extension.extensionNumber}`, this.extension.site, `${this.members}`, this.prettyRingType(this.handlingRules?.transferMode ?? ''), this.prettyTime(this.handlingRules?.holdTime ?? 0), this.prettyTime(this.handlingRules?.wrapUpTime ?? 0)]
    }

    toDataGridRow(): any {
        return {
            id: this.extension.extensionNumber,
            name: this.extension.name,
            extension: this.extension.extensionNumber,
            site: this.extension.site,
            members: this.members,
            ringType: this.prettyRingType(this.handlingRules?.transferMode ?? ''),
            holdTime: this.prettyTime(this.handlingRules?.holdTime ?? 0),
            wrapUpTime: this.prettyTime(this.handlingRules?.wrapUpTime ?? 0)
        }
    }

    toDataGidHeader(): any {
        return [
            { field: 'name', headerName: 'Queue Name', width: 350 },
            { field: 'extension', headerName: 'Extension', width: 150 },
            { field: 'site', headerName: 'Site', width: 200 },
            { field: 'members', headerName: 'Members', width: 350 },
            { field: 'ringType', headerName: 'Ring Type', width: 150 },
            { field: 'holdTime', headerName: 'Hold Time', width: 150 },
            { field: 'wrapUpTime', headerName: 'Wrap Up Time', width: 150 }
        ]
    }

    property(key: string): any {
        if (key === 'site') {
            return this.extension.site ?? 'N/A'
        }
        return this[key as keyof CallQueue]
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

    convertTo12HourTime(time: string) {
        const hour = parseInt(time.split(':')[0])
        const minute = time.split(':')[1]
        if (hour === 0) return `12:${minute} AM`
        if (hour === 12) return `12:${minute} PM`
        if (hour < 12) return `${hour}:${minute} AM`
        return `${hour - 12}:${minute} PM`
    }

    prettyNotificationSettings() {
        if (this.sendEmailNotifications && !this.includeAttachment) {
            return 'Send Email'
        }
        else if (this.sendEmailNotifications && this.includeAttachment && !this.markAsRead) {
            return 'Send Email & Attach'
        }
        else if (this.sendEmailNotifications && this.includeAttachment && this.markAsRead) {
            return 'Send Email, Attach, & Mark as Read'
        }
        return ''
    }

    prettyWaitTimeDestination() {
        if (this.handlingRules?.holdTimeExpirationAction === 'TransferToExtension') {
            if (this.handlingRules.transfer) {
                for (const transfer of this.handlingRules.transfer) {
                    if (transfer.action === 'HoldTimeExpiration') {
                        return transfer.extension.extensionNumber
                    }
                }
            }
        }
        else if (this.handlingRules?.holdTimeExpirationAction === 'UnconditionalForwarding') {
            if (this.handlingRules.unconditionalForwarding) {
                for (const transfer of this.handlingRules.unconditionalForwarding) {
                    if (transfer.action === 'HoldTimeExpiration') {
                        return transfer.phoneNumber
                    }
                }
            }
        }
        return ''
    }

    prettyWaitTimeAction() {
        switch (this.handlingRules?.holdTimeExpirationAction) {
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

    prettyMaxCallersAction() {
        switch (this.handlingRules?.maxCallersAction) {
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
        if (this.handlingRules?.maxCallersAction === 'TransferToExtension') {
            if (this.handlingRules.transfer) {
                for (const transfer of this.handlingRules.transfer) {
                    if (transfer.action === 'MaxCallers') {
                        return transfer.extension.extensionNumber
                    }
                }
            }
        }
        else if (this.handlingRules?.maxCallersAction === 'UnconditionalForwarding') {
            if (this.handlingRules.unconditionalForwarding) {
                for (const transfer of this.handlingRules.unconditionalForwarding) {
                    if (transfer.action === 'MaxCallers') {
                        return transfer.phoneNumber
                    }
                }
            }
        }
        return ''
    }

    greeting(name: string) {
        for (const greeting of this.greetings ?? []) {
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

    prettyRingType(rawType: string) {
        if (rawType === 'FixedOrder') {
            return 'Sequential'
        }
        return rawType
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

    prettyGreeting(value: string) {
        if (value === 'Default' || value === 'Ring Tones') return value
        else if (value === 'None') return 'Off'
        else {
            return `Music (${value})`
        }
    }

    prettyAfterHoursAction() {
        switch (this.afterHoursAction) {
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

    sortMembers() {
        this.members.sort((a, b) => {
            if (parseInt(a) < parseInt(b)) return -1
            if (parseInt(a) > parseInt(b)) return 1
            return 0
        })
    }

    createPayload(isMultiSiteEnabled: boolean = true) {
        const payload = {
            extensionNumber: this.extension.extensionNumber,
            type: 'Department',
            contact: {
                firstName: this.extension.name,
                email: this.extension.contact.email,
            },
            ...(isMultiSiteEnabled && this.siteID != 'main-site' && {site: {id: this.siteID}}),
            ...(this.pin != undefined && this.pin != '' && {ivrPin: this.pin}),
            ...(this.pin != undefined && this.pin != '' && {status: 'Enabled'}),
        }
        return payload
    }

    payload() {
        let transferActions: TransferPayload[] = []
        let forwardActions: UnconditionalForwardingPayload[] = []

        if (this.maxWaitTimeDestination) {
            if (this.handlingRules?.holdTimeExpirationAction === 'TransferToExtension') {
                const action: TransferPayload = {
                    extension: {
                        id: this.maxWaitTimeDestination
                    },
                    action: "HoldTimeExpiration"
                }
                transferActions.push(action)
            }
            else if (this.handlingRules?.holdTimeExpirationAction === 'UnconditionalForwarding') {
                const action: UnconditionalForwardingPayload = {
                    phoneNumber: this.maxWaitTimeDestination,
                    action: "HoldTimeExpiration"
                }
                forwardActions.push(action)
            }
        }
        if (this.maxCallersDestination) {
            if (this.handlingRules?.maxCallersAction === 'TransferToExtension') {
                const action: TransferPayload = {
                    extension: {
                        id: this.maxCallersDestination
                    },
                    action: "MaxCallers"
                }
                transferActions.push(action)
            }
            else if (this.handlingRules?.maxCallersAction === 'UnconditionalForwarding') {
                const action: UnconditionalForwardingPayload = {
                    phoneNumber: this.maxCallersDestination,
                    action: 'MaxCallers'
                }
                forwardActions.push(action)
            }
        } 

        const payload = {
            queue: {...this.handlingRules, ...(transferActions.length > 0 && {transfer: [...transferActions]}), ...(forwardActions.length > 0 && {unconditionalForwarding: [...forwardActions]})},
            ...(( this.greetings && this.greetings?.length > 0) && {greetings: [...this.greetings]}),
            ... ((this.voicemailRecipient && this.voicemailRecipient !== '') && {voicemail: {recipient: {id: this.voicemailRecipient}}}),
        }
        return payload
    }

    afterHoursPayload() {
        return {
            'callHandlingAction': this.afterHoursAction,
            ...(this.afterHoursAction === 'UnconditionalForwarding' && { 'unconditionalForwarding': { 'phoneNumber': this.afterHoursDestination } }),
            ...(this.afterHoursAction === 'TransferToExtension' && { 'transfer': { 'extension': {'id': this.afterHoursDestination} } }),
        }
    }

    managersPayload() {
        const managers: CallQueueManager[] = []

        this.managers?.forEach((manager) => {
            managers.push({id: manager, permission: 'FullAccess'})
        })

        return {
            updatedExtensions: managers
        }
    }

    memberStatusPayload() {
        return {
            editableMemberStatus: this.editableMemberStatus === 'Allow' ? true : false
        }
    }

    notificationPayload() {
        return {
            includeManagers: this.managers ? true : false,
            advancedMode: false,
            emailAddresses: this.notificationEmails,
            voicemails: {
                notifyByEmail: this.sendEmailNotifications,
                ...(this.sendEmailNotifications === true && {includeAttachment: this.includeAttachment == true}),
                ...(this.sendEmailNotifications === true && {markAsRead: this.markAsRead === true}),
                notifyBySms: false
            },
            inboundFaxes: {
                notifyByEmail: this.sendEmailNotifications,
                ...(this.sendEmailNotifications === true && {includeAttachment: this.includeAttachment === true}),
                ...(this.sendEmailNotifications === true && {markAsRead: this.markAsRead == true}),
                notifyBySms: false
            },
            outboundFaxes: {
                notifyByEmail: this.sendEmailNotifications,
                notifyBySms: false
            },
            inboundTexts: {
                notifyByEmail: this.sendEmailNotifications,
                notifyBySms: false
            },
            missedCalls: {
                notifyByEmail: this.sendEmailNotifications,
                notifyBySms: false
            }
        }
    }
}

export default CallQueue