import { Extension } from "../../../../models/Extension";
import { Message } from "../../../../models/Message";
import { SyncError } from "../../../../models/SyncError";
import { ExtensionCredentials } from "../models/ExtensionCredentials";
import { SecretQuestion } from "../models/SecretQuestion";

const useReadCredentials = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const readCredentials = (excelData: any[], secretQuestions: SecretQuestion[], extensions: Extension[]) => {
        const credentials: ExtensionCredentials[] = []

        for (const item of excelData) {
            const extension = extensions.find((ext) => `${ext.data.extensionNumber}` === item['Extension Number'])
            if (!extension) {
                postMessage(new Message(`Failed to find extension ${item['Extension Number']}. Credentials will not be set`, 'error'))
                postError(new SyncError(item.extensionNumber, '', ['Failed to find extension'], '', item))
                continue
            }

            if ((extension.data.status !== 'Enabled') && isMissingCredentials(item)) {
                postMessage(new Message(`Extension ${item['Extension Number']} is not activated. You must provide a password, PIN, security question, and security answer`, 'warning'))
                postError(new SyncError(extension.data.name, extension.data.extensionNumber, ['Extension is not activated. Password and PIN required'], '', item))
                continue

            }

            const secretQuestion = secretQuestions.find((sq) => sq.questionText === item['Security Question'])
            if (extension.data.status !== 'Enabled' && !secretQuestion) {
                postMessage(new Message(`Failed to find secret question ${item['Security Question']} for ${extension.data.name}. Credentials will not be set`, 'error'))
                postError(new SyncError(extension.data.name, extension.data.extensionNumber, ['Failed to find secret question'], '', item))
                continue
            }

            const credential = new ExtensionCredentials({
                extension,
                password: item['Password'],
                pin: item['PIN'],
                secretQuestion: secretQuestion,
                secretAnswer: item['Security Question Answer']
            })

            credentials.push(credential)
        }

        return credentials
    }

    const isMissingCredentials = (item: any) => {
        if (!item['Password']) {
            return true
        }

        if (!item['PIN']) {
            return true
        }

        if (!item['Security Question']) {
            return true
        }

        return false
    }

    return { readCredentials }
}

export default useReadCredentials