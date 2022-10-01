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
            let extension = new RCExtension(idForExtension(currentItem['Extension'], extensionsList), currentItem['Extension'], currentItem['Queue Name'], contact, currentItem['Site'], 'Department', '', false, '')
            let memberString: string = currentItem['Members (Ext)']
            let membersExtensions = memberString.split(',')
            let members: string[] = []

            for (let memberIndex = 0; memberIndex < membersExtensions.length; memberIndex++) {
                members.push(`${idForExtension(membersExtensions[memberIndex], extensionsList)}`)
            }
            let validMembers = members.filter((id) => {
                return id !== '0'
            })
            let queue = new CallQueue(extension, idForSite(extension.site, extensionsList), validMembers)
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

    const idForSite = (siteName: string, extensionList: RCExtension[]) => {
        for (let index = 0; index < extensionList.length; index++) {
            if (extensionList[index].name === siteName) {
                return extensionList[index].id
            }
        }
        return 0
    }

    return {convert, queues, isQueueConvertPending}
}

export default useExcelToQueues