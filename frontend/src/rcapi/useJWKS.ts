import axios from "axios"
import { type } from "os"

export type JWKSResponse =
    | {
        status: 'OK'
        tokenData: RCTokenData
    }
    | {
        status: 'Failure'
        reason: string
    }

export type RCTokenData = {
    accessToken: string
    refreshToken: string
    accessTokenExpiry: number
    refreshTokenExpiry: number
}

const useJWKS = () => {

    const fetchToken = async (uid: string) => {
        let rc_access_token = localStorage.getItem('rc_access_token')
        const jwksURL = process.env.REACT_APP_JWKS_URL
        const appName = process.env.REACT_APP_JWKS_APP_NAME
        if (!rc_access_token || !jwksURL || !appName) {
            const jwksRes: JWKSResponse = {
                status: 'Failure',
                reason: 'Bad configuration'
            }
            return jwksRes
        }

        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            access_token: rc_access_token
        }

        try {
            const res = await axios.post(jwksURL, {
                'accountId': uid.trim(),
                'appName': appName
            }, {headers: headers})
    
            if (res.status === 200) {
                const jwksRes: JWKSResponse = {
                    status: 'OK',
                    tokenData: {
                        accessToken: res.data.access_token,
                        refreshToken: res.data.refresh_token,
                        accessTokenExpiry: Date.now() + res.data.expires_in,
                        refreshTokenExpiry: Date.now() + res.data.refresh_token_expires_in
                    }
                }

                let date = new Date()
                date.setTime(date.getTime() + 1 * 60 * 60 * 1000)
                localStorage.setItem('cs_token_expiry', `${date.getTime()}`)
                localStorage.setItem('cs_access_token', res.data.access_token)
                localStorage.setItem('cs_refresh_token', res.data.refresh_token)

                return jwksRes
            }
        }
        catch (e: any) {
            const jwksRes: JWKSResponse = {
                status: 'Failure',
                reason: e.response.data.errors[0].error_description
            }
            return jwksRes
        }

        const jwksRes: JWKSResponse = {
            status: 'Failure',
            reason: 'Bruh'
        }
        return jwksRes
    }

    return {fetchToken}
}

export default useJWKS