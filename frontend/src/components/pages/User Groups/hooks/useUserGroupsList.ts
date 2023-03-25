import { useEffect, useState } from "react"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { UserGroup, UserGroupData, UserGroupMember } from "../models/UserGroup"

const useUserGroupsList = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [userGroups, setUserGroups] = useState<UserGroup[]>([])
    const [completedUserGroups, setCompletedUserGroups] = useState<UserGroup[]>([])
    const [isUserGroupsListPending, setIsUserGroupsListPending] = useState(true)
    const [shouldFetch, setShouldFetch] = useState(false)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [page, setPage] = useState(1)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [shouldFetchMembers, setShouldFetchMembers] = useState(false)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/user-group'
    const baseMembersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/user-group/groupID/members'

    const fetchUserGroups = () => {
        setShouldFetch(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldFetch || !accessToken) return

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
                const url = `${baseURL}?page=${page}&perPage=1000`
                const response = await RestCentral.get(url, headers)

                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }

                const records = response.data.records
                const groupData = records as UserGroupData[]
                const groups = groupData.map(group => new UserGroup(group))
                setUserGroups((prev) => [...prev, ...groups])

                if (response.data.navigation.nextPage) {
                    setPage(page + 1)
                    setRateLimitInterval(250)
                }
                else {
                    setShouldFetchMembers(true)
                    setShouldFetch(false)
                }
            }
            catch (e: any) {
                console.log('Failed to fetch user groups')
                console.log(e)
                postMessage(new Message(`Failed to fetch user groups`, 'error'))
                postError(new SyncError('', 0, ['Failed to tech user groups', ''], e.error ?? ''))
            }
        }, rateLimitInterval)
    }, [shouldFetch, rateLimitInterval, baseURL])

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldFetchMembers || !accessToken) return
        if (currentExtensionIndex >= userGroups.length) {
            setIsUserGroupsListPending(false)
            setShouldFetchMembers(false)
            return
        }

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
                const url = `${baseMembersURL.replace('groupID', userGroups[currentExtensionIndex].data.id!)}?page=${page}&perPage=1000`
                const response = await RestCentral.get(url, headers)

                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }
                const members = response.data.records as UserGroupMember[]
                userGroups[currentExtensionIndex].data.users = members
                setCompletedUserGroups((prev) => [...prev, userGroups[currentExtensionIndex]])
                setCurrentExtensionIndex(currentExtensionIndex + 1)
            }
            catch (e: any) {
                console.log('Failed to fetch user group members')
                console.log(e)
                postMessage(new Message(`Failed to fetch user group members`, 'error'))
                postError(new SyncError('', 0, ['Failed to fetch group members', ''], e.error ?? ''))
            }
        }, rateLimitInterval)
    }, [shouldFetchMembers, currentExtensionIndex, rateLimitInterval, baseMembersURL])

    return { userGroups, completedUserGroups, isUserGroupsListPending, fetchUserGroups }
}

export default useUserGroupsList