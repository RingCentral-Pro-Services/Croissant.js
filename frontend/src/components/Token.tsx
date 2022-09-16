import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
const axios = require('axios').default;

const Token = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const params = new URLSearchParams(location.search);
    const access_token = params.get("access_token");

    useEffect(() => {
        if (!access_token) {
            return
        }

        const url = 'https://platform.devtest.ringcentral.com/restapi/v1.0/account/~/extension/~/notification-settings'
        axios
        .get(url, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
        })
        .then((res: any) => {
            console.log('RC API response')
            console.log(res)
        })
    }, [])

    return (
        <>
            <p>Access token: {access_token}</p>
        </>
    )
}

export default Token