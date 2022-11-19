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
        return [this.extension.name, `${this.extension.extensionNumber}`, this.extension.site, this.extension.status, `${this.members}`, this.greeting('Introductory'), this.greeting('ConnectingAudio'), this.greeting('HoldMusic'), this.greeting('Voicemail') , `${this.handlingRules?.holdAudioInterruptionPeriod ?? 'Disabled'}`, this.handlingRules?.holdAudioInterruptionPeriod ? this.greeting('InterruptPrompt') : '' , this.handlingRules?.transferMode ?? '', `${this.handlingRules?.holdTime}`, `${this.handlingRules?.agentTimeout ?? ''}` , this.handlingRules?.holdTimeExpirationAction ?? '' , this.handlingRules?.noAnswerAction ?? '', `${this.handlingRules?.wrapUpTime ?? ''}`]
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
}

export default CallQueue