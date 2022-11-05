import { useState } from "react"
import { RestCentral } from "./RestCentral"

const useGetCompanyName = () => {
    const [companyName, setCompantName] = useState('')
    const [rateLimitInterval, setRateLimitInterval] = useState(0)
    const [isCompanyNamePending, setIsCompanyNamePending] = useState(true)
    const url = 'https://platform.ringcentral.com/restapi/v1.0/account/~/business-address'
    const accessToken = localStorage.getItem('cs_access_token')

    const getCompanyName = () => {
        if (!accessToken) return

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
                let res = await RestCentral.get(url, headers)
                setCompantName(res.data.company)
                setIsCompanyNamePending(false)
            }
            catch (e) {
                console.log('Failed to get company name')
            }
        }, rateLimitInterval)
    }

    return {companyName, isCompanyNamePending, getCompanyName}
}

export default useGetCompanyName