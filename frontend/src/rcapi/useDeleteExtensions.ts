import { useEffect, useState } from "react"
import { Extension } from "../models/Extension"
import { Message } from "../models/Message"
import { SyncError } from "../models/SyncError"
import { RestCentral } from "./RestCentral"

const useDeleteExtensions = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, setProgressValue: (value: (any)) => void, setMaxProgressValue: (value: (any)) => void, postError: (error: SyncError) => void) => {
    const [extensions, setExtensions] = useState<Extension[]>([])
    let [shouldDelete, setShouldDelete] = useState(false)
    let [rateLimitInterval, setRateLimitInterval] = useState(0)
    let [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [isExtensionDeletePending, setIsPending] = useState(true)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'

    const deleteExtensions = (extensions: Extension[]) => {
        setExtensions(extensions)
        setCurrentExtensionIndex(0)
        setIsPending(true)
        setRateLimitInterval(0)
        setShouldDelete(true)
        setMaxProgressValue(extensions.length)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldDelete) return
        if (currentExtensionIndex >= extensions.length) return
        if (!accessToken) return

        let url = baseURL.replace('extensionId', `${extensions[currentExtensionIndex].data.id}`)
        url += '?savePhoneNumbers=true&savePhoneLines=true'
        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }

        setTimeout(async () => {
            try {
                let response = await RestCentral.delete(url, headers)
                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                setRateLimitInterval(response.rateLimitInterval)
            }
            catch (e: any) {
                console.log(`Failed to delete extension ${extensions[currentExtensionIndex].data.name}`)
                postMessage(new Message(`Failed to delete ${extensions[currentExtensionIndex].data.name} - Ext. ${extensions[currentExtensionIndex].data.extensionNumber}. ${e.error}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].data.name, parseInt(extensions[currentExtensionIndex].data.extensionNumber), ['Failed to delete extension', ''], e.error))
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
            postMessage(new Message('Finished deleting extensions', 'success'))
        }
    }

    return {isExtensionDeletePending, deleteExtensions}
}

export default useDeleteExtensions