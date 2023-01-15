import CSVFormattable from "./CSVFormattable"
import ExcelFormattable from "./ExcelFormattable"
import { DataTableFormattable } from "./DataTableFormattable"
import { DataGridFormattable } from "./DataGridFormattable"
import { PhoneNumber } from "./PhoneNumber"

export class IVRMenu implements CSVFormattable, ExcelFormattable, DataTableFormattable, DataGridFormattable {
    constructor(public data: IVRMenuData, public page?: string, public lucidchartID?: string, public audioPromptFilename?: string, public phoneNumbers?: PhoneNumber[]) {}

    toRow(): string {
        return `${this.data.name},${this.data.extensionNumber},${this.data.site.id},${this.data.prompt.mode},${this.data.prompt.text}`
    }

    toExcelRow(): string[] {
        let result = [this.data.name, `${this.data.extensionNumber}`, this.phoneNumbers?.map((p) => p.phoneNumber).join(', ') ?? '' , this.data.site ? this.data.site.name : 'Main Site', this.data.prompt.mode, this.data.prompt.mode === 'Audio' ? this.audioPromptFilename ?? '0' : this.data.prompt.text ?? '',]
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

    toDataGridRow(): any {
        let result = {
            id: this.data.id,
            name: this.data.name,
            extensionNumber: this.data.extensionNumber,
            site: this.data.site ? this.data.site.name : 'Main Site',
            prompt: this.data.prompt.mode === 'Audio' ? this.audioPromptFilename ?? '0' : this.data.prompt.text ?? '',
            key1: this.actionText(`1`),
            key2: this.actionText(`2`),
            key3: this.actionText(`3`),
            key4: this.actionText(`4`),
            key5: this.actionText(`5`),
            key6: this.actionText(`6`),
            key7: this.actionText(`7`),
            key8: this.actionText(`8`),
            key9: this.actionText(`9`),
            key0: this.actionText(`0`),
            keyHash: this.actionText(`Hash`),
            keyStar: this.actionText(`Star`)
        }

        return result
    }

    toDataGidHeader(): any {
        let result = [
            { field: 'name', headerName: 'Name', width: 200 },
            { field: 'extensionNumber', headerName: 'Extension Number', width: 200 },
            { field: 'site', headerName: 'Site', width: 200 },
            { field: 'prompt', headerName: 'Prompt', width: 200 },
            { field: 'key1', headerName: 'Key 1', width: 200 },
            { field: 'key2', headerName: 'Key 2', width: 200 },
            { field: 'key3', headerName: 'Key 3', width: 200 },
            { field: 'key4', headerName: 'Key 4', width: 200 },
            { field: 'key5', headerName: 'Key 5', width: 200 },
            { field: 'key6', headerName: 'Key 6', width: 200 },
            { field: 'key7', headerName: 'Key 7', width: 200 },
            { field: 'key8', headerName: 'Key 8', width: 200 },
            { field: 'key9', headerName: 'Key 9', width: 200 },
            { field: 'key0', headerName: 'Key 0', width: 200 },
            { field: 'keyHash', headerName: 'Key #', width: 200 },
            { field: 'keyStar', headerName: 'Key *', width: 200 }
        ]

        return result
    }

    property(key: string): any {
        if (key === 'site') {
            return this.data.site.name ?? 'N/A'
        }
        return this[key as keyof IVRMenu]
    }

    actionText(key: string) {
        let result = ''
        for (let actionIndex = 0; actionIndex < this.data.actions.length; actionIndex++) {
            if (this.data.actions[actionIndex].input === key) {
                if (this.data.actions[actionIndex].action === 'Transfer') {
                    result = `${this.data.actions[actionIndex].action} to ${this.data.actions[actionIndex].phoneNumber}`
                }
                else if (this.data.actions[actionIndex].action === 'Connect') {
                    result = `${this.data.actions[actionIndex].action} to ${this.data.actions[actionIndex].extension?.id}`
                }
                else if (this.data.actions[actionIndex].action === 'Voicemail') {
                    result = `${this.data.actions[actionIndex].action} of ${this.data.actions[actionIndex].extension?.id}`
                }
                else {
                    result = `${this.data.actions[actionIndex].action}`
                }
            }
        }
        return result
    }

    payload(isMultiSiteEnabled: boolean = true, includeActions: boolean = true) {
        return {
            name: this.data.name,
            extensionNumber: this.data.extensionNumber,
            prompt: this.data.prompt,
            ...(includeActions && { actions: this.data.actions }),
            ...(isMultiSiteEnabled && {site: {id: this.data.site.id}})
        }
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

        let poundKeyFound = false
        for (let actionIndex = 0; actionIndex < this.data.actions.length; actionIndex++) {
            if (this.data.actions[actionIndex].input === `Hash`) {
                result.push(prettyType(this.data.actions[actionIndex].action))
                poundKeyFound = true
            }
        }
        if (!poundKeyFound) {
            result.push("")
        }

        // Special Keys
        let starKeyFound = false
        for (let actionIndex = 0; actionIndex < this.data.actions.length; actionIndex++) {
            if (this.data.actions[actionIndex].input === `Star`) {
                result.push(prettyType(this.data.actions[actionIndex].action))
                starKeyFound = true
            }
        }
        if (!starKeyFound) {
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
                    result.push(prettyType(this.data.actions[actionIndex].action))
                    result.push(this.data.actions[actionIndex].phoneNumber!)
                    zeroKeyFound = true
                }
                else if (this.data.actions[actionIndex].action === 'Connect') {
                    result.push(prettyType(this.data.actions[actionIndex].action))
                    result.push(this.data.actions[actionIndex].extension!.id)
                    zeroKeyFound = true
                }
                else if (this.data.actions[actionIndex].action === 'Voicemail') {
                    result.push(prettyType(this.data.actions[actionIndex].action))
                    result.push(this.data.actions[actionIndex].extension!.id)
                    zeroKeyFound = true
                }
                else {
                    result.push(prettyType(this.data.actions[actionIndex].action))
                    result.push('')
                    zeroKeyFound = true
                }
                zeroKeyFound = true
            }
        }
        if (!zeroKeyFound) {
            result.push("")
            result.push("")
        }

        let poundKeyFound = false
        for (let actionIndex = 0; actionIndex < this.data.actions.length; actionIndex++) {
            if (this.data.actions[actionIndex].input === `Hash`) {
                result.push(prettyType(this.data.actions[actionIndex].action))
                poundKeyFound = true
            }
        }
        if (!poundKeyFound) {
            result.push("")
        }

        // Special Keys
        let starKeyFound = false
        for (let actionIndex = 0; actionIndex < this.data.actions.length; actionIndex++) {
            if (this.data.actions[actionIndex].input === `Star`) {
                result.push(prettyType(this.data.actions[actionIndex].action))
                starKeyFound = true
            }
        }
        if (!starKeyFound) {
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
        case 'Repeat':
            return 'Repeat the Menu'
        case 'ReturnToRoot':
            return 'Return to the Root Menu'
        case 'ReturnToPrevious':
            return 'Return to the Previous Menu'
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