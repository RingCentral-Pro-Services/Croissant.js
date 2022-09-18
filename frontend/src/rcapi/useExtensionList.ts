import { useEffect, useState } from "react";
import RCExtension from "../models/RCExtension"
import rateLimit from "../helpers/rateLimit";
const axios = require('axios').default;

const useExtensionList = () => {
    let [isExtensionListPending, setisExtensionListPending] = useState(true)
    let error = ""
    const baseExtensionsURL = 'https://platform.devtest.ringcentral.com/restapi/v1.0/account/~/extension'
    const accessToken = localStorage.getItem('cs_access_token')
    let [extensionsList, setExtensionsList] = useState<RCExtension[]>([])
    let [page, setPage] = useState(1)
    let [shouldFetch, setShouldFetch] = useState(false)
    let [rateLimitInterval, setRateLimitInterval] = useState(0)

    const fetchExtensions = () => {
        setExtensionsList([])
        setShouldFetch(true)
        setisExtensionListPending(true)
    }

    useEffect(() => {
        if (!shouldFetch) return

        let targetUID = localStorage.getItem('target_uid')
        if (!targetUID) return
        let extensionsURL = `${baseExtensionsURL.replace('~', targetUID)}?page=${page}&perPage=1`

        setTimeout(() => {
            axios
            .get(extensionsURL, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            })
            .then((res: any) => {
                console.log(res)
                let resRecords = res.data.records
                let newRecords = [...extensionsList]
                for (let index = 0; index < resRecords.length; index++) {
                    let resRecord = resRecords[index]
                    let site = resRecord.site ? resRecord.site.name : null
                    let name = resRecord.name ?? "N/A"
                    let extension = new RCExtension(resRecord.id,resRecord.extensionNumber, name, site, resRecord.type, resRecord.status, resRecord.hidden, resRecord.uri )
                    newRecords.push(extension)
                }
                setExtensionsList(newRecords)
                setRateLimitInterval(0)

                if (res.data.navigation.nextPage) {
                    setRateLimitInterval(rateLimit(res.headers))
                    setPage(page + 1)
                }
                else {
                    setisExtensionListPending(false)
                    setShouldFetch(false)
                    setRateLimitInterval(0)
                    setPage(1)
                }
            })
        }, rateLimitInterval)
    }, [page, shouldFetch, accessToken, extensionsList])
    
    return {extensionsList, isExtensionListPending, error, fetchExtensions}
}

export default useExtensionList