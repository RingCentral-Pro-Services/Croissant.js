import { useState } from "react"
import { wait } from "../../../../../helpers/rcapi"
import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { UserGroupDataBundle, UserGroupManager, UserGroupMember } from "../models/UserGroupDataBundle"

const useCreateUserGroups = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const baseUserGroupsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/user-group'
    const baseWaitingPeriod = 250

    const createUserGroups = async (bundles: UserGroupDataBundle[], originalExtensions: Extension[], targetExtensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setMaxProgress(bundles.length)
        for (const bundle of bundles) {
            await createGroup(bundle, originalExtensions, targetExtensions, accessToken)
            setProgressValue((prev) => prev + 1)
        }
    }

    const createGroup = async (group: UserGroupDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const goodManagers: UserGroupManager[] = []
            for (const manager of group.data.managers) {
                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${manager.id}`)
                if (!originalExtension) {
                    postMessage(new Message(`Failed to set ${manager.firstName} ${manager.lastName} as manager of ${group.data.displayName}. Old ID not found`, 'warning'))
                    postError(new SyncError(group.data.displayName, '', ['Failed to set user group manager. Old ID', `${manager.firstName} ${manager.lastName}`]))
                    continue
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
                if (!newExtension) {
                    postMessage(new Message(`Failed to set ${manager.firstName} ${manager.lastName} as manager of ${group.data.displayName}. New ID not found`, 'warning'))
                    postError(new SyncError(group.data.displayName, '', ['Failed to set user group manager. New ID', `${manager.firstName} ${manager.lastName}`]))
                    continue
                }

                goodManagers.push({id: `${newExtension.data.id}`})
            }

            if (goodManagers.length === 0) return

            const goodMembers: UserGroupMember[] = []
            for (const member of group.data.members!) {
                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${member.id}`)
                if (!originalExtension) {
                    postMessage(new Message(`Failed to set ext. ${member.extensionNumber} as a member of ${group.data.displayName}. Old ID not found`, 'warning'))
                    postError(new SyncError(group.data.displayName, '', ['Failed to set user group member. Old ID', `ext.${member.extensionNumber}`]))
                    continue
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
                if (!newExtension) {
                    postMessage(new Message(`Failed to set ext. ${member.extensionNumber} as a member of ${group.data.displayName}. New ID not found`, 'warning'))
                    postError(new SyncError(group.data.displayName, '', ['Failed to set user group manager. New ID', `${member.extensionNumber}`]))
                    continue
                }

                goodMembers.push({id: `${newExtension.data.id}`})
            }

            if (goodMembers.length === 0) return

            const body = {
                displayName: group.data.displayName,
                ...(group.data.description && {description: group.data.description}),
                managers: goodManagers,
                members: goodMembers
            }
            
            const response = await RestCentral.post(baseUserGroupsURL, headers, body)
            group.data.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to create call monitoring group`)
            console.log(e)
            postMessage(new Message(`Failed to create user group ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', '', ['Failed to create user group', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {createUserGroups, progressValue, maxProgress}
}

export default useCreateUserGroups