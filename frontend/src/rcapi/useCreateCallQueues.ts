import { useEffect, useState } from "react"
import CallQueue from "../models/CallQueue"
import { Message } from "../models/Message";
import RCExtension from "../models/RCExtension";
import { SyncError } from "../models/SyncError";
import { APIResponse, RestCentral } from "./RestCentral";

const useCreateCallQueues = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [queues, setQueues] = useState<CallQueue[]>([])
    let [shouldFetch, setShouldFetch] = useState(false)
    let [shouldUpdateQueues, setShouldUpdateQueues] = useState(false)
    const [shouldUpdateCallHandling, setShouldUpdateCallHandling] = useState(false)
    const [shouldUpdateGreetings, setShouldUpdateGreetings] = useState(false)
    let [rateLimitInterval, setRateLimitInterval] = useState(0)
    let [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    let [isCallQueueCreationPending, setIsPending] = useState(true)
    const accessToken = localStorage.getItem('cs_access_token')
    const url = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId/bulk-assign'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/business-hours-rule'
    const [extensionList, setExtensionList] = useState<RCExtension[]>([])

    const createQueues = (callQueues: CallQueue[], extensions: RCExtension[]) => {
        console.log(`Creating ${callQueues.length} queues`)
        console.log(callQueues)
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
                    site: {
                        id: queues[currentExtensionIndex].siteID
                    },
                    contact: {
                        firstName: queues[currentExtensionIndex].extension.name,
                        email: queues[currentExtensionIndex].extension.contact.email
                    }
                }
                let response = await RestCentral.post(extensionURL, headers, body)
                console.log(response)

                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                setRateLimitInterval(response.rateLimitInterval)

                queues[currentExtensionIndex].extension.id = response.data.id
                createNext()
            }
            catch (e: any) {
                console.log('Something bad happened')
                console.log(e)
                increaseProgress()
                setCurrentExtensionIndex(currentExtensionIndex + 1)
                postMessage(new Message(`Failed to create queue '${queues[currentExtensionIndex].extension.name}' Platform response: ${e.error}`, 'error'))
                postError(new SyncError(queues[currentExtensionIndex].extension.name, queues[currentExtensionIndex].extension.extensionNumber, ['Failed to create queue', ''], e.error))
                createNext()
            }
        }, rateLimitInterval)

    }, [shouldFetch, currentExtensionIndex, queues, url, accessToken, extensionList, rateLimitInterval])

    // Add queue members
    useEffect(() => {
        if (!shouldUpdateQueues) return
        if (currentExtensionIndex >= queues.length) {
            setShouldUpdateQueues(false)
            setCurrentExtensionIndex(0)
            setShouldUpdateCallHandling(true)
        }

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

                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached 😩. Resuming in 60 seconds`, 'info'), 60000)
                setRateLimitInterval(response.rateLimitInterval)

                console.log(response)
                updateNext()
            }
            catch (e: any) {
                console.log('Something went wrong')
                console.log(e)
                increaseProgress()
                setCurrentExtensionIndex(currentExtensionIndex + 1)
                postMessage(new Message(`Failed to add members to queue '${queues[currentExtensionIndex].extension.name}.' Platform response: ${e.error}`, 'error'))
                postError(new SyncError(queues[currentExtensionIndex].extension.name, queues[currentExtensionIndex].extension.extensionNumber, ['Failed to add queue members', ''], e.error))
                updateNext()
            }
        }, rateLimitInterval)

    }, [shouldUpdateQueues, accessToken, currentExtensionIndex, queues, rateLimitInterval])

    // Update Call Handling Settings
    useEffect(() => {
        if (!shouldUpdateCallHandling) return
        if (currentExtensionIndex >= queues.length) {
            setShouldUpdateCallHandling(false)
            console.log('Done updating queue call handling')
            return
        }

        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }

        setTimeout(async () => {
            try {
                let url = baseCallHandlingURL.replace('extensionId', `${queues[currentExtensionIndex].extension.id}`)
                let response = await RestCentral.put(url, headers, queues[currentExtensionIndex].payload())

                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached 😩. Resuming in 60 seconds`, 'info'), 60000)
                setRateLimitInterval(response.rateLimitInterval)

                updateCallHandlingNext()
            }
            catch(error: any) {
                console.log(`Someting went wrong uppdating call handling for ${queues[currentExtensionIndex].extension.name}`)
                console.log(error)
                postError(new SyncError(queues[currentExtensionIndex].extension.name, queues[currentExtensionIndex].extension.extensionNumber, ['Call handling failed', '']))
                postMessage(new Message(`Failed to update call handling for ${queues[currentExtensionIndex].extension.name} - ${queues[currentExtensionIndex].extension.extensionNumber}. ${error.error}`, 'error'))
                updateCallHandlingNext()
            }
        }, rateLimitInterval)

    }, [shouldUpdateCallHandling, queues, rateLimitInterval, currentExtensionIndex])

    // Update Call Queue greetings
    useEffect(() => {
        if (!shouldUpdateGreetings) return
        if (currentExtensionIndex >= queues.length) {
            setShouldUpdateGreetings(false)
            setIsPending(false)
            return
        }

        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }

        setTimeout(async () => {
            try {
                let url = baseCallHandlingURL.replace('extensionId', `${queues[currentExtensionIndex].extension.id}`)
                let body = {
                    greetings: queues[currentExtensionIndex].greetings
                }

                let response = await RestCentral.put(url, headers, body)

                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached 😩. Resuming in 60 seconds`, 'info'), 60000)
                setRateLimitInterval(response.rateLimitInterval)

                updateGreetingNext()
            }
            catch(error: any) {
                console.log(`Someting went wrong uppdating call greetings for ${queues[currentExtensionIndex].extension.name}`)
                postError(new SyncError(queues[currentExtensionIndex].extension.name, queues[currentExtensionIndex].extension.extensionNumber, ['Greetings failed', '']))
                postMessage(new Message(`Failed to update greetings for ${queues[currentExtensionIndex].extension.name} - ${queues[currentExtensionIndex].extension.extensionNumber}. ${error.error}`, 'error'))
                updateGreetingNext()
            }
        }, rateLimitInterval)

    }, [currentExtensionIndex, shouldUpdateGreetings, queues, rateLimitInterval])

    const extensionExists = (extensionNumber: number, extensionList: RCExtension[]) => {
        for (let index = 0; index < extensionList.length; index++) {
            if (extensionList[index].extensionNumber == extensionNumber) return true
        }
        return false
    }

    const increaseProgress = () => {
        setProgressValue((prev: any) => prev + 1)
    }

    const createNext = () => {
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

    const updateNext = () => {
        if (currentExtensionIndex !== queues.length - 1) {
            increaseProgress()
            setCurrentExtensionIndex(currentExtensionIndex + 1)
        }
        else {
            setShouldFetch(false)
            setShouldUpdateQueues(false)
            setRateLimitInterval(0)
            setCurrentExtensionIndex(0)
            setShouldUpdateCallHandling(true)
            console.log('Finished updating queues')
        }
    }

    const updateCallHandlingNext = () => {
        if (currentExtensionIndex != queues.length -1) {
            increaseProgress()
            setCurrentExtensionIndex(currentExtensionIndex + 1)
        }
        else {
            setIsPending(false)
            setShouldUpdateCallHandling(false)
            setCurrentExtensionIndex(0)
            setRateLimitInterval(0)
            setShouldUpdateGreetings(true)
            console.log('Finished updateing call handling')
        }
    }

    const updateGreetingNext = () => {
        if (currentExtensionIndex != queues.length -1) {
            increaseProgress()
            setCurrentExtensionIndex(currentExtensionIndex + 1)
        }
        else {
            setIsPending(false)
            setShouldUpdateGreetings(false)
            setRateLimitInterval(0)
            setProgressValue(queues.length * 4)
            console.log('Finished updating call queue greetings')
        }
    }

    return {isCallQueueCreationPending, createQueues}
}

export default useCreateCallQueues