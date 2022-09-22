import { useEffect, useState } from "react"
import CallQueue from "../models/CallQueue"
import rateLimit from "../helpers/rateLimit";
const axios = require('axios').default;

const useCreateCallQueues = () => {
    const [queues, setQueues] = useState<CallQueue[]>([])
    let [shouldFetch, setShouldFetch] = useState(false)
    let [rateLimitInterval, setRateLimitInterval] = useState(0)
    let [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    let [isCallQueueCreationPending, setIsPending] = useState(true)
    const accessToken = localStorage.getItem('cs_access_token')
    const url = 'https://platform.devtest.ringcentral.com/restapi/v1.0/account/~/extension'

    const createQueues = (callQueues: CallQueue[]) => {
        console.log(`Creating ${callQueues.length} queues`)
        setQueues(callQueues)
        setShouldFetch(true)
        setCurrentExtensionIndex(0)
    }

    useEffect(() => {
        if (!shouldFetch) return
        if (currentExtensionIndex === queues.length) return

        let targetUID = localStorage.getItem('target_uid')
        if (!targetUID) return

        const extensionURL = url.replace('~', targetUID)

        setTimeout(() => {
            console.log(`Email: ${queues[currentExtensionIndex].extension.contact.email}`)
            axios({
                method: "POST",
                url: extensionURL,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                data: {
                    extensionNumber: queues[currentExtensionIndex].extension.extensionNumber,
                    type: 'Department',
                    contact: {
                        firstName: queues[currentExtensionIndex].extension.name,
                        email: queues[currentExtensionIndex].extension.contact.email
                    }
                },
              })
              .then((res: any) => {
                console.log(res)
                setRateLimitInterval(rateLimit(res.headers))
                if (currentExtensionIndex !== queues.length - 1) {
                    setCurrentExtensionIndex(currentExtensionIndex + 1)
                }
                else {
                    setIsPending(false)
                    setShouldFetch(false)
                    setRateLimitInterval(0)
                    setCurrentExtensionIndex(0)
                    console.log('Finished creating queues')
                }
              })
              .catch((error: Error) => {
                console.log('Something bad happened')
                console.log(error)
              })
        }, rateLimitInterval)

    }, [shouldFetch, currentExtensionIndex, queues, url])

    return {isCallQueueCreationPending, createQueues}
}

export default useCreateCallQueues