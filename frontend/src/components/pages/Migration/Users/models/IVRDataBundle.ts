import { Extension } from "../../../../../models/Extension";
import { PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class IVRDataBundle {
    public hasEncounteredFatalError = false
    
    constructor(public extension: Extension, public extendedData?: IVRExtendedData, public phoneNumberMap?: Map<string, string>) {}

    payload() {
        console.log('IVR payload generation')
        console.log(this)
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
    }
    phoneNumber: string
}

export interface AudioPrompt {
    
}
