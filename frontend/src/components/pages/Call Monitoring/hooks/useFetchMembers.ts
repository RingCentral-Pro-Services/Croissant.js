import { useEffect, useState } from "react"
import { CallMonitoringGroup, CallMonitoringMember } from "../../../../models/CallMonitoringGroup"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useFetchMembers = (rawMonitoringGroups: CallMonitoringGroup[], shouldFetch: boolean, setProgressValue: (value: (any)) => void, setMaxProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [adjustedMonitoringGroups, setAdjustedMonitoringGroups] = useState<CallMonitoringGroup[]>([])
    const [isGroupAdjustmentPending, setIsGroupAdjustmentPending] = useState(true)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-monitoring-groups/groupId/members'

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldFetch || !accessToken) return
        if (shouldFetch && currentExtensionIndex >= rawMonitoringGroups.length) {
            setIsGroupAdjustmentPending(false)
            return
        }
        
        setMaxProgressValue(rawMonitoringGroups.length)
        const url = baseURL.replace('groupId', rawMonitoringGroups[currentExtensionIndex].data.id!)

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
                let response = await RestCentral.get(url, headers)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message('Rate limit reached. Waiting 60 seconds before continuing...', 'info'), 60000)
                }
                else {
                    setRateLimitInterval(250)
                }

                const members = response.data.records as CallMonitoringMember[]
                for (let index = 0; index < members.length; index++) {
                    members[index].id = members[index].extensionNumber!
                }
                const newGroup = rawMonitoringGroups[currentExtensionIndex]
                newGroup.data.members = members
                newGroup.data.monitoredExtensions = members.filter((member) => member.permissions.includes('Monitored')).map((member) => member.extensionNumber!)
                newGroup.data.monitoringExtensions = members.filter((member) => member.permissions.includes('Monitoring')).map((member) => member.extensionNumber!)
                setAdjustedMonitoringGroups(prev => [...prev, newGroup])
                setCurrentExtensionIndex(currentExtensionIndex + 1)
                setProgressValue(currentExtensionIndex + 1)
            }
            catch (error: any) {
                console.log(`Failed to get members for group ${rawMonitoringGroups[currentExtensionIndex].data.name}`)
                console.log(error)
                postMessage(new Message(`Failed to get members for group ${rawMonitoringGroups[currentExtensionIndex].data.name}`, 'error'))
                postError(new SyncError(rawMonitoringGroups[currentExtensionIndex].data.name, 0, ['Failed to get members', ''], error.error ?? ''))
                setCurrentExtensionIndex(currentExtensionIndex + 1)
            }
        }, rateLimitInterval)
    }, [shouldFetch, baseURL, rateLimitInterval, currentExtensionIndex])

    return { adjustedMonitoringGroups, isGroupAdjustmentPending }
}

export default useFetchMembers