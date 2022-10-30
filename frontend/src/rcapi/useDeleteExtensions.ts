import { useEffect, useState } from "react"
import { Message } from "../models/Message"
import RCExtension from "../models/RCExtension"
import { RestCentral } from "./RestCentral"

const useDeleteExtensions = (postMessage: (message: Message) => void, setProgressValue: (value: (any)) => void, setMaxProgressValue: (value: (any)) => void) => {
    const [extensions, setExtensions] = useState<RCExtension[]>([])
    let [shouldDelete, setShouldDelete] = useState(false)
    let [rateLimitInterval, setRateLimitInterval] = useState(0)
    let [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [isExtensionDeletePending, setIsPending] = useState(true)
    const accessToken = localStorage.getItem('cs_access_token')
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'

    const deleteExtensions = (extensions: RCExtension[]) => {
        setExtensions(extensions)
        setCurrentExtensionIndex(0)
        setIsPending(true)
        setRateLimitInterval(0)
        setShouldDelete(true)
        setMaxProgressValue(extensions.length)
    }

    useEffect(() => {
        if (!shouldDelete) return
        if (currentExtensionIndex >= extensions.length) return
        if (!accessToken) return

        let url = baseURL.replace('extensionId', `${extensions[currentExtensionIndex].id}`)
        url += '?savePhoneNumbers=true&savePhoneLines=true'
        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }

        setTimeout(async () => {
            try {
                let response = await RestCentral.delete(url, headers)
                setRateLimitInterval(response.rateLimitInterval)
            }
            catch (e: any) {
                console.log(`Failed to delete extension ${extensions[currentExtensionIndex].name}`)
                postMessage(new Message(`Failed to delete ${extensions[currentExtensionIndex].name} - Ext. ${extensions[currentExtensionIndex].extensionNumber}. ${e.message}`, 'error'))
            }
            deleteNext()
        }, rateLimitInterval)

    }, [shouldDelete, currentExtensionIndex, extensions])

    const increaseProgress = () => {
        setProgressValue((prev: any) => prev + 1)
    }

    const deleteNext = () => {
        if (currentExtensionIndex !== extensions.length - 1) {
            // setRateLimitInterval(rateLimit(res.headers))
            setCurrentExtensionIndex(currentExtensionIndex + 1)
            increaseProgress()
        }
        else {
            setIsPending(false)
            setShouldDelete(false)
            setRateLimitInterval(0)
            setCurrentExtensionIndex(0)
            increaseProgress()
            setProgressValue(extensions.length)
            console.log('Finished deleting extensions')
        }
    }

    return {isExtensionDeletePending, deleteExtensions}
}

export default useDeleteExtensions