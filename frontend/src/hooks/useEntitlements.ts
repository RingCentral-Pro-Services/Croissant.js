import { useState } from "react"

interface Entitlement {
    entitled: boolean
    scopes: string[]
    expiry: number
}

const useEntitlements = () => {
    const baseURL = `${process.env.REACT_APP_ENTITLEMENT_PORTAL_URL}`
    const [entitlements, setEntitlements] = useState<Entitlement>({
        entitled: true,
        scopes: ['User'],
        expiry: 0
    })

    const fetchEntitlements = async (userId: string) => {
        const response = await fetch(`${baseURL}/api/entitlement/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'entitlement-id': process.env.REACT_APP_ENTITLEMENT_ID!
            }
        })
        const data = await response.json()
        setEntitlements(data)
        console.log(data)
        return data
    }

    const requestEntitlement = async (body: {name: string, external_id: string, email: string}) => {
        const response = await fetch(`${baseURL}/api/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'entitlement-id': process.env.REACT_APP_ENTITLEMENT_ID!
            },
            body: JSON.stringify(body)
        })
        console.log('Request Response')
        console.log(response)
    }

    return { fetchEntitlements, requestEntitlement, entitlements}
}

export default useEntitlements