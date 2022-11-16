import { useEffect, useState } from "react"
import { Message } from "../models/Message"
import { Site } from "../models/Site"
import { SyncError } from "../models/SyncError"
import { RestCentral } from "./RestCentral"

const useEditSites = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, setProgressValue: (value: (any)) => void, setMaxProgressValue: (value: (any)) => void, postError: (error: SyncError) => void) => {
    const [sites, setSites] = useState<Site[]>([])
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [rateLimitInterval, setRateLimitInterval] = useState(0)
    const [shouldUpdate, setShouldUpdate] = useState(false)
    const [isSiteUpdatePending, setIsSiteUpdatePending] = useState(true)
    const baseUrl = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'

    const updateSites = (siteData: Site[]) => {
        setMaxProgressValue(siteData.length)
        setSites(siteData)
        setCurrentExtensionIndex(0)
        setRateLimitInterval(0)
        setShouldUpdate(true)
        setIsSiteUpdatePending(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldUpdate) return
        if (currentExtensionIndex >= sites.length) return
        if (!accessToken) return

        const url = baseUrl.replace('extensionId', sites[currentExtensionIndex].id)
        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }

        const body = {
            contact: {
                firstName: sites[currentExtensionIndex].name
            },
            extensionNumber: sites[currentExtensionIndex].extensionNumber
        }
        console.log('Body')
        console.log(body)
        setTimeout(async () => {
            try {
                let response = await RestCentral.put(url, headers, body)
                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                setRateLimitInterval(response.rateLimitInterval)
            }
            catch (e: any) {
                console.log(e)
                postMessage(new Message(`Failed to update ${sites[currentExtensionIndex].name} - ${sites[currentExtensionIndex].extensionNumber}. ${e.error}`, 'error'))
                postError(new SyncError(sites[currentExtensionIndex].name, sites[currentExtensionIndex].extensionNumber, ['Failed to update sites', '']))
            }
            updateNext()
        }, rateLimitInterval)
    }, [rateLimitInterval, shouldUpdate, sites, currentExtensionIndex])

    const increaseProgress = () => {
        setProgressValue((prev: any) => prev + 1)
    }

    const updateNext = () => {
        if (currentExtensionIndex !== sites.length - 1) {
            // setRateLimitInterval(rateLimit(res.headers))
            setCurrentExtensionIndex(currentExtensionIndex + 1)
            increaseProgress()
        }
        else {
            setIsSiteUpdatePending(false)
            setShouldUpdate(false)
            setRateLimitInterval(0)
            setCurrentExtensionIndex(0)
            increaseProgress()
            setProgressValue(sites.length)
            console.log('Finished updating sites')
            postMessage(new Message('Finished updating sites', 'success'))
        }
    }

    return {updateSites, isSiteUpdatePending}
}

export default useEditSites