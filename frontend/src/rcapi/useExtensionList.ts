import { access } from "fs"
import { useEffect, useState } from "react";
import RCExtension from "../models/RCExtension"
const axios = require('axios').default;

const useExtensionList = () => {
    let extensionsList: RCExtension[] = []
    let [isExtensionListPending, setisExtensionListPending] = useState(true)
    let error = ""
    const extensionsURL = 'https://platform.devtest.ringcentral.com/restapi/v1.0/account/~/extension'
    const accessToken = localStorage.getItem('rc_access_token')

    useEffect(() => {
        axios
        .get(extensionsURL, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        })
        .then((res: any) => {
            console.log('RC API response')
            console.log(res)
            setisExtensionListPending(false)
        })
    }, [])

    return {extensionsList, isExtensionListPending, error}
}

export default useExtensionList