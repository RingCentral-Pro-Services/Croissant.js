import { useState } from "react"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { Role } from "../models/Role"

const useCustomRoleList = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void,) => {
    const [isFetchingRoles, setIsFetchingRoles] = useState(false)
    const url = 'https://platform.ringcentral.com/restapi/v1.0/account/~/user-role?custom=true&perPage=1000'
    const baseWaitingPeriod = 250

    const fetchCustomRoles = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setIsFetchingRoles(true)
        let roles: Role[] = []
        await fetchRoles(roles, accessToken)
        setIsFetchingRoles(false)
        return roles
    }

    const fetchRoles = async (roles: Role[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(url, headers)
            const records = response.data.records as Role[]

            for (const record of records) {
                roles.push(record)
            }

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
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

    return {fetchCustomRoles}
}

export default useCustomRoleList