import { wait } from "../../../../helpers/rcapi"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useCreateUnassignedDevices = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const url = 'https://platform.ringcentral.com/restapi/v2/accounts/~/device-inventory'
    const baseWaitingPeriod = 250
    const MAX_BATCH_SIZE = 50

    const createDevices = async (total: number, siteID?: string) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        let remaining = total
        const deviceIDs: string[] = []

        while (remaining > 0) {
            const batchSize = Math.min(MAX_BATCH_SIZE, remaining)
            const batchIDs = await batchCreateDevices(batchSize, accessToken, siteID)
            deviceIDs.push(...batchIDs)
            remaining -= batchSize
        }

        return deviceIDs
    }

    const batchCreateDevices = async (count: number, token: string, siteID?: string) => {

        if (count > MAX_BATCH_SIZE) {
            throw new Error('Batch size too large')
        }

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                type: 'OtherPhone',
                quantity: count,
                ...(siteID && (siteID !== 'Undefined') && (siteID !== 'undefined') && {site: {id: siteID}})
            }

            const response = await RestCentral.post(url, headers, body)
            const deviceIDs = response.data.devices.map((device: any) => device.id)
            return deviceIDs
            
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to bulk create unassigned devices`)
            console.log(e)
            postMessage(new Message(`Failed to batch create unassigned devices ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to batch create unassigned devices', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return []
        }

    }

    return {createDevices}
}

export default useCreateUnassignedDevices