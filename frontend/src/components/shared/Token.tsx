import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSetAtom } from 'jotai'
import { userAtom } from "../../App";
import useCurrentUser from "../../hooks/useCurrentUser";

const Token = () => {
    const {getCurrentUser} = useCurrentUser()
    const navigate = useNavigate()
    const location = useLocation()
    const params = new URLSearchParams(location.search);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    let destination = params.get("state");
    const setUser = useSetAtom(userAtom)

    useEffect(() => {
        if (!access_token) {
            return
        }

        let date = new Date()
        date.setTime(date.getTime() + 1 * 60 * 60 * 1000)

        localStorage.setItem('rc_access_token', access_token)
        localStorage.setItem('rc_token_expiry', `${date.getTime()}`)
        localStorage.setItem('rc_refresh_token', refresh_token ?? '')

        setUserDetails()

        navigate(`/${destination === 'create-ivr' ? '': destination}`)
    }, [access_token, navigate])

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
        <>
            <p>Access token: {access_token}</p>
        </>
    )
}

export default Token