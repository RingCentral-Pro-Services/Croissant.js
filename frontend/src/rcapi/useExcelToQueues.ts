import { useState } from "react"
import CallQueue from "../models/CallQueue"
import RCExtension from "../models/RCExtension"
import ExtensionContact from "../models/ExtensionContact"

const useExcelToQueues = () => {
    const [queues, setQueues] = useState<CallQueue[]>([])
    const [isQueueConvertPending, setIsQueueConvertPending] = useState(true)

    const convert = (data: any[], extensionsList: RCExtension[]) => {
        let records: CallQueue[] = []

        for (let index = 0; index < data.length; index++) {
            const currentItem = data[index]
            let contact: ExtensionContact = {
                firstName: currentItem['Queue Name'],
                lastName: "",
                email: currentItem['Email']
            }
            let extension = new RCExtension(0, currentItem['Extension'], currentItem['Queue Name'], contact, currentItem['Site'], 'Department', '', false, '')
            let memberString: string = currentItem['Members (Ext)']
            let membersExtensions = memberString.split(',')
            let members: string[] = []

            for (let memberIndex = 0; memberIndex < membersExtensions.length; memberIndex++) {
                members.push(`${idForExtension(membersExtensions[memberIndex], extensionsList)}`)
            }
            let queue = new CallQueue(extension, members)
            records.push(queue)
        }
        setQueues(records)
        setIsQueueConvertPending(false)
    }

    const idForExtension = (extension: string, extensionsList: RCExtension[]) => {
        for (let index = 0; index < extensionsList.length; index++) {
            if (`${extensionsList[index].extensionNumber}` === extension) {
                return extensionsList[index].id
            }
        }
        return 0
    }

    return {convert, queues, isQueueConvertPending}
}

export default useExcelToQueues