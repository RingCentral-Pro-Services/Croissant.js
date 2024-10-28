import { wait } from "../../../../helpers/rcapi"
import { Extension } from "../../../../models/Extension"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

export const useParkLocations = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseCreateExtensionUrl = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const baseMembersUrl = 'https://platform.ringcentral.com/restapi/v1.0/account/~/park-locations/parkLocationId/bulk-assign'
    const baseWaitingPeriod = 250

    const createParkLocation = async (parkLocationName: string, site: Extension, extensionNumber: number, members: Extension[]) => {
        const id = await createExtension(parkLocationName, extensionNumber, site)
        if (!id) {
            return
        }

        await addMembers(id, parkLocationName, members)
        return id
    }

    const createExtension = async (parkLocationName: string, extensionNumber: number, site: Extension) => {
        try {
            const token = localStorage.getItem('cs_access_token')
            if (!token) {
                console.log('No token!')
                return
            }

            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const body = {
                contact: {
                    firstName: parkLocationName
                },
                site: {
                    id: site.data.id
                },
                extensionNumber: extensionNumber,
                type: 'ParkLocation'
            }
            const res = await RestCentral.post(baseCreateExtensionUrl, headers, body)

            if (res.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${res.rateLimitInterval / 1000} seconds`, 'info'), res.rateLimitInterval)
            }
            
            res.rateLimitInterval > 0 ? await wait(res.rateLimitInterval) : await wait(baseWaitingPeriod)
            return res.data.id
        }
        catch (e: any) {
            console.log(`Failed to create park location ${parkLocationName}`)
            console.log(e)
        }
    }

    const addMembers = async (id: string | number, parkLocationName: string, members: Extension[]) => {
        try {
            const token = localStorage.getItem('cs_access_token')
            if (!token) {
                console.log('No token!')
                return
            }

            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const body = {
                addedUserIds: members.map((member) => member.data.id)
            }
            const res = await RestCentral.post(baseMembersUrl.replaceAll('parkLocationId', `${id}`), headers, body)

            if (res.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${res.rateLimitInterval / 1000} seconds`, 'info'), res.rateLimitInterval)
            }
            
            res.rateLimitInterval > 0 ? await wait(res.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            console.log(`Failed to add members to park location ${parkLocationName}`)
            console.log(e)
        }
    }

    return { createParkLocation }
}