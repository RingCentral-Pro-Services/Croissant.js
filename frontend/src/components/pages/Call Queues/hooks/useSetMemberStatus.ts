import { useEffect, useState } from "react"
import { Message } from "../../../../models/Message"
import RCExtension from "../../../../models/RCExtension"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useSetMemberStatus = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [callQueues, setCallQueues] = useState<RCExtension[]>([])
    const [status, setStatus] = useState(false)
    const [isMemberStatusPending, setIsMemberStatusPending] = useState(true)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [shouldEditStatus, setShouldEditStatus] = useState(false)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-queues/groupId'

    const editMemberStatus = (callQueues: RCExtension[], status: string) => {
        if (status === '') {
            setShouldEditStatus(false)
            setIsMemberStatusPending(false)
            setProgressValue(Number.MAX_SAFE_INTEGER)
            return
        }
        setCallQueues(callQueues)
        setShouldEditStatus(true)
        setStatus(status === 'Allowed')
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldEditStatus || !accessToken) return
        if (currentExtensionIndex >= callQueues.length) {
            setCurrentExtensionIndex(0)
            setShouldEditStatus(false)
            setIsMemberStatusPending(false)
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

                const payload = {
                    editableMemberStatus: status
                }

                const url = baseURL.replace('groupId', `${callQueues[currentExtensionIndex].id}`)
                const response = await RestCentral.put(url, headers, payload)

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
                console.log(`Failed to set member status for '${callQueues[currentExtensionIndex].name}'`)
                console.log(e)
                postMessage(new Message(`Failed to set member status for '${callQueues[currentExtensionIndex].name}.' ${e.error ?? ''}`, 'error'))
                postError(new SyncError(callQueues[currentExtensionIndex].name, 0, ['Failed to set member status', ''], e.error ?? ''))
                next()
            }
        }, rateLimitInterval)
    }, [shouldEditStatus, currentExtensionIndex, rateLimitInterval, callQueues])

    const next = () => {
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setProgressValue(currentExtensionIndex + 1)
    }

    return { editMemberStatus, isMemberStatusPending }
}

export default useSetMemberStatus