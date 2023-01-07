import { useEffect, useState } from "react"
import { Message } from "../../../../models/Message"
import { PagingGroup } from "../../../../models/PagingGroup"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useCreatePagingGroups = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [pagingGroups, setPagingGroups] = useState<PagingGroup[]>([])
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [isCreationPending, setIsCreationPending] = useState(true)
    const [shouldCreate, setShouldCreate] = useState(false)
    const [shouldUpdate, setShouldUpdate] = useState(false)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [progress, setProgress] = useState(0)
    const baseCreateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/paging-only-groups/pagingOnlyGroupId/bulk-assign'

    const createGroups = (pagingGroups: PagingGroup[]) => {
        setPagingGroups(pagingGroups)
        setShouldCreate(true)
        setIsCreationPending(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldCreate || !accessToken) return
        if (currentExtensionIndex >= pagingGroups.length) {
            setCurrentExtensionIndex(0)
            setShouldCreate(false)
            setShouldUpdate(true)
            return
        }

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }

                const response = await RestCentral.post(baseCreateURL, headers, pagingGroups[currentExtensionIndex].payload())
                console.log(response)

                pagingGroups[currentExtensionIndex].data.id = response.data.id

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message(`Rate limit exceeded. Waiting 60 seconds before continuing`,'info'), response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }
                next()
            }
            catch (e: any) {
                console.log('Failed to create paging group')
                console.log(e)
                postMessage(new Message(`Failed to create paging group ${pagingGroups[currentExtensionIndex].data.name}. ${e.error ?? ''}`,'error'))
                postError(new SyncError(pagingGroups[currentExtensionIndex].data.name, 0, ['Failed to create', ''], e.error ?? ''))
                next()
            }
        }, rateLimitInterval)

    }, [pagingGroups, currentExtensionIndex, shouldCreate, rateLimitInterval, baseCreateURL])

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldUpdate || !accessToken) return
        if (currentExtensionIndex >= pagingGroups.length) {
            setShouldUpdate(false)
            setIsCreationPending(false)
            return
        }

        setTimeout(async () => {
            try {
                const url = baseUpdateURL.replace('pagingOnlyGroupId', pagingGroups[currentExtensionIndex].data.id!)
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }

                const response = await RestCentral.post(url, headers, pagingGroups[currentExtensionIndex].membersPayload())
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message(`Rate limit exceeded. Waiting 60 seconds before continuing`,'info'), response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }
                next()
            }
            catch (e: any) {
                console.log('Failed to add members to paging group')
                console.log(e)
                postMessage(new Message(`Failed to add members paging group ${pagingGroups[currentExtensionIndex].data.name}. ${e.error ?? ''}`,'error'))
                postError(new SyncError(pagingGroups[currentExtensionIndex].data.name, 0, ['Failed to add members', ''], e.error ?? ''))
                next()
            }
        }, rateLimitInterval)

    }, [pagingGroups, currentExtensionIndex, shouldUpdate, rateLimitInterval, baseUpdateURL])

    const next = () => {
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setProgress(progress + 1)
        setProgressValue(progress)
    }

    return {createGroups, isCreationPending}
    
}

export default useCreatePagingGroups