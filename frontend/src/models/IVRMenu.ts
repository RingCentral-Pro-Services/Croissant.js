import CSVFormattable from "./CSVFormattable"
import ExcelFormattable from "./ExcelFormattable"

export class IVRMenu implements CSVFormattable, ExcelFormattable {
    constructor(public data: IVRMenuData) {}

    toRow(): string {
        return `${this.data.name},${this.data.extensionNumber},${this.data.site.id},${this.data.prompt.mode},${this.data.prompt.text}`
    }

    toExcelRow(): string[] {
        let result = [this.data.name, `${this.data.extensionNumber}`, this.data.site.id, this.data.prompt.mode, this.data.prompt.text]
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
    text: string
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