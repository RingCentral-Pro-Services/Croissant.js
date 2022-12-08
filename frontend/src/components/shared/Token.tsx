import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Token = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const params = new URLSearchParams(location.search);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    let destination = params.get("state");

    useEffect(() => {
        if (!access_token) {
            return
        }

        console.log(`State: ${destination}`)
        let date = new Date()
        date.setTime(date.getTime() + 1 * 60 * 60 * 1000)

        localStorage.setItem('rc_access_token', access_token)
        localStorage.setItem('rc_token_expiry', `${date.getTime()}`)
        localStorage.setItem('rc_refresh_token', refresh_token ?? '')
        navigate(`/${destination === 'create-ivr' ? '': destination}`)
    }, [access_token, navigate])

    return (
        <>
            <p>Access token: {access_token}</p>
        </>
    )
}

export default Token