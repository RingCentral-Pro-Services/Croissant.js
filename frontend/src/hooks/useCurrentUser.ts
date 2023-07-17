import { wait } from "../helpers/rcapi"
import { Extension } from "../models/Extension"
import { ExtensionData } from "../models/ExtensionData"
import { RestCentral } from "../rcapi/RestCentral"

const useCurrentUser = () => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/~'
    const baseWaitingPeriod = 250

    const getCurrentUser = async () => {
        const token = localStorage.getItem('rc_access_token')
        if (!token) {
            return
        }

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.get(baseURL, headers)
            const extensionData = response.data as ExtensionData
            const user = new Extension(extensionData)
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
            return user
        }
        catch (e: any) {
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            console.log('Faield to get current user')
            console.log(e)
        }
    }

    return {getCurrentUser}
}

export default useCurrentUser