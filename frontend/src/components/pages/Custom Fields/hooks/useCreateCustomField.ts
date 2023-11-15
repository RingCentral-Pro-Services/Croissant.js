import { wait } from "../../../../helpers/rcapi"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { CustomFieldData } from "../models/CustomField"

export const useCreateCustomField = () => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/custom-fields'
    const baseWaitingPeriod = 250

    const createCustomField = async (customField: CustomFieldData) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        if (customField.id && customField.id.length > 0) {
            await editField(customField, accessToken)
        }
        else {
            await createField(customField, accessToken)
        }
    }

    const deleteCustomField = async (customField: CustomFieldData) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }
        deleteField(customField, accessToken)
    }

    const createField = async (customField: CustomFieldData, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                category: customField.category,
                displayName: customField.displayName,
            }

            const res = await RestCentral.post(baseURL, headers, body)
            console.log(res)

            res.rateLimitInterval > 0 ? await wait(res.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            console.log(`Failed to create custom field`)
            console.log(e)
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const editField = async (customField: CustomFieldData, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                category: customField.category,
                displayName: customField.displayName,
            }

            const res = await RestCentral.put(`${baseURL}/${customField.id}`, headers, body)
            console.log(res)

            res.rateLimitInterval > 0 ? await wait(res.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            console.log(`Failed to edit custom field`)
            console.log(e)
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const deleteField = async (customField: CustomFieldData, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const res = await RestCentral.delete(`${baseURL}/${customField.id}`, headers)
            console.log(res)

            res.rateLimitInterval > 0 ? await wait(res.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            console.log(`Failed to delete custom field`)
            console.log(e)
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return { createCustomField, deleteCustomField }
}