import CSVFormattable from "./CSVFormattable";
import ExcelFormattable from "./ExcelFormattable";
import { DataTableFormattable } from "./DataTableFormattable";
import RCExtension from "./RCExtension";
import { CallHandlingRules } from "./CallHandlingRules";
import { Greeting } from "./Greetings";

class CallQueue implements CSVFormattable, ExcelFormattable, DataTableFormattable {
    constructor(public extension: RCExtension, public siteID: number, public members: string[], public handlingRules?: CallHandlingRules, public greetings?: Greeting[]) {}

    toRow(): string {
        return `${this.extension.name},${this.extension.extensionNumber},${this.extension.site},${this.extension.status},"${this.members}"`
    }

    toExcelRow(): string[] {
        // Header: ['Queue Name', 'Extension', 'Site', 'Status', 'Members (Ext)', 'Greeting', 'Audio While Connecting', 'Hold Music', 'Voicemail', 'Interrupt Audio', 'Interrupt Prompt', 'Ring type', 'Total Ring Time', 'User Ring Time' , 'Max Wait Time Action', 'No Answer Action', 'Wrap Up Time']
        return [this.extension.name, `${this.extension.extensionNumber}`, this.extension.site, this.extension.status, `${this.members}`, this.prettyGreeting(this.greeting('Introductory')), this.prettyGreeting(this.greeting('ConnectingAudio')), this.prettyGreeting(this.greeting('HoldMusic')), this.prettyGreeting(this.greeting('Voicemail')), this.prettyInterruptPeriod(this.handlingRules?.holdAudioInterruptionMode ?? '', this.handlingRules?.holdAudioInterruptionPeriod ?? 0), this.handlingRules?.holdAudioInterruptionPeriod ? this.greeting('InterruptPrompt') : '' , this.prettyRingType(this.handlingRules?.transferMode ?? ''), this.prettyTime(this.handlingRules?.holdTime ?? 0), this.prettyTime(this.handlingRules?.agentTimeout ?? 0) , this.handlingRules?.holdTimeExpirationAction ?? '' , this.handlingRules?.noAnswerAction ?? '', this.prettyTime(this.handlingRules?.wrapUpTime ?? 0)]
    }

    toDataTableRow(): string[] {
        return [this.extension.name, `${this.extension.extensionNumber}`, this.extension.site, this.extension.status, `${this.members}`]
    }

    greeting(name: string) {
        for (const greeting of this.greetings ?? []) {
            if (greeting.type === name) {
                return greeting.preset.name
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
}

export default CallQueue