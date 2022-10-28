import CSVFormattable from "./CSVFormattable"
import ExcelFormattable from "./ExcelFormattable"
import { DataTableFormattable } from "./DataTableFormattable"

export class IVRMenu implements CSVFormattable, ExcelFormattable, DataTableFormattable {
    constructor(public data: IVRMenuData, public page?: string, public lucidchartID?: string, public audioPromptFilename?: string) {}

    toRow(): string {
        return `${this.data.name},${this.data.extensionNumber},${this.data.site.id},${this.data.prompt.mode},${this.data.prompt.text}`
    }

    toExcelRow(): string[] {
        let result = [this.data.name, `${this.data.extensionNumber}`, this.data.site ? this.data.site.name : 'Main Site', this.data.prompt.mode, this.data.prompt.mode === 'Audio' ? this.audioPromptFilename ?? '0' : this.data.prompt.text ?? '',]
        let actions = this.excelActionsToRow()

        result = [...result, ...actions]
        
        return result
    }

    toDataTableRow(): string[] {
        let result = [this.data.name, `${this.data.extensionNumber}`, this.data.site ? this.data.site.name : 'Main Site', this.data.prompt.mode, this.data.prompt.mode === 'Audio' ? this.audioPromptFilename ?? '0' : this.data.prompt.text ?? '']
        let actions = this.actionsToRow()

        result = [...result, ...actions]
        
        return result
    }

    actionsToRow(): string[] {
        let result: string[] = []

        for (let keyPressIndex = 1; keyPressIndex < 10; keyPressIndex++) {
            let found = false
            for (let actionIndex = 0; actionIndex < this.data.actions.length; actionIndex++) {
                if (this.data.actions[actionIndex].input === `${keyPressIndex}`) {
                    if (this.data.actions[actionIndex].action === 'Transfer') {
                        let cellText = `${this.data.actions[actionIndex].action} to ${this.data.actions[actionIndex].phoneNumber}`
                        result.push(cellText)
                        found = true
                    }
                    else if (this.data.actions[actionIndex].action === 'Connect') {
                        let cellText = `${this.data.actions[actionIndex].action} to ${this.data.actions[actionIndex].extension?.id}`
                        result.push(cellText)
                        found = true
                    }
                    else if (this.data.actions[actionIndex].action === 'Voicemail') {
                        let cellText = `${this.data.actions[actionIndex].action} of ${this.data.actions[actionIndex].extension?.id}`
                        result.push(cellText)
                        found = true
                    }
                    else {
                        let cellText = `${this.data.actions[actionIndex].action}`
                        result.push(cellText)
                        found = true
                    }
                }
            }
            if (!found) {
                result.push("")
            }
        }

        let zeroKeyFound = false
        for (let actionIndex = 0; actionIndex < this.data.actions.length; actionIndex++) {
            if (this.data.actions[actionIndex].input === `0`) {
                if (this.data.actions[actionIndex].action === 'Transfer') {
                    let cellText = `${this.data.actions[actionIndex].action} to ${this.data.actions[actionIndex].phoneNumber}`
                    result.push(cellText)
                    zeroKeyFound = true
                }
                else if (this.data.actions[actionIndex].action === 'Connect') {
                    let cellText = `${this.data.actions[actionIndex].action} to ${this.data.actions[actionIndex].extension?.id}`
                    result.push(cellText)
                    zeroKeyFound = true
                }
                else if (this.data.actions[actionIndex].action === 'Voicemail') {
                    let cellText = `${this.data.actions[actionIndex].action} of ${this.data.actions[actionIndex].extension?.id}`
                    result.push(cellText)
                    zeroKeyFound = true
                }
                else {
                    let cellText = `${this.data.actions[actionIndex].action}`
                    result.push(cellText)
                    zeroKeyFound = true
                }
                zeroKeyFound = true
            }
        }
        if (!zeroKeyFound) {
            result.push("")
        }

        return result
    }

    excelActionsToRow () {
        let result: string[] = []

        for (let keyPressIndex = 1; keyPressIndex < 10; keyPressIndex++) {
            let found = false
            for (let actionIndex = 0; actionIndex < this.data.actions.length; actionIndex++) {
                if (this.data.actions[actionIndex].input === `${keyPressIndex}`) {
                    if (this.data.actions[actionIndex].action === 'Transfer') {
                        result.push(prettyType(this.data.actions[actionIndex].action))
                        result.push(this.data.actions[actionIndex].phoneNumber!)
                        found = true
                    }
                    else if (this.data.actions[actionIndex].action === 'Connect') {
                        result.push(prettyType(this.data.actions[actionIndex].action))
                        result.push(this.data.actions[actionIndex].extension!.id)
                        found = true
                    }
                    else if (this.data.actions[actionIndex].action === 'Voicemail') {
                        result.push(prettyType(this.data.actions[actionIndex].action))
                        result.push(this.data.actions[actionIndex].extension!.id)
                        found = true
                    }
                    else {
                        result.push(prettyType(this.data.actions[actionIndex].action))
                        result.push('')
                        found = true
                    }
                }
            }
            if (!found) {
                result.push("")
                result.push("")
            }
        }

        let zeroKeyFound = false
        for (let actionIndex = 0; actionIndex < this.data.actions.length; actionIndex++) {
            if (this.data.actions[actionIndex].input === `0`) {
                if (this.data.actions[actionIndex].action === 'Transfer') {
                    let cellText = `${this.data.actions[actionIndex].action} to ${this.data.actions[actionIndex].phoneNumber}`
                    result.push(cellText)
                    zeroKeyFound = true
                }
                else if (this.data.actions[actionIndex].action === 'Connect') {
                    let cellText = `${this.data.actions[actionIndex].action} to ${this.data.actions[actionIndex].extension?.id}`
                    result.push(cellText)
                    zeroKeyFound = true
                }
                else if (this.data.actions[actionIndex].action === 'Voicemail') {
                    let cellText = `${this.data.actions[actionIndex].action} of ${this.data.actions[actionIndex].extension?.id}`
                    result.push(cellText)
                    zeroKeyFound = true
                }
                else {
                    let cellText = `${this.data.actions[actionIndex].action}`
                    result.push(cellText)
                    zeroKeyFound = true
                }
                zeroKeyFound = true
            }
        }
        if (!zeroKeyFound) {
            result.push("")
        }

        return result
    }
}

const prettyType = (rawType: string) => {
    switch (rawType) {
        case 'Connect':
            return 'Connect To Extension'
        case 'Voicemail':
            return 'Transfer to Voicemail of'
        case 'DialByName':
            return 'Connect to Dial-by-Name Directory'
        case 'Transfer':
            return 'External Transfer'
        case 'RepeatMenuGreeting':
            return 'Repeat the Menu'
        case 'ReturnToPreviousMenu':
            return 'Return to the Previous Menu'
        case 'ReturnToRootMenu':
            return 'Return to the Root Menu'
        default:
            return rawType
    }
}

export interface IVRMenuData {
    uri: string
    name: string
    extensionNumber: number
    prompt: IVRPrompt
    site: Site
    actions: IVRAction[]
    id?: string
}

export interface IVRPrompt {
    mode: string
    text?: string
    audio?: IVRaudioPrompt
}

export interface IVRaudioPrompt {
    uri: string
    id: string
}

export interface IVRAction {
    input: string
    action: string
    extension?: IVRDestination
    phoneNumber?: string
}

export interface IVRDestination {
    id: string
    uri?: string
}

export interface Site {
    name: string
    id: string
}