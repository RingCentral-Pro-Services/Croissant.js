import { wait } from "../../../../../helpers/rcapi"
import { Greeting } from "../../../../../models/Greetings"
import { RestCentral } from "../../../../../rcapi/RestCentral"

export interface StandardGreeting {
    catergory: string
    contentUri: string
    id: string
    name: string
    text: string
    type: string
    usageType: string
}

export const useStandardGreetings = () => {
    const baseGreetingsURL = 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting'
    const baseWaitingPeriod = 250

    const fetchStandardGreetings = async (usageType: 'UserExtensionAnsweringRule' | 'ExtensionAnsweringRule' | 'DepartmentExtensionAnsweringRule' | 'CompanyAnsweringRule' | 'CompanyAfterHoursAnsweringRule' | 'VoicemailExtensionAnsweringRule' | 'AnnouncementExtensionAnsweringRule' | 'AnnouncementExtensionAnsweringRule') => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const greetings = await getStandardGreetings(usageType, accessToken)
        return greetings ?? []
    }

    const getStandardGreetings = async (usageType: 'UserExtensionAnsweringRule' | 'ExtensionAnsweringRule' | 'DepartmentExtensionAnsweringRule' | 'CompanyAnsweringRule' | 'CompanyAfterHoursAnsweringRule' | 'VoicemailExtensionAnsweringRule' | 'AnnouncementExtensionAnsweringRule' | 'AnnouncementExtensionAnsweringRule', token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.get(`${baseGreetingsURL}?usageType=${usageType}`, headers)
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return response.data.records as StandardGreeting[]
        }
        catch (e: any) {        
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return { fetchStandardGreetings }
}