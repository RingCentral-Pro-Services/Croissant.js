import { useState } from "react";
import { wait } from "../../../../../helpers/rcapi";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { UserGroupDataBundle, UserGroupMember } from "../models/UserGroupDataBundle";

const useFetchUserGroups = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const baseUserGroupsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/user-group'
    const baseMembersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/user-group/groupId/members'
    const baseWaitingPeriod = 250

    const fetchUserGroups = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const bundles = await fetchBaseData(accessToken)
        setMaxProgress(bundles.length)

        for (let i = 0; i < bundles.length; i++) {
            await fetchMembers(bundles[i], accessToken)
            setProgressValue((prev) => prev + 1)
        }

        return bundles
    }

    const fetchBaseData = async (token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseUserGroupsURL, headers)
            const records = response.data.records
            
            const groups: UserGroupDataBundle[] = []
            for (const record of records) {
                groups.push(new UserGroupDataBundle(record))
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
            console.log(`Failed to get user groups`)
            console.log(e)
            postMessage(new Message(`Failed to get user groups ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', '', ['Failed to fetch user groups', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return []
        }
    }

    const fetchMembers = async (bundle: UserGroupDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseMembersURL.replace('groupId', `${bundle.data.id}`), headers)
            const records = response.data.records as UserGroupMember[]
            bundle.data.members = records

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get user group members`)
            console.log(e)
            postMessage(new Message(`Failed to get members of user group ${bundle.data.displayName} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.data.displayName, '', ['Failed to fetch user group members', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {fetchUserGroups, progressValue, maxProgress}
}

export default useFetchUserGroups