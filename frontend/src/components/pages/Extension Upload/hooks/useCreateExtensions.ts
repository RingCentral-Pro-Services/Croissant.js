import { useEffect, useState } from "react"
import { Extension } from "../../../../models/Extension"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useCreateExtensions = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, isMultiSiteEnabled: boolean) => {
    const [extensions, setExtensions] = useState<Extension[]>([])
    const [isExtensionCreationPending, setIsExtensionCreationPending] = useState(true)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [shouldCreateExtensions, setShouldCreateExtensions] = useState(false)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'

    const createExtensions = (extensions: Extension[]) => {
        setExtensions(extensions)
        setShouldCreateExtensions(true)
        setIsExtensionCreationPending(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldCreateExtensions || !accessToken) return
        if (currentExtensionIndex >= extensions.length) {
            setIsExtensionCreationPending(false)
            setShouldCreateExtensions(false)
            return
        }

        setTimeout(async () => {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                const response = await RestCentral.post(baseURL, headers, extensions[currentExtensionIndex].payload(isMultiSiteEnabled))
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message(`Rate limit reached. Waiting 60 seconds before continuing`, 'warning'), response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }
                createNext()
            }
            catch (e: any) {
                console.log('Something went horibly wrong')
                console.log(e)
                postMessage(new Message(`Something went wrong while creating extension ${extensions[currentExtensionIndex].data.name} Ext. ${extensions[currentExtensionIndex].data.extensionNumber}. ${e.error}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].data.name, parseInt(extensions[currentExtensionIndex].data.extensionNumber), ['Extension creation failed', ''], e.error ?? ''))
                createNext()
            }
        }, rateLimitInterval)
    }, [shouldCreateExtensions, extensions, currentExtensionIndex, rateLimitInterval])

    const createNext = () => {
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setProgressValue(currentExtensionIndex + 1)
    }

    return {createExtensions, isExtensionCreationPending}
}

export default useCreateExtensions