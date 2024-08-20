import { Extension } from "../../../../models/Extension"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { ParkLocation } from "../models/ParkLocation"

const useAuditParkLocation = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, callback: (parkLocation: ParkLocation) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/park-locations/parkLocationId/users'
    const baseWaitingPeriod = 250

    const auditParkLocation = async (extension: Extension) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const parkLocation = new ParkLocation({
            name: extension.data.name,
            extensionNumber: extension.data.extensionNumber,
            id: `${extension.data.id}`,
            status: extension.data.status || '',
            members: []
        })
        await fetchMembers(parkLocation, accessToken)
        callback(parkLocation)
    }

    const fetchMembers = async (parkLocation: ParkLocation, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseURL.replace('parkLocationId', parkLocation.data.id)
            const response = await RestCentral.get(url, headers)

            const records = response.data.records
            const members = records.map((record: any) => `${record.extensionNumber}`)

            parkLocation.data.members = members

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to fetch members for ${parkLocation.data.name}`)
            console.log(e)
            postMessage(new Message(`Failed to fetch members for ${parkLocation.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(parkLocation.data.name, parseInt(parkLocation.data.extensionNumber), ['Failed to fetch members', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return { auditParkLocation }
}

export default useAuditParkLocation