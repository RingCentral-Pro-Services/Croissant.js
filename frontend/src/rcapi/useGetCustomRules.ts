import { useState } from "react";
import { CustomRule } from "../models/CustomRule";
import { RestCentral } from "./RestCentral";

const useGetCustomRules = () => {
    const [customRules, setCustomRules] = useState<CustomRule[]>([])
    const [isCustomRulesListPending, setIsCustomRulesListPending] = useState(true)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule?type=Custom&view=Detailed'

    const getCustomRules = (id: string) => {
        const doStuff = async () => {
            try {
                const accessToken = localStorage.getItem('cs_access_token')
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
                const response = await RestCentral.get(baseURL.replace('extensionId', id), headers)
                console.log(response)
                const customRules = response.data.records as CustomRule[]
                setCustomRules(customRules)
                setIsCustomRulesListPending(false)
            }
            catch (e: any) {
                console.log('Failed to get custom rules')
                console.error(e)
            }
        }
        doStuff()
    }

    return { getCustomRules, customRules, isCustomRulesListPending }
}

export default useGetCustomRules;