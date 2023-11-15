import { wait } from "../../../../helpers/rcapi"
import { Message } from "../../../../models/Message"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { CustomField, CustomFieldData } from "../models/CustomField"

export const useCustomFieldList = () => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/custom-fields'
    const baseWaitingPeriod = 250

    const fetchCustomFieldList = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const customFields = await getCustomFields(accessToken)
        if (!customFields) {
            console.log('Failed to fetch custom fields')
            return []
        }

        return customFields
    }

    const getCustomFields = async (token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const res = await RestCentral.get(baseURL, headers)
            const records: CustomFieldData[] = res.data.records
            const customFields = records.map((record) => new CustomField(record))

            res.rateLimitInterval > 0 ? await wait(res.rateLimitInterval) : await wait(baseWaitingPeriod)

            return customFields
        }
        catch (e: any) {
            console.log(`Failed to fetch custom fields`)
            console.log(e)
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return { fetchCustomFieldList }
}