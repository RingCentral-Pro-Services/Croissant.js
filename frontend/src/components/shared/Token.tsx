import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Token = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const params = new URLSearchParams(location.search);
    const access_token = params.get("access_token");

    useEffect(() => {
        if (!access_token) {
            return
        }

        let date = new Date()
        date.setTime(date.getTime() + 1 * 60 * 60 * 1000)

        localStorage.setItem('rc_access_token', access_token)
        localStorage.setItem('rc_token_expiry', `${date.getTime()}`)
        navigate('/')
    }, [access_token, navigate])

    return (
        <>
            <p>Access token: {access_token}</p>
        </>
    )
}

export default Token