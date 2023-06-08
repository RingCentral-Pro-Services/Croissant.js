import { useState } from "react";
import { Extension } from "../../../../models/Extension";
import { Message } from "../../../../models/Message";
import { SyncError } from "../../../../models/SyncError";

const useReadFromFile = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [extensionList, setExtensionList] = useState<Extension[]>([])
    const [isFileReadPending, setIsFileReadPending] = useState(true)

    const readFromFile = (excelData: any, extensions: Extension[]) => {
        const foundExtensions: Extension[] = []

        for (const data of excelData) {
            const targetExtensionNumber = data['Extension Number']
            const extension = extensions.find((ext) => `${ext.data.extensionNumber}` === targetExtensionNumber)

            if (!extension) {
                postMessage(new Message(`Failed to find ID for extension ${data['Extension Name']} - Ext. ${data['Extension Number']}`, 'error'))
                continue
            }

            foundExtensions.push(extension)
        }

        setExtensionList(foundExtensions)
        setIsFileReadPending(false)
    }

    return {readFromFile, extensionList, isFileReadPending}
}

export default useReadFromFile