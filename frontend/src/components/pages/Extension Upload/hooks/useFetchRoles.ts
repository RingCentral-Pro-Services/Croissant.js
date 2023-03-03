import { useEffect, useState } from "react";
import { Role } from "../../../../models/ExtensionData";
import { RestCentral } from "../../../../rcapi/RestCentral";


const useFetchRoles = () => {
    const [roles, setRoles] = useState<Role[]>([])
    const [shouldFetch, setShouldFetch] = useState(false)
    const [isRoleListPending, setIsRoleListPending] = useState(true)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const url = 'https://platform.ringcentral.com/restapi/v1.0/account/~/user-role'

    const fetchRoles = () => {
        setShouldFetch(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken || !shouldFetch) return

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
                const response = await RestCentral.get(url, headers)
                const roles = response.data.records as Role[]
                setRoles(roles)

                setShouldFetch(false)
                setIsRoleListPending(false)
            }
            catch (e: any) {
                console.log('Failed to fetch roles')
                console.log(e)
            }
        }, rateLimitInterval)
    }, [shouldFetch, url, rateLimitInterval])

    return { roles, fetchRoles, isRoleListPending }
}

export default useFetchRoles