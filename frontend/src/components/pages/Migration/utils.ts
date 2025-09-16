import axios from "axios"

export async function isUsingNewCallHandling(accessToken: string) {
    try {
        await axios({
            method: 'GET',
            url: 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/~/answering-rule',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })

        return false
    }
    catch (e: any) {
        return true
    }
}