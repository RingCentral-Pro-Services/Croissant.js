import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Extension } from "../../../../../models/Extension";
import { PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class IVRDataBundle implements ExcelFormattable {
    public hasEncounteredFatalError = false
    
    constructor(public extension: Extension, public extendedData?: IVRExtendedData, public phoneNumberMap?: Map<string, PhoneNumber>) {}

    toExcelRow(): string[] {
        return [
            '', // Initial upon completion. Ignored
            this.extension.data.name,
            this.extension.data.extensionNumber,
            this.extension.data.site?.name ?? '',
            this.extendedData?.directNumbers?.map((number) => number.phoneNumber).join(', ') ?? '',
            this.getTempNumbers(),
            this.extension.data.regionalSettings?.language.name ?? '',
            this.extendedData?.ivrData?.prompt ? this.extendedData.ivrData.prompt.mode : 'No Prompt',
            this.extendedData?.ivrData?.prompt ? this.prettyPrompt() ?? '' : 'No Prompt',
            ...this.excelActionsToRow()
        ]
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

    prettyPrompt() {
        if (this.extendedData?.ivrData?.prompt?.mode === 'TextToSpeech') return this.extendedData.ivrData.prompt.text
        if (this.extendedData?.ivrData?.prompt?.audio) return this.extendedData.ivrData.prompt.audio.displayName
        return 'No Prompt'
    }

    excelActionsToRow () {
        let result: string[] = []
        if (!this.extendedData?.ivrData?.actions) return result

        for (let keyPressIndex = 1; keyPressIndex < 10; keyPressIndex++) {
            let found = false
            for (let actionIndex = 0; actionIndex < this.extendedData.ivrData.actions.length; actionIndex++) {
                if (this.extendedData?.ivrData?.actions[actionIndex].input === `${keyPressIndex}`) {
                    if (this.extendedData.ivrData.actions[actionIndex].action === 'Transfer') {
                        result.push(prettyType(this.extendedData.ivrData.actions[actionIndex].action))
                        result.push(this.extendedData.ivrData.actions[actionIndex].phoneNumber!)
                        found = true
                    }
                    else if (this.extendedData.ivrData.actions[actionIndex].action === 'Connect') {
                        result.push(prettyType(this.extendedData.ivrData.actions[actionIndex].action))
                        result.push(this.extendedData.ivrData.actions[actionIndex].extension!.extensionNumber!)
                        found = true
                    }
                    else if (this.extendedData.ivrData.actions[actionIndex].action === 'Voicemail') {
                        result.push(prettyType(this.extendedData.ivrData.actions[actionIndex].action))
                        result.push(this.extendedData.ivrData.actions[actionIndex].extension!.extensionNumber!)
                        found = true
                    }
                    else {
                        result.push(prettyType(this.extendedData.ivrData.actions[actionIndex].action))
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
        for (let actionIndex = 0; actionIndex < this.extendedData.ivrData.actions.length; actionIndex++) {
            if (this.extendedData.ivrData.actions[actionIndex].input === `0`) {
                if (this.extendedData.ivrData.actions[actionIndex].action === 'Transfer') {
                    result.push(prettyType(this.extendedData.ivrData.actions[actionIndex].action))
                    result.push(this.extendedData.ivrData.actions[actionIndex].phoneNumber!)
                    zeroKeyFound = true
                }
                else if (this.extendedData.ivrData.actions[actionIndex].action === 'Connect') {
                    result.push(prettyType(this.extendedData.ivrData.actions[actionIndex].action))
                    result.push(this.extendedData.ivrData.actions[actionIndex].extension!.extensionNumber!)
                    zeroKeyFound = true
                }
                else if (this.extendedData.ivrData.actions[actionIndex].action === 'Voicemail') {
                    result.push(prettyType(this.extendedData.ivrData.actions[actionIndex].action))
                    result.push(this.extendedData.ivrData.actions[actionIndex].extension!.extensionNumber!)
                    zeroKeyFound = true
                }
                else {
                    result.push(prettyType(this.extendedData.ivrData.actions[actionIndex].action))
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
        for (let actionIndex = 0; actionIndex < this.extendedData.ivrData.actions.length; actionIndex++) {
            if (this.extendedData.ivrData.actions[actionIndex].input === `Hash`) {
                result.push(prettyType(this.extendedData.ivrData.actions[actionIndex].action))
                poundKeyFound = true
            }
        }
        if (!poundKeyFound) {
            result.push("")
        }

        // Special Keys
        let starKeyFound = false
        for (let actionIndex = 0; actionIndex < this.extendedData.ivrData.actions.length; actionIndex++) {
            if (this.extendedData.ivrData.actions[actionIndex].input === `Star`) {
                result.push(prettyType(this.extendedData.ivrData.actions[actionIndex].action))
                starKeyFound = true
            }
        }
        if (!starKeyFound) {
            result.push("")
        }

        return result
    }

    payload() {
        return {
            name: this.extension.data.name,
            extensionNumber: this.extension.data.extensionNumber,
            ...((this.extension.data.site?.name !== 'Main Site') && {site: {id: this.extension.data.site?.id}})
            // site: {
            //     id: this.extension.data.site?.id
            // }
        }
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

export interface IVRExtendedData {
    directNumbers?: PhoneNumber[]
    ivrData?: IVRData
}

export interface IVRData {
    id: string
    uri?: string
    name: string
    extensionNumber: string
    site?: {
        id: string
        name: string
    }
    prompt?: IVRPrompt
    actions?: IVRKey[]
}

export interface IVRPrompt {
    mode: string
    audio?: {
        uri?: string
        id: string
        displayName?: string
    }
    text?: string
    language?: {
        uri?: string
        id: string
        name: string
        localeCode: string
    }
}

export interface IVRKey {
    input: string
    action: string
    extension?: {
        uri?: string
        id: string
        name?: string
        extensionNumber?: string
    }
    phoneNumber: string
}

export interface AudioPrompt {
    
}
