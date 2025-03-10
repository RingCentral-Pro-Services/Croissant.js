import { Request, Response } from "express";
import { SDK } from '@ringcentral/sdk';
import { TokenData } from "../interfaces/TokenData";
import { getToken } from "psi-auth";
const axios = require('axios').default;

export const processAuth = async (req: Request, res: Response, next: any) => {
    const state = req.query.state
    const code = req.query.code

    if (!code || typeof code !== 'string') {
        res.redirect(`/token`)
        return
    }

    const data = await fetchToken(code, process.env.RC_REDIRECT_URI!)

    if (!data) {
        res.redirect(`/token`)
        return
    }

    const refreshToken = data.refresh_token
    const accessToken = data.access_token

    res.cookie('auth_token', accessToken)
    res.cookie('auth_refresh', refreshToken)
    res.redirect(`/token?state=${state}`)
}

export const processBizAuth = async (req: Request, res: Response, next: any) => {
    const state = req.query.state
    const code = req.query.code

    if (!code || typeof code !== 'string') {
        res.redirect(`/error`)
        return
    }

    const data = await fetchToken(code, process.env.RC_REDIRECT_URI!)

    if (!data) {
        res.redirect(`/token`)
        return
    }

    const refreshToken = data["refresh_token"]
    const accessToken = data["access_token"]

    res.cookie('auth_token', accessToken)
    res.cookie('auth_refresh', refreshToken)
    res.redirect(`/biztoken?state=${state}`)
}

const fetchToken = async (code: string, redirectUri: string) => {
    try {
        const rcsdk = new SDK({
            server: SDK.server.production,
            clientId: process.env.RC_CLIENT_ID,
            clientSecret: process.env.RC_CLIENT_SECRET,
            redirectUri: redirectUri
        })
        const platform = rcsdk.platform()
        var response = await platform.login({ code: code })
        const data: TokenData = await response.json()
        return data
    }
    catch (e) {
        console.log('Failed to fetch token')
        console.log(e)
    }
}

export const refreshToken = async (req: Request, res: Response, next: any) => {
    try {
        const refreshToken = req.query.refresh_token

        if (!refreshToken || typeof refreshToken !== 'string') {
            res.status(400).send({ message: 'Invalid refresh token' })
            return
        }

        const headers = {
            "Content-type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + Buffer.from(process.env.RC_CLIENT_ID + ":" + process.env.RC_CLIENT_SECRET).toString('base64')
        }

        const response = await axios.post(`${process.env.RC_PLATFORM_URL}/restapi/oauth/token`, `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${process.env.RC_CLIENT_ID}`, { headers: headers })
        const accessToken = response.data.access_token
        const newRefreshToken = response.data.refresh_token

        if (!accessToken || !newRefreshToken) {
            res.status(500).send({ message: 'Internal server error' })
            return
        }

        const body = {
            "access_token": accessToken,
            "refresh_token": newRefreshToken
        }

        res.send(body)
    }
    catch (e) {
        console.log('Failed to refresh token')
        console.log(e)
        res.status(500).send({ message: 'Internal server error' })
    }
}

export const testJwks = async (req: Request, res: Response) => {
    try {
        const tokenData = await getToken({
            accountId: process.env.NEW_JWKS_ACCOUNT_ID!,
            appName: process.env.NEW_JWKS_APP_NAME!
        })

        if (!tokenData) {
            console.log('Next-generation JWKS request failed')
            return res.status(500).send('Request failed')
        }

        console.log('Next-generation JWKS response')
        console.log(tokenData)
        return res.status(200).send('Request succeeded')
    }
    catch (e: any) {
        console.log('Next-generation JWKS request failed')
        console.log(e)
        return res.status(500).send('Request failed')
    }
}