import { useEffect, useState } from "react";
import { Role } from "../../../../models/ExtensionData";
import { Message } from "../../../../models/Message";
import { SyncError } from "../../../../models/SyncError";
import { RestCentral } from "../../../../rcapi/RestCentral";


const useFetchRoles = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [isFetchingRoles, setIsFetchingRoles] = useState(false)
    const [roles, setRoles] = useState<Role[]>([])
    const url = 'https://platform.ringcentral.com/restapi/v1.0/account/~/user-role?perPage=1000'
    const baseWaitingPeriod = 250

    const fetchRoles = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setIsFetchingRoles(true)
        let roles: Role[] = []
        await getRoles(roles, accessToken)
        setRoles(roles)
        setIsFetchingRoles(false)
        return roles
    }

    const getRoles = async (roles: Role[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(url, headers)
            const records = response.data.records as Role[]

            roles.push(...records)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to fetch custom roles`)
            console.log(e)
            postMessage(new Message(`Failed to fetch custom roles ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to fetch custom roles', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {fetchRoles, roles}
}

export default useFetchRoles