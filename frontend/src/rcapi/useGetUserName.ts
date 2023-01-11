import { useState } from "react"
import { RestCentral } from "./RestCentral"

const useGetUserName = () => {
    const [userName, setUserName] = useState('')
    const [rateLimitInterval, setRateLimitInterval] = useState(0)
    const [isUserNamePending, setIsUserNamePending] = useState(true)
    const url = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/~'

    const getUserName = () => {
        const accessToken = localStorage.getItem('rc_access_token')
        if (!accessToken) return
        setUserName('')
        setIsUserNamePending(true)

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
                let res = await RestCentral.get(url, headers)
                setUserName(res.data.name)
                setIsUserNamePending(false)
            }
            catch (e: any) {
                console.log('Failed to get user name')
                setUserName('')
                setIsUserNamePending(false)
            }
        }, rateLimitInterval)
    }

    return {userName, isUserNamePending, getUserName}
}

export default useGetUserName