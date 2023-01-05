import { useEffect, useState } from "react"
import { CallMonitoringGroup } from "../../../../models/CallMonitoringGroup"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useCreateGroups = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [callMonitoringGroups, setCallMonitoringGroups] = useState<CallMonitoringGroup[]>([])
    const [isGroupCreationPending, setIsGroupCreationPending] = useState(true)
    const [rateLimitIntervaal, setRateLimitInterval] = useState(250)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [shouldCreateGroups, setShouldCreateGroups] = useState(false)
    const [shouldUdateGroups, setShouldUpdateGroups] = useState(false)
    const [progress, setProgress] = useState(0)
    const baseCreateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-monitoring-groups'
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-monitoring-groups/groupId/bulk-assign'

    const createGroups = (groups: CallMonitoringGroup[]) => {
        setCallMonitoringGroups(groups)
        setShouldCreateGroups(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldCreateGroups || !accessToken) return
        if (currentExtensionIndex >= callMonitoringGroups.length) {
            setCurrentExtensionIndex(0)
            setShouldCreateGroups(false)
            setShouldUpdateGroups(true)
            return
        }

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }

                const response = await RestCentral.post(baseCreateURL, headers, callMonitoringGroups[currentExtensionIndex].payload())
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message('Rate limit reached. Waiting 60 seconds before continuing', 'info'), 60000)
                }
                else {
                    setRateLimitInterval(250)
                }

                callMonitoringGroups[currentExtensionIndex].data.id = response.data.id

                next()
            }
            catch (e: any) {
                console.log('Something went horibly wrong creating group')
                console.log(e)
                postMessage(new Message(`Something went wrong creating group '${callMonitoringGroups[currentExtensionIndex].data.name}'. ${e.error ?? ''}`, 'error'))
                postError(new SyncError(callMonitoringGroups[currentExtensionIndex].data.name, 0, ['Failed to create group', ''], e.error ?? ''))
                next()
            }
        }, rateLimitIntervaal)
    }, [shouldCreateGroups, rateLimitIntervaal, currentExtensionIndex, callMonitoringGroups])

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldUdateGroups || !accessToken) return
        if (currentExtensionIndex >= callMonitoringGroups.length) {
            setShouldUpdateGroups(false)
            setIsGroupCreationPending(false)
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

                const url = baseUpdateURL.replace('groupId', callMonitoringGroups[currentExtensionIndex].data.id!)
                const response = await RestCentral.post(url, headers, callMonitoringGroups[currentExtensionIndex].membersPayload())
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }

                next()
            }
            catch (e: any) {
                console.log('Something went horibly wrong adding members')
                console.log(e)
                next()
            }
        }, rateLimitIntervaal)
    }, [shouldUdateGroups, rateLimitIntervaal, currentExtensionIndex, callMonitoringGroups])

    const next = () => {
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setProgress(progress + 1)
        setProgressValue(progress)
    }

    return { createGroups, isGroupCreationPending }
}

export default useCreateGroups