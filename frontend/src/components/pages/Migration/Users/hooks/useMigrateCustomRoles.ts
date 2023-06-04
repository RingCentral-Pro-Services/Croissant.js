import { useState } from "react";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { Role } from "../models/Role";

const useMigrateCustomRoles = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const url = 'https://platform.ringcentral.com/restapi/v1.0/account/~/user-role'
    const baseWaitingPeriod = 250

    const migrateCustomRoles = async (customRoles: Role[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setMaxProgress(customRoles.length)
        const migratedRoles: Role[] = []

        for (let role of customRoles) {
            await migrateRole(role, accessToken)
            migratedRoles.push(role)
            setProgressValue((prev) => prev + 1)
        }
        return migratedRoles
    }

    const migrateRole = async (role: Role, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.post(url, headers, role)
            role.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to create custom role`)
            console.log(e)
            postMessage(new Message(`Failed to create custom role ${role.displayName} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to create custom role', role.displayName], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {migrateCustomRoles, progressValue, maxProgress}
}

export default useMigrateCustomRoles