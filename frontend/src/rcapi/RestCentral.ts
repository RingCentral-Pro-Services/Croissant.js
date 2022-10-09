import rateLimit from "../helpers/rateLimit";
const axios = require('axios').default;


export class RestCentral {

    static get = (url: string, headers: any) => {
        return new Promise<APIResponse>((resolve, reject) => {
            axios
            .get(url, {
                headers: headers
            })
            .then((res: any) => {
                const response: APIResponse = {
                    data: res.data,
                    rateLimitInterval: rateLimit(res.headers)
                }
                resolve(response)
            })
            .catch ((res: any) => { 
                let response: APIResponse = {
                    data: res.response.data,
                    rateLimitInterval: rateLimit(res.response.headers),
                    error: 'Drats. Something went wrong.'
                }
                reject(response)
            })
        })
    }

    static post = (url: string, headers: any, body: any) => {
        return new Promise<APIResponse>((resolve, reject) => {
            axios({
                method: "POST",
                url: url,
                headers: headers,
                data: body
            })
            .then((res: any) => {
                console.log(res)
                const response: APIResponse = {
                    data: res.data,
                    rateLimitInterval: rateLimit(res.headers)
                }
                resolve(response)
            })
            .catch((res: any) => {
                let response: APIResponse = {
                    data: res.response.data,
                    rateLimitInterval: rateLimit(res.response.headers),
                    error: 'Drats. Something went wrong.'
                }
                reject(response)
            })
        })
    }

    static put = (url: string, headers: any, body: any) => {
        return new Promise<APIResponse>((resolve, reject) => {
            axios({
                method: "PUT",
                url: url,
                headers: headers,
                data: body
            })
            .then((res: any) => {
                const response: APIResponse = {
                    data: res.data,
                    rateLimitInterval: rateLimit(res.headers)
                }
                resolve(response)
            })
            .catch((res: any) => {
                let response: APIResponse = {
                    data: res.response.data,
                    rateLimitInterval: rateLimit(res.response.headers),
                    error: 'Drats. Something went wrong.'
                }
                reject(response)
            })
        })
    }
}

export interface APIResponse {
    data: any
    error?: string
    rateLimitInterval: number
}
