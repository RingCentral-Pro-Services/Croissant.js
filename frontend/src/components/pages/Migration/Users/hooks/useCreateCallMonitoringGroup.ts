import { wait } from "../../../../../helpers/rcapi";
import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { CallMonitoringDataBundle, CallMonitoringMember } from "../models/CallMonitoringDataBundle";

const useCreateCallMonitoringGroup = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseCreateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-monitoring-groups'
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/call-monitoring-groups/groupId/bulk-assign'
    const baseWaitingPeriod = 250

    const createMonitoringGroup = async (group: CallMonitoringDataBundle, originalExtensions: Extension[], targetExtensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await createGroup(group, accessToken)
        await setMembers(group, originalExtensions, targetExtensions, accessToken)
    }

    const createGroup = async (group: CallMonitoringDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.post(baseCreateURL, headers, {name: group.data.name})
            group.data.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to create call monitoring group`)
            console.log(e)
            postMessage(new Message(`Failed to create call monitoring group ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', '', ['Failed to create call monitoring group', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setMembers = async (group: CallMonitoringDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const goodMembers: CallMonitoringMember[] = []
            const badMembers: CallMonitoringMember[] = []
            for (const member of group.data.members) {
                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${member.id}`)
                if (!originalExtension) {
                    badMembers.push(member)
                    continue
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
                if (!newExtension) {
                    badMembers.push(member)
                    continue
                }

                goodMembers.push({id: `${newExtension.data.id}`, permissions: member.permissions})
            }

            if (badMembers.length !== 0) {
                postMessage(new Message(`${badMembers.length} members were removed from call monitoring group ${group.data.name} because they could not be found`, 'warning'))
                postError(new SyncError(group.data.name, '', ['Call monitoring members removed', badMembers.map((member) => member.extensionNumber).join(', ')]))
            }

            if (goodMembers.length === 0) return

            const response = await RestCentral.post(baseUpdateURL.replace('groupId', group.data.id!), headers, {addedExtensions: goodMembers})

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to add group members`)
            console.log(e)
            postMessage(new Message(`Failed to add members to call monitoring group ${group.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(group.data.name, '', ['Failed to add call monitoring members', ''], e.error ?? '', group))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {createMonitoringGroup}
}

export default useCreateCallMonitoringGroup