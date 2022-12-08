import { useEffect, useState } from "react";
import { AccountUID } from "../models/AccountUID";
import useGetCompanyName from "./useGetCompanyName";

const sign = require('jwt-encode');
const axios = require('axios').default;

const useGetAccessToken = () => {
    const [hasCustomerToken, setHasToken] = useState(false)
    const [accountID, setAccountID] = useState('')
    const {companyName, isCompanyNamePending, getCompanyName, reset} = useGetCompanyName()

    const fetchToken = (uid: string) => {
        let rc_access_token = localStorage.getItem('rc_access_token')
        if (!rc_access_token) return

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

        axios({
            method: "POST",
            url: `https://auth.ps.ringcentral.com/jwks?token=${token}`,
            data: {'accountId': uid.trim(), 'appName': 'extensionActivator'},
            headers: headers
        })
        .then((res: any) => {
            let date = new Date()
            // date.setTime(date.getTime() + 1 * 60 * 60 * 1000)
            localStorage.setItem('cs_token_expiry', `${date.getTime()}`)
            localStorage.setItem('cs_access_token', res.data['access_token'])
            localStorage.setItem('cs_refresh_token', res.data['refresh_token'])
            setAccountID(uid)
            getCompanyName()
            // setHasToken(true)
        })
        .catch((res: any) => {
            console.log(res)
        })
    }

    useEffect(() => {
        if (isCompanyNamePending) return

        addAccountToLocalStorage()
        setHasToken(true)
        reset()
    }, [isCompanyNamePending])

    const addAccountToLocalStorage = () => {
        const accountData: AccountUID = {
            name: companyName,
            id: accountID
        }

        let accounts = localStorage.getItem('accounts')
        if (!accounts) {
            let accountList = [accountData]
            localStorage.setItem('accounts', JSON.stringify(accountList))
        }
        else {
            let accountList = JSON.parse(accounts) as AccountUID[]
            for (const account of accountList) {
                if (account.name === companyName) return
            }
            if (accountList.length < 5) {
                accountList.push(accountData)
            }
            else {
                accountList[4] = accountList[3]
                accountList[3] = accountList[2]
                accountList[2] = accountList[1]
                accountList[1] = accountList[0]
                accountList[0] = accountData
            }
            localStorage.setItem('accounts', JSON.stringify(accountList))
        }
    }

    return {fetchToken, hasCustomerToken, companyName}
}

export default useGetAccessToken