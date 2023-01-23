import { useEffect, useState } from "react"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { Site } from "../models/Site"

const useCreateSites = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [sites, setSites] = useState<Site[]>([])
    const [isCreatePending, setIsCreatePending] = useState(true)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [shouldCreate, setShouldCreate] = useState(false)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const url = 'https://platform.ringcentral.com/restapi/v1.0/account/~/sites'

    const createSites = (sites: Site[]) => {
        setSites(sites)
        setShouldCreate(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldCreate || !accessToken) return
        if (currentExtensionIndex >= sites.length) {
            setShouldCreate(false)
            setIsCreatePending(false)
            setProgressValue(Number.MAX_SAFE_INTEGER)
            return
        }

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }

                const response = await RestCentral.post(url, headers, sites[currentExtensionIndex].payload())
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message('Rate limit reached. Waiting 60 seconds before continuing', 'info'), 60000)
                }
                else {
                    setRateLimitInterval(250)
                }

                next()
            }
            catch (e: any) {
                console.log(`Failed to create site '${sites[currentExtensionIndex].data.name}'`)
                postMessage(new Message(`Failed to create site '${sites[currentExtensionIndex].data.name}.' ${e.error}`, 'error'))
                postError(new SyncError(sites[currentExtensionIndex].data.name, parseInt(sites[currentExtensionIndex].data.extensionNumber), ['Failed to create site', ''], e.error ?? ''))
                console.log(e)
                next()
            }
        }, rateLimitInterval)
    }, [currentExtensionIndex, rateLimitInterval, shouldCreate, sites])

    const next = () => {
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setProgressValue(currentExtensionIndex + 1)
    }

    return {createSites, isCreatePending}
}

export default useCreateSites