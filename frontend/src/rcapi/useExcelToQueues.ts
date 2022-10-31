import { useState } from "react"
import CallQueue from "../models/CallQueue"
import RCExtension from "../models/RCExtension"
import ExtensionContact from "../models/ExtensionContact"
import { Message } from "../models/Message"
import { SyncError } from "../models/SyncError"

const useExcelToQueues = (postMessage: (message: Message) => void, postError: (error: SyncError) => void) => {
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
            let extension = new RCExtension(idForQueue(currentItem['Extension'], extensionsList), currentItem['Extension'], currentItem['Queue Name'], contact, currentItem['Site'], 'Department', '', false, '')
            let memberString: string = currentItem['Members (Ext)']
            let membersExtensions = memberString.split(',')
            let members: string[] = []
            let removedExtensions: string[] = []

            membersExtensions.map((extension) => {
                if (!isValidQueueMember(extension.trim(), extensionsList)) {
                    removedExtensions.push(extension)
                }
            })

            membersExtensions = membersExtensions.filter((extension) => {
                return isValidQueueMember(extension.trim(), extensionsList)
            })

            for (let memberIndex = 0; memberIndex < membersExtensions.length; memberIndex++) {
                members.push(`${idForExtension(membersExtensions[memberIndex].trim(), extensionsList)}`)
            }

            let validMembers = members.filter((id) => {
                return id !== '0'
            })

            if (removedExtensions.length > 0) {
                postMessage(new Message(`The following members were removed from ${contact.firstName} - Ext ${extension.extensionNumber} because they either don't exist or they are not valid queue members: ${removedExtensions.join(', ')}`, 'warning'))
                postError(new SyncError(contact.firstName, extension.extensionNumber, ['Removed invalid queue members', removedExtensions.join(', ')]))
            }

            let queue = new CallQueue(extension, idForSite(extension.site, extensionsList), validMembers)
            records.push(queue)
        }
        setQueues(records)
        setIsQueueConvertPending(false)
    }

    const idForQueue = (extension: string, extensionsList: RCExtension[]) => {
        for (let index = 0; index < extensionsList.length; index++) {
            if (`${extensionsList[index].extensionNumber}` == extension && extensionsList[index].type === 'Department') {
                return extensionsList[index].id
            }
        }
        return 0
    }

    const idForExtension = (extension: string, extensionsList: RCExtension[]) => {
        for (let index = 0; index < extensionsList.length; index++) {
            if (`${extensionsList[index].extensionNumber}` == extension) {
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

    const isValidQueueMember = (extensionNumber: string, extensionList: RCExtension[]) => {
        for (let index = 0; index < extensionList.length; index++) {
            if (`${extensionList[index].extensionNumber}`=== extensionNumber) {
                return extensionList[index].type === 'User' || extensionList[index].type === 'VirtualUser'
            }
        }
        return false
    }

    return {convert, queues, isQueueConvertPending}
}

export default useExcelToQueues