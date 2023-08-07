import rateLimit from "../helpers/rateLimit";
const axios = require('axios').default;
const sign = require('jwt-encode');


export class RestCentral {

    static TOKEN_REFRESH_THRESHOLD = 300000 // 300K miliseconds or 5 minutes

    static get = async (url: string, headers: any) => {
        if (this.isCustomerTokenAboutToExpire()) {
            console.log('Customer token is about to expire. Fetching new token.')
            const accountType = sessionStorage.getItem('accountType')

            if (!accountType || accountType !== 'segregated') {
                await this.fetchCustomerTokenAsync()
            }
            else {
                await this.refreshSegregatedTokenAsync()
            }
        }
        if (this.isRCTokenAboutToExpire()) {
            console.log('RC token is about to expire. Fetching new token.')
            await this.refreshRCRokenAsync()
        }

        try {
            const res = await axios.get(url, {
                headers: headers
            })
            const response: APIResponse = {
                data: res.data,
                rateLimitInterval: rateLimit(res.headers)
            }
            return response
        } catch (res: any) {
            let response: APIResponse = {
                data: res.response.data,
                rateLimitInterval: rateLimit(res.response.headers),
                error: res.response.data.message
            }
            throw response
        }
    }

    static post = async (url: string, headers: any, body: any) => {
        if (this.isCustomerTokenAboutToExpire()) {
            console.log('Customer token is about to expire. Fetching new token.')
            await this.fetchCustomerTokenAsync()
        }
        if (this.isRCTokenAboutToExpire()) {
            console.log('RC token is about to expire. Fetching new token.')
            await this.refreshRCRokenAsync()
        }

        try {
            const res = await axios({
                method: "POST",
                url: url,
                headers: headers,
                data: body
            })
            const response: APIResponse = {
                data: res.data,
                rateLimitInterval: rateLimit(res.headers)
            }
            return response
        } catch (res: any) {
            let response: APIResponse = {
                data: res.response.data,
                rateLimitInterval: rateLimit(res.response.headers),
                error: res.response.data.message
            }
            throw response
        }
    }

    static patch = async (url: string, headers: any, body: any) => {
        if (this.isCustomerTokenAboutToExpire()) {
            console.log('Customer token is about to expire. Fetching new token.')
            await this.fetchCustomerTokenAsync()
        }
        if (this.isRCTokenAboutToExpire()) {
            console.log('RC token is about to expire. Fetching new token.')
            await this.refreshRCRokenAsync()
        }

        try {
            const res = await axios({
                method: "PATCH",
                url: url,
                headers: headers,
                data: body
            })
            const response: APIResponse = {
                data: res.data,
                rateLimitInterval: rateLimit(res.headers)
            }
            return response
        } catch (res: any) {
            let response: APIResponse = {
                data: res.response.data,
                rateLimitInterval: rateLimit(res.response.headers),
                error: res.response.data.message
            }
            throw response
        }
    }

    static put = async (url: string, headers: any, body: any) => {
        if (this.isCustomerTokenAboutToExpire()) {
            console.log('Customer token is about to expire. Fetching new token.')
            await this.fetchCustomerTokenAsync()
        }
        if (this.isRCTokenAboutToExpire()) {
            console.log('RC token is about to expire. Fetching new token.')
            await this.refreshRCRokenAsync()
        }

        try {
            const res = await axios({
                method: "PUT",
                url: url,
                headers: headers,
                data: body
            })
            const response: APIResponse = {
                data: res.data,
                rateLimitInterval: rateLimit(res.headers)
            }
            return response
        } catch (res: any) {
            console.log('RestCentral PUT error')
            let response: APIResponse = {
                data: res.response.data,
                rateLimitInterval: rateLimit(res.response.headers),
                error: res.response.data.message
            }
            throw response
        }
    }

    static delete = async (url: string, headers: any) => {
        if (this.isCustomerTokenAboutToExpire()) {
            console.log('Customer token is about to expire. Fetching new token.')
            await this.fetchCustomerTokenAsync()
        }
        if (this.isRCTokenAboutToExpire()) {
            console.log('RC token is about to expire. Fetching new token.')
            await this.refreshRCRokenAsync()
        }

        try {
            const res = await axios({
                method: "DELETE",
                url: url,
                headers: headers,
            })
            const response: APIResponse = {
                data: res.data,
                rateLimitInterval: rateLimit(res.headers)
            }
            return response
        } catch (res: any) {
            let response: APIResponse = {
                data: res.response.data,
                rateLimitInterval: rateLimit(res.response.headers),
                error: res.response.data.message
            }
            throw response
        }
    }

    static refreshRCRokenAsync = async () => {
        console.log('Refreshing RC token')
        const refreshToken = localStorage.getItem('rc_refresh_token')
        if (!refreshToken) return

        try {
            const res = await axios({
                method: "GET",
                url: `/refresh?refresh_token=${refreshToken}`,
            })
            console.log('Successfully refreshed token')
            console.log(res)
            let date = new Date()
            date.setTime(date.getTime() + 1 * 60 * 60 * 1000)
            localStorage.setItem('rc_token_expiry', date.getTime().toString())
            localStorage.setItem('rc_access_token', res.data.access_token)
            localStorage.setItem('rc_refresh_token', res.data.refresh_token)
        } catch (res: any) {
            console.log('Failed to refresh token')
        }
    }

    static refreshSegregatedTokenAsync = async () => {
        console.log('Refreshing segragated custom token token')
        const refreshToken = localStorage.getItem('cs_refresh_token')
        if (!refreshToken) return

        try {
            const res = await axios({
                method: "GET",
                url: `/refresh?refresh_token=${refreshToken}`,
            })
            console.log('Successfully refreshed token')
            console.log(res)
            let date = new Date()
            date.setTime(date.getTime() + 1 * 60 * 60 * 1000)
            localStorage.setItem('cs_token_expiry', date.getTime().toString())
            localStorage.setItem('cs_access_token', res.data.access_token)
            localStorage.setItem('cs_refresh_token', res.data.refresh_token)
        } catch (res: any) {
            console.log('Failed to refresh token')
        }
    }

    static fetchCustomerTokenAsync = async () => {
        const uid = localStorage.getItem('target_uid')
        const rc_access_token = localStorage.getItem('rc_access_token')

        if (!uid || !rc_access_token) return

        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            access_token: rc_access_token
        }

        const secret = 'secret'
        const data = {
            sub: uid,
            kid: 'extensionActivator'
        }
        const token = sign(data, secret)

        try {
            const res = await axios({
                method: "POST",
                url: `https://auth.ps.ringcentral.com/jwks?token=${token}`,
                data: {'accountId': uid.trim(), 'appName': 'extensionActivator'},
                headers: headers
            })
            let date = new Date()
            date.setTime(date.getTime() + 1 * 60 * 60 * 1000)
            localStorage.setItem('cs_token_expiry', date.getTime().toString())
            localStorage.setItem('cs_access_token', res.data.access_token)
            console.log('Successfully refreshed customer token')
        } catch (err) {
            console.log(err)
        }
    }

    static isCustomerTokenAboutToExpire = () => {
        const token = localStorage.getItem('cs_access_token')
        const tokenExpiration = localStorage.getItem('cs_token_expiry')
        if (!token || !tokenExpiration) return true

        let expirationTime = new Date(parseInt(tokenExpiration))
        let currentTime = new Date()
        let timeToExpire = expirationTime.getTime() - currentTime.getTime()
        if (timeToExpire <= this.TOKEN_REFRESH_THRESHOLD) return true
    }

    static isRCTokenAboutToExpire = () => {
        const token = localStorage.getItem('rc_access_token')
        const tokenExpiration = localStorage.getItem('rc_token_expiry')
        if (!token || !tokenExpiration) return true

        let expirationTime = new Date(parseInt(tokenExpiration))
        let currentTime = new Date()
        let timeToExpire = expirationTime.getTime() - currentTime.getTime()
        if (timeToExpire <= this.TOKEN_REFRESH_THRESHOLD) return true
    }
}

export interface APIResponse {
    data: any
    error?: string
    rateLimitInterval: number
}
