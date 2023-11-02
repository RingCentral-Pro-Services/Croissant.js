import { useState } from "react"
import { wait } from "../../../../../helpers/rcapi"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { CallMonitoringDataBundle, CallMonitoringMember } from "../models/CallMonitoringDataBundle"

const useFetchCallMonitoringGroups = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-monitoring-groups?perPage=1000'
    const baseMembersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-monitoring-groups/groupId/members'
    const baseWaitingPeriod = 250

    const fetchCallMonitoringGroups = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const groups = await fetchGroups(accessToken)

        // When requesting call monitoring groups, the API will return call monitoring groups as well as other extension types.
        // The actualGroups array contains on the actual call monitoring groups
        const actualGroups: CallMonitoringDataBundle[] = []
        if (!groups) return []
        setProgressValue(0)
        setMaxProgress(groups.length)

        for (let i = 0; i < groups.length; i++) {
            const members = await fetchMembers(groups[i], accessToken)
            setProgressValue((prev) => prev + 1)

            // Filter out extensions that aren't call monitoring groups. See comment above
            if (!members || members.length === 0){
                continue
            } 
            
            groups[i].data.members = members
            actualGroups.push(groups[i])
        }

        return actualGroups
    }

    const fetchGroups = async (token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseURL, headers)
            const records = response.data.records
            
            const groups: CallMonitoringDataBundle[] = []
            for (const record of records) {
                groups.push(new CallMonitoringDataBundle(record))
            }

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return groups
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get call monitoring groups`)
            console.log(e)
            postMessage(new Message(`Failed to get call monitoring groups ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', '', ['Failed to fetch call monitoring groups', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchMembers = async (group: CallMonitoringDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseMembersURL.replace('groupId', group.data.id!), headers)
            const records = response.data.records
            
            const members: CallMonitoringMember[] = []
            for (const record of records) {
                members.push(record)
            }

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return members
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get call monitoring members`)
            console.log(e)
            postMessage(new Message(`Failed to get call monitoring groups members for ${group.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(group.data.name, '', ['Failed to fetch call monitoring group member', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {fetchCallMonitoringGroups, progressValue, maxProgress}
}

export default useFetchCallMonitoringGroups