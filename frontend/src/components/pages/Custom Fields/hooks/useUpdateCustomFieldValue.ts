import { wait } from "../../../../helpers/rcapi";
import { Message } from "../../../../models/Message";
import { SyncError } from "../../../../models/SyncError";
import { RestCentral } from "../../../../rcapi/RestCentral";
import { CustomFieldAssignment } from "../models/CustomFieldAssignment";

export const useUpdateCustomFieldValue = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'
    const baseWaitingPeriod = 250

    const updateCustomFieldValue = async (customFieldAssignment: CustomFieldAssignment) => {
        await updateValue(customFieldAssignment)
    }

    const updateValue = async (customFieldAssignment: CustomFieldAssignment) => {
        const token = localStorage.getItem('cs_access_token')
        if (!token) {
            throw new Error('No access token')
        }

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                customFields: [{
                    id: customFieldAssignment.data.customFieldId,
                    value: customFieldAssignment.data.value
                }]
            }

            const res = await RestCentral.put(baseURL.replace('extensionId', customFieldAssignment.data.extensionId), headers, body)
            console.log(res)

            if (res.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${res.rateLimitInterval / 1000} seconds`, 'info'), res.rateLimitInterval)
            }

            res.rateLimitInterval > 0 ? await wait(res.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get device IDs`)
            console.log(e)
            postMessage(new Message(`Failed to update ${customFieldAssignment.data.name} for ${customFieldAssignment.data.extensionName}. ${e.error ?? ''}`, 'error'))
            postError(new SyncError(customFieldAssignment.data.extensionName, '', ['Failed to update custom field', ''], e.error ?? '', customFieldAssignment))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return { updateCustomFieldValue }

}