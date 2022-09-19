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

        localStorage.setItem('rc_access_token', access_token)
        navigate('/')
    }, [access_token, navigate])

    return (
        <>
            <p>Access token: {access_token}</p>
        </>
    )
}

export default Token