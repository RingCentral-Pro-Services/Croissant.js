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

class CallQueue implements CSVFormattable, ExcelFormattable, DataTableFormattable, DataGridFormattable {
    constructor(
        public extension: RCExtension,
        public siteID: number,
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
        public editableMemberStatus?: string
        ) {
        this.sortMembers()
    }

    toRow(): string {
        return `${this.extension.name},${this.extension.extensionNumber},${this.extension.site},${this.extension.status},"${this.members}"`
    }

    toExcelRow(): string[] {
        // Header: ['Queue Name', 'Extension', 'Site', 'Status', 'Members (Ext)', 'Greeting', 'Audio While Connecting', 'Hold Music', 'Voicemail', 'Interrupt Audio', 'Interrupt Prompt', 'Ring type', 'Total Ring Time', 'User Ring Time' , 'Max Wait Time Action', 'No Answer Action', 'Wrap Up Time']
        return [this.extension.name, this.extension.contact.pronouncedName?.type === 'Recorded' ? 'Custom Audio' : this.extension.contact.pronouncedName?.text ?? '', `${this.extension.extensionNumber}`, this.extension.site, this.extension.status, this.phoneNumbers?.map((p) => p.phoneNumber).join(', ') || '', this.managers?.join(',') || '', this.extension.contact.email ?? '', `${this.members}`, this.prettyGreeting(this.greeting('Introductory')), this.prettyGreeting(this.greeting('ConnectingAudio')), this.prettyGreeting(this.greeting('HoldMusic')), this.prettyInterruptPeriod(this.handlingRules?.holdAudioInterruptionMode ?? '', this.handlingRules?.holdAudioInterruptionPeriod ?? 0), this.handlingRules?.holdAudioInterruptionPeriod ? this.greeting('InterruptPrompt') : '' , this.prettyRingType(this.handlingRules?.transferMode ?? ''), this.prettyTime(this.handlingRules?.agentTimeout ?? 0), this.prettyTime(this.handlingRules?.holdTime ?? 0), this.prettyTime(this.handlingRules?.wrapUpTime ?? 0), this.editableMemberStatus ?? '', `${this.handlingRules?.maxCallers}`, this.prettyMaxCallersAction(), this.prettyMaxCallersDestination() ?? '' , this.prettyWaitTimeAction() , this.prettyWaitTimeDestination() ?? '', this.greeting('Voicemail'), '', '', '', this.prettyAfterHoursAction(), this.afterHoursDestination ?? '']
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
                return 'Transfer to Extension'
            case 'UnconditionalForwarding':
                return 'Forward to External'
            case 'Voicemail':
                return 'Voicemail'
            default:
                return ''
        }
    }

    prettyMaxCallersAction() {
        switch (this.handlingRules?.maxCallersAction) {
            case 'TransferToExtension':
                return 'Transfer to Extension'
            case 'UnconditionalForwarding':
                return 'Forward to External'
            case 'Voicemail':
                return 'Voicemail'
            case 'Announcement':
                return 'Play Greeting and Disconnect'
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
        console.log(`Interrupt Mode: ${interruptMode}`)
        console.log(`Interrupt Perdiod: ${interruptPeriod}`)

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
                return 'Transfer to Extension'
            case 'UnconditionalForwarding':
                return 'Forward to External'
            case 'TakeMessagesOnly':
                return 'Send to Voicemail'
            case 'PlayAnnouncementOnly':
                return 'Play an Announcement'
            default:
                return ''
        }
    }

    sortMembers() {
        console.log('Sorting members')
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
            ...(isMultiSiteEnabled && {site: {id: this.siteID === 0 ? 'main-site' : this.siteID}}),
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
            queue: {...this.handlingRules, ...(transferActions.length > 0 && {transfer: [...transferActions]}), ...(forwardActions.length > 0 && {unconditionalForwarding: [...forwardActions]})}
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
}

export default CallQueue