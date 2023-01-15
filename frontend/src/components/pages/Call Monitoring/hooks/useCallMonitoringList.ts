import { useEffect, useState } from "react"
import { CallMonitoringGroup, CallMonitoringGroupData } from "../../../../models/CallMonitoringGroup"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import useFetchMembers from "./useFetchMembers"

const useCallMonitoringList = (shouldFetch: boolean, setProgressValue: (value: (any)) => void, setMaxProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [monitoringGroups, setMonitoringGroups] = useState<CallMonitoringGroup[]>([])
    const [isMonitoringGroupListPending, setIsMonitoringGroupListPending] = useState(true)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [page, setPage] = useState(1)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-monitoring-groups'
    const {adjustedMonitoringGroups, isGroupAdjustmentPending} = useFetchMembers(monitoringGroups, !isMonitoringGroupListPending, setProgressValue, setMaxProgressValue, postMessage, postTimedMessage, postError)
    const [isDone, setIsDone] = useState(false)

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldFetch || !accessToken || isDone) return

        const url = `${baseURL}?page=${page}&perPage=1000`

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
                let response = await RestCentral.get(url, headers)
                console.log(response)

                let resRecords = response.data.records
                let newGroups = [...monitoringGroups]
                for (let index = 0; index < resRecords.length; index++) {
                    const data: CallMonitoringGroupData = resRecords[index]
                    const group = new CallMonitoringGroup(data)
                    newGroups.push(group)
                }
                setMonitoringGroups(newGroups)

                if (response.data.navigation.nextPage) {
                    if (response.rateLimitInterval > 0) {
                        setRateLimitInterval(response.rateLimitInterval)
                        postTimedMessage(new Message(`Rate limit reached. Waiting 60 seconds before continuing...`, 'info'), response.rateLimitInterval)
                    }
                    else {
                        setRateLimitInterval(250)
                    }
                    setPage(page + 1)
                }
                else {
                    setIsMonitoringGroupListPending(false)
                    setRateLimitInterval(0)
                    setIsDone(true)
                    setPage(1)
                }
            }
            catch (error: any) {
                console.log(error)
                postMessage(new Message(`Failed to fetch call monitoring groups.`, 'error'))
                postError(new SyncError('' , 0, ['Failed to fetch monititoring group', '']))
            }
        })

    }, [shouldFetch, baseURL, rateLimitInterval])

    return { adjustedMonitoringGroups, isGroupAdjustmentPending }
}

export default useCallMonitoringList