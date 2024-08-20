import { wait } from "../../../../../helpers/rcapi"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { Device } from "../../User Data Download/models/UserDataBundle"

interface DeviceResponse {
    devices: Device[]
    hasNextPage: boolean
}

const useAccountDevices = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/device?perPage=1000&page=PAGE'
    const baseWaitingPeriod = 250

    const fetchAccountDevices = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const devices: Device[] = []
        let nextPage = true
        let page = 1
        while (nextPage) {
            const response = await getDevices(page, accessToken)
            devices.push(...response.devices)
            if (response.hasNextPage) {
                nextPage = true
                page += 1
            }
            else {
                nextPage = false
            }
        }

        return devices
    }

    const getDevices = async (page: number, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.get(baseURL.replace('PAGE', `${page}`), headers)
            const devices = response.data.records as Device[]
            let hasNextPage = false
            if (response.data.navigation?.nextPage) hasNextPage = true
            const deviceResponse: DeviceResponse = {
                devices: devices,
                hasNextPage: hasNextPage
            }


            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return deviceResponse
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get account devices`)
            console.log(e)
            postMessage(new Message(`Failed to get account devices ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to get account devices', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return {
                devices: [],
                hasNextPage: false
            }
        }
    }

    return {fetchAccountDevices}
}

export default useAccountDevices