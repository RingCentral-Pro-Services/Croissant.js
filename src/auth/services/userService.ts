import { User } from "../interfaces/User";

const axios = require('axios').default;

export const getUserData = async (token: string) => {
    try {
        const res = await axios({
            url: 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/~',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        return res.data as User
    }
    catch (e) {
        console.log('Failed to fetch user data')
        console.log(e)
    }
}