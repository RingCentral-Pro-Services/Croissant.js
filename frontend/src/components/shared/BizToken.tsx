import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSetAtom } from 'jotai'
import { userAtom } from "../../App";
import useCurrentUser from "../../hooks/useCurrentUser";

const getCookie = (key: string) => {
    var b = document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");
    return b ? b.pop() : "";
}

const deleteCookie = (key: string) => {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

const BizToken = () => {
    const {getCurrentUser} = useCurrentUser()
    const navigate = useNavigate()
    const location = useLocation()
    const params = new URLSearchParams(location.search);
    let destination = params.get("state");
    const setUser = useSetAtom(userAtom)
    const accessToken = getCookie('auth_token')
    const refreshToken = getCookie('auth_refresh')

    useEffect(() => {
        if (!accessToken || !refreshToken) return

        let date = new Date()
        date.setTime(date.getTime() + 1 * 60 * 60 * 1000)

        localStorage.setItem('cs_access_token', accessToken)
        localStorage.setItem('cs_token_expiry', `${date.getTime()}`)
        localStorage.setItem('cs_refresh_token', refreshToken)
        sessionStorage.setItem('accountType', 'segregated')

        deleteCookie('auth_token')
        deleteCookie('auth_refresh')
        setUserDetails()

        navigate(`/${destination === 'create-ivr' ? '': destination}?authed=true`)
    }, [])

    const setUserDetails = async () => {
        const currentUser = await getCurrentUser()
        if (!currentUser) return
        setUser({
            name: currentUser.data.name,
            email: currentUser.data.contact.email
        })
        localStorage.setItem('currentUser', JSON.stringify({
            name: currentUser.data.name,
            email: currentUser.data.contact.email
        }))
    }
    

    return (
        <></>
    )
}

export default BizToken