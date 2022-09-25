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
                    result.push(this.data.actions[actionIndex].action)
                    if (this.data.actions[actionIndex].action === 'Transfer') {
                        result.push(this.data.actions[actionIndex].phoneNumber ?? "")
                        found = true
                    }
                    else {
                        result.push(this.data.actions[actionIndex].extension?.id ?? "")
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
                result.push(this.data.actions[actionIndex].action)
                result.push(this.data.actions[actionIndex].extension?.id ?? "")
                zeroKeyFound = true
            }
        }
        if (!zeroKeyFound) {
            result.push("")
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