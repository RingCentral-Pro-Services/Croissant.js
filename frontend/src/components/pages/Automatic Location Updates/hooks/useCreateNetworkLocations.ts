import { useEffect, useState } from "react"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { NetworkLocation } from "../models/NetworkLocation"

const useCreateNetworkLocations = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [networkLocations, setNetworkLocations] = useState<NetworkLocation[]>([])
    const [isCreatePending, setIsCreatePending] = useState(true)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [shouldCreate, setShouldCreate] = useState(false)
    const switchURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/emergency-address-auto-update/switches'
    const accessPointURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/emergency-address-auto-update/wireless-points'

    const createNetworkLocations = (networkLocations: NetworkLocation[]) => {
        setNetworkLocations(networkLocations)
        setShouldCreate(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldCreate || !accessToken) return
        if (currentExtensionIndex >= networkLocations.length) {
            setCurrentExtensionIndex(0)
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

                console.log('Payload')
                console.log(networkLocations[currentExtensionIndex].payload())
                const url = networkLocations[currentExtensionIndex].data.type === 'Switch' ? switchURL : accessPointURL
                const response = await RestCentral.post(url, headers, networkLocations[currentExtensionIndex].payload())
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
            catch(e: any) {
                console.log(`Failed to create network location '${networkLocations[currentExtensionIndex].data.nickname}'`)
                console.log(e)
                postMessage(new Message(`Failed to create network location '${networkLocations[currentExtensionIndex].data.nickname}.' ${e.error ?? ''}`, 'error'))
                postError(new SyncError(networkLocations[currentExtensionIndex].data.nickname, 0, ['Failed to create network location', ''], e.error ?? ''))
                next()
            }
        }, rateLimitInterval)
    }, [shouldCreate, currentExtensionIndex, rateLimitInterval, networkLocations])

    const next = () => {
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setProgressValue(currentExtensionIndex + 1)
    }

    return { createNetworkLocations, isCreatePending }
}

export default useCreateNetworkLocations