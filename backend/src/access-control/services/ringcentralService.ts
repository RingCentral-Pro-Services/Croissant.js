import { User } from '../../auth/interfaces/User'

const axios = require('axios').default;

export const getUserDataByEmail = async (token: string, email: string) => {
    try {
        const res = await axios({
            url: `https://platform.ringcentral.com/restapi/v1.0/account/~/extension?email=${email}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        const records = res.data.records
        if (!records || records.length === 0) {
            return undefined
        }

        const firstMatchingUser = records.find((user: User) => user.contact?.email === email)

        return firstMatchingUser as User
    }
    catch (e) {
        console.log('Failed to fetch user data')
        console.log(e)
    }
}