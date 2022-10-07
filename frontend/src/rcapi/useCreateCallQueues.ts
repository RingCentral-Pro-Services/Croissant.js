import { useEffect, useState } from "react"
import CallQueue from "../models/CallQueue"
import { Message } from "../models/Message";
import RCExtension from "../models/RCExtension";
import { RestCentral } from "./RestCentral";

const useCreateCallQueues = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void) => {
    const [queues, setQueues] = useState<CallQueue[]>([])
    let [shouldFetch, setShouldFetch] = useState(false)
    let [shouldUpdateQueues, setShouldUpdateQueues] = useState(false)
    let [rateLimitInterval, setRateLimitInterval] = useState(0)
    let [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    let [isCallQueueCreationPending, setIsPending] = useState(true)
    const accessToken = localStorage.getItem('cs_access_token')
    const url = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId/bulk-assign'
    const [extensionList, setExtensionList] = useState<RCExtension[]>([])

    const createQueues = (callQueues: CallQueue[], extensions: RCExtension[]) => {
        console.log(`Creating ${callQueues.length} queues`)
        setExtensionList(extensions)
        setQueues(callQueues)
        setShouldFetch(true)
        setCurrentExtensionIndex(0)
    }

    // Create queues
    useEffect(() => {
        if (!shouldFetch) return
        if (currentExtensionIndex === queues.length) {
            setShouldFetch(false)
            setCurrentExtensionIndex(0)
            setShouldUpdateQueues(true)
            return
        }

        let targetUID = localStorage.getItem('target_uid')
        if (!targetUID) return

        const extensionURL = url

        if (extensionExists(queues[currentExtensionIndex].extension.extensionNumber, extensionList)) {
            setCurrentExtensionIndex(currentExtensionIndex + 1)
            return
        }

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
                const body = {
                    extensionNumber: queues[currentExtensionIndex].extension.extensionNumber,
                    type: 'Department',
                    contact: {
                        firstName: queues[currentExtensionIndex].extension.name,
                        email: queues[currentExtensionIndex].extension.contact.email
                    }
                }
                let response = await RestCentral.post(extensionURL, headers, body)
                console.log(response)

                queues[currentExtensionIndex].extension.id = response.data.id
                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                setRateLimitInterval(response.rateLimitInterval)
                if (currentExtensionIndex !== queues.length - 1) {
                    increaseProgress()
                    setCurrentExtensionIndex(currentExtensionIndex + 1)
                }
                else {
                    setCurrentExtensionIndex(0)
                    setShouldFetch(false)
                    setShouldUpdateQueues(true)
                    setRateLimitInterval(0)
                    console.log('Finished creating queues')
                }
            }
            catch (e) {
                console.log('Something bad happened')
                console.log(e)
                postMessage(new Message(`Failed to create queue '${queues[currentExtensionIndex].extension.name}'`, 'error'))
            }
        }, rateLimitInterval)

    }, [shouldFetch, currentExtensionIndex, queues, url, accessToken, extensionList, rateLimitInterval])

    // Add queue members
    useEffect(() => {
        if (!shouldUpdateQueues) return
        if (currentExtensionIndex === queues.length) return

        let targetUID = localStorage.getItem('target_uid')
        if (!targetUID) return

        let queueURL = baseUpdateURL
        queueURL = queueURL.replace('groupId', `${queues[currentExtensionIndex].extension.id}`)

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
                const body = {addedExtensionIds: queues[currentExtensionIndex].members}
                let response = await RestCentral.post(queueURL, headers, body)
                console.log(response)

                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached 😩. Resuming in 60 seconds`, 'info'), 60000)
                setRateLimitInterval(response.rateLimitInterval)
                if (currentExtensionIndex !== queues.length - 1) {
                    increaseProgress()
                    setCurrentExtensionIndex(currentExtensionIndex + 1)
                }
                else {
                    setIsPending(false)
                    setShouldFetch(false)
                    setShouldUpdateQueues(false)
                    setRateLimitInterval(0)
                    setCurrentExtensionIndex(0)
                    setProgressValue(queues.length * 2)
                    console.log('Finished updating queues')
                }
            }
            catch (e) {
                console.log('Something went wrong')
                console.log(e)
                postMessage(new Message(`Failed to add members to queue '${queues[currentExtensionIndex].extension.name}'`, 'error'))
            }
        }, rateLimitInterval)

    }, [shouldUpdateQueues, accessToken, currentExtensionIndex, queues, rateLimitInterval])

    const extensionExists = (extensionNumber: number, extensionList: RCExtension[]) => {
        for (let index = 0; index < extensionList.length; index++) {
            if (extensionList[index].extensionNumber == extensionNumber) return true
        }
        return false
    }

    const increaseProgress = () => {
        setProgressValue((prev: any) => prev + 1)
    }

    return {isCallQueueCreationPending, createQueues}
}

export default useCreateCallQueues