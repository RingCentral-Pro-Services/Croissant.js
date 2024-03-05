import { Request, Response } from "express";
import { SDK } from '@ringcentral/sdk';
import { getUserData } from './userService'
import { isDepartmentWhiteListed, isUserWhiteListed } from '../../access-control/services/accessControlService'
import { isUserAdmin } from "../../access-control/services/dbService";
import { AuditTrailItem } from "../../audit-trail/interface/AuditTrailItem";
import { addAuditTrailItem } from "../../audit-trail/services/dbService";
import { TokenData } from "../interfaces/TokenData";
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

    const user = await getUserData(accessToken)

    if (!user) {
        res.redirect(`/token`)
        return
    }

    if (process.env.DISABLE_WHITELIST_CHECK !== 'true') {
        const departmentWhitelisted = await isDepartmentWhiteListed(user.contact.department)

        if (!departmentWhitelisted) {
            const userWhiteListed = await isUserWhiteListed(user.id)

            if (!userWhiteListed) {
                const auditItem: AuditTrailItem = {
                    action: 'Failed login attempt (Not whitelisted)',
                    initiator: user.name,
                    tool: 'Auth',
                    type: 'Login',
                    uid: 'N/A'
                }
                addAuditTrailItem(auditItem)
                res.redirect(`/access-denied`)
                return
            }
        }
    }

    const auditItem: AuditTrailItem = {
        action: 'Successfully logged in',
        initiator: user.name,
        tool: 'Auth',
        type: 'Login',
        uid: 'N/A'
    }
    addAuditTrailItem(auditItem)

    const isAdmin = await isUserAdmin(user.id)

    res.cookie('auth_token', accessToken)
    res.cookie('auth_refresh', refreshToken)
    res.cookie('admin', isAdmin)
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