import { Extension } from "../../../../models/Extension"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useExtension = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, isMultiSiteEnabled: boolean, callback: () => void) => {
    const baseCreateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'
    const baseRoleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/assigned-role'
    const baseWaitingPeriod = 250

    const createExtension = async (extension: Extension, id?: string) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        if (extension.data.type === 'User' && extension.data.subType !== 'VideoPro' && id) {
            // Yee haw. Create a new licensed user
            await createLicensedExtension(extension, id, accessToken)
            await setRole(extension, accessToken)
        }
        else if (extension.data.type === 'Limited' && id) {
            // Yee haw. Create a new limited extension
            await createLicensedExtension(extension, id, accessToken)
        }
        else {
            // This is a boring old message-only extension, announcement-only extension, or a video pro extension
            await createUnlicensedExtension(extension, accessToken)
        }
        callback()
    }

    const createUnlicensedExtension = async (extension: Extension, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.post(baseCreateURL, headers, extension.payload(isMultiSiteEnabled))
            extension.data.id =response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to make extension ${extension.data.name}`)
            console.log(e)
            postMessage(new Message(`Failed to make extension ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to create extension', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const createLicensedExtension = async (extension: Extension, id: string, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseUpdateURL.replace('extensionId', id)
            const response = await RestCentral.put(url, headers, extension.payload(isMultiSiteEnabled))
            extension.data.id =response.data.id
            
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to make extension ${extension.data.name}`)
            console.log(e)
            postMessage(new Message(`Failed to make extension ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to create extension', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setRole = async (extension: Extension, token: string) => {
        if (!extension.data.id || !extension.data.roles || extension.data.roles.length === 0) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseRoleURL.replace('extensionId', `${extension.data.id}`)
            console.log(`Role URL: ${url}`)
            const response = await RestCentral.put(url, headers, extension.rolePayload())
            
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set role ${extension.data.name}`)
            console.log(e)
            postMessage(new Message(`Failed to set role ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to set role', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {createExtension}

}

export default useExtension