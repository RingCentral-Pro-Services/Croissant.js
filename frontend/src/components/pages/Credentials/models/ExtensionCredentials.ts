import { DataGridFormattable } from "../../../../models/DataGridFormattable";
import { Extension } from "../../../../models/Extension";
import { SecretQuestion } from "./SecretQuestion";

export interface ExtensionCredentialsData {
    extension: Extension
    password: string
    pin: string
    secretQuestion: SecretQuestion | undefined
    secretAnswer: string
}

export class ExtensionCredentials implements DataGridFormattable {
    constructor(public data: ExtensionCredentialsData) {}

    payload() {
        return {
            ...(this.data.password && this.data.password.length > 0 && { password: this.data.password }),
            ...(this.data.pin && this.data.pin.length > 0 && { ivrPin: this.data.pin }),
            ... (this.data.secretQuestion && this.data.secretAnswer && { secretQuestion: { id: this.data.secretQuestion.id, answer: this.data.secretAnswer }}),
        }
    }

    toDataGridRow(): any {
        return {
            id: this.data.extension.data.id,
            extensionName: this.data.extension.data.name,
            password: this.data.password,
            pin: this.data.pin,
            question: this.data.secretQuestion?.questionText ?? '',
            answer: this.data.secretAnswer ?? ''
        }
    }

    toDataGidHeader(): any {
        return [
            { field: 'extensionName', headerName: 'Extension Name', width: 200 },
            { field: 'password', headerName: 'Password', width: 200 },
            { field: 'pin', headerName: 'PIN', width: 100 },
            { field: 'question', headerName: 'Security Question', width: 300 },
            { field: 'answer', headerName: 'Security Question Answer', width: 300 },
        ]
    }

    property(key: string): any {
        return this.data[key as keyof ExtensionCredentialsData]
    }
}