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

const loginUrl = `${process.env.REACT_APP_AUTH_BASE}&client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_AUTH_REDIRECT}&state=create-ivr`

const Token = () => {
    const {getCurrentUser} = useCurrentUser()
    const navigate = useNavigate()
    const location = useLocation()
    const params = new URLSearchParams(location.search);
    let destination = params.get("state");
    const setUser = useSetAtom(userAtom)
    const accessToken = getCookie('auth_token')
    const refreshToken = getCookie('auth_refresh')
    const admin = getCookie('admin')

    useEffect(() => {
        if (!accessToken || !refreshToken) {
            window.location.replace(loginUrl)
            return
        }

        console.log(`admin: |${admin}|`)
        console.log(typeof admin)

        let date = new Date()
        date.setTime(date.getTime() + 1 * 60 * 60 * 1000)

        localStorage.setItem('rc_access_token', accessToken)
        localStorage.setItem('rc_token_expiry', `${date.getTime()}`)
        localStorage.setItem('rc_refresh_token', refreshToken)

        deleteCookie('auth_token')
        deleteCookie('auth_refresh')
        deleteCookie('admin')
        setUserDetails()

        navigate(`/${destination === 'create-ivr' ? '': destination}`)
    }, [])

    const setUserDetails = async () => {
        const currentUser = await getCurrentUser()
        if (!currentUser) return
        setUser({
            name: currentUser.data.name,
            email: currentUser.data.contact.email,
            isAdmin: admin === 'true'
        })
        localStorage.setItem('currentUser', JSON.stringify({
            name: currentUser.data.name,
            email: currentUser.data.contact.email,
            isAdmin: admin === 'true'
        }))
    }
    

    return (
        <></>
    )
}

export default Token