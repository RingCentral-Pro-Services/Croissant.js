import React, { useEffect, useState } from "react";
import { EditedExtension } from "../models/EditedExtension";
import { Message } from "../models/Message";
import RCExtension from "../models/RCExtension";
import { SyncError } from "../models/SyncError";
import { RestCentral } from "./RestCentral";

const useUpdateExtensions = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [extensions, setExtensions] = useState<EditedExtension[]>([])
    const [isExtensionUpdatePending, setIsExtensionUpdatePending] = useState(true)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [shouldUpdate, setShouldUpdate] = useState(false)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'

    const updateExtensions = (editedExtensions: EditedExtension[]) => {
        setCurrentExtensionIndex(0)
        setExtensions(editedExtensions)
        setShouldUpdate(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldUpdate || !accessToken) return
        if (currentExtensionIndex >= extensions.length) {
            setShouldUpdate(false)
            setProgressValue(extensions.length)
            return
        }

        setTimeout(async () => {
            const url = baseURL.replace('extensionId', extensions[currentExtensionIndex].id)
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                const response = await RestCentral.put(url, headers, extensions[currentExtensionIndex].payload())
                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }
                console.log(response)
                updateNext()
            }
            catch (e: any) {
                console.log('Something went wrong updating extension')
                if (e.rateLimitInterval > 0) {
                    postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                    setRateLimitInterval(e.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }
                postMessage(new Message(`Failed to update extension ${extensions[currentExtensionIndex].id}`, 'error'))
                postError(new SyncError(`${extensions[currentExtensionIndex].oldFirsstName} ${extensions[currentExtensionIndex].oldLastName}`, 0, ['Failed to update', ''], e.error ))
                console.log(e)
                updateNext()
            }
        }, rateLimitInterval)
    }, [rateLimitInterval, currentExtensionIndex, extensions, baseURL, shouldUpdate])

    const updateNext = () => {
        if (currentExtensionIndex >= extensions.length) {
            setShouldUpdate(false)
            setIsExtensionUpdatePending(false)
            setProgressValue(extensions.length)
        }
        else {
            setCurrentExtensionIndex(currentExtensionIndex + 1)
            setProgressValue(currentExtensionIndex)
        }
    }

    return {updateExtensions, isExtensionUpdatePending}
}

export default useUpdateExtensions