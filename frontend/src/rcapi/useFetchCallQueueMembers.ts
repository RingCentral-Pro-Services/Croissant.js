import { useEffect, useState } from "react";
import RCExtension from "../models/RCExtension";
import CallQueue from "../models/CallQueue";
import rateLimit from "../helpers/rateLimit";
const axios = require('axios').default;

const useFetchCallQueueMembers = () => {
    let [callQueues, setCallQueues] = useState<CallQueue[]>([])
    const accessToken = localStorage.getItem('cs_access_token')
    let [shouldFetch, setShouldFetch] = useState(false)
    let [rateLimitInterval, setRateLimitInterval] = useState(0)
    let [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])
    let [isQueueListPending, setIsQueueListPending] = useState(true)
    let baseURL = 'https://platform.devtest.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId/members'
    let [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)

    const fetchQueueMembers = (extensionList: RCExtension[]) => {
        let filtered = extensionList.filter((extension: RCExtension) => {
            return extension.type === 'Department'
        })

        console.log(`Filtered extensions: ${filtered.length}`)

        setCallQueues([])
        setIsQueueListPending(true)
        setFilteredExtensions(filtered)
        setShouldFetch(true)
    }

    useEffect(() => {
        if (!shouldFetch) return
        if (currentExtensionIndex === filteredExtensions.length) return

        let targetUID = localStorage.getItem('target_uid')
        if (!targetUID) return

        let url = baseURL.replace('~', targetUID!)
        url = url.replace('groupId', `${filteredExtensions[currentExtensionIndex].id}`)

        setTimeout(() => {
            axios
            .get(url, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            })
            .then((res: any) => {
                if (res.status === 200) {
                    // process response
                    console.log(res)
                    let records = res.data.records
                    let extensions: string[] = []

                    for (let index = 0; index < records.length; index++) {
                        extensions.push(records[index].extensionNumber)
                    }

                    let queue = new CallQueue(filteredExtensions[currentExtensionIndex], 0, extensions)
                    let newCallQueues = [...callQueues, queue]
                    setCallQueues(newCallQueues)

                    setRateLimitInterval(rateLimit(res.headers))
                    if (currentExtensionIndex !== filteredExtensions.length - 1) {
                        setCurrentExtensionIndex(currentExtensionIndex + 1)
                    }
                    else {
                        setIsQueueListPending(false)
                        setShouldFetch(false)
                        setRateLimitInterval(0)
                        setCurrentExtensionIndex(0)
                        console.log('Finished fetching queue members')
                    }
                }
                else {
                    console.log('Uh oh. Something bad happened')
                    console.log(res)
                    setShouldFetch(false)
                }
            })
            .catch((error: Error) => {
                console.log('An error occurred', error)
                setShouldFetch(false)
            })
        }, rateLimitInterval)

    }, [shouldFetch, filteredExtensions, callQueues, currentExtensionIndex, accessToken, baseURL, rateLimitInterval])

    return {isQueueListPending, callQueues, fetchQueueMembers}
}

export default useFetchCallQueueMembers