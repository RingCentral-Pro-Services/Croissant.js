import { useEffect, useState } from "react";
import { RestCentral } from "./RestCentral";
import RCExtension from "../models/RCExtension"
import { Message } from "../models/Message";

const useExtensionList = (postMessage: (message: Message) => void) => {
    let [isExtensionListPending, setisExtensionListPending] = useState(true)
    let error = ""
    const baseExtensionsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const accessToken = localStorage.getItem('cs_access_token')
    let [extensionsList, setExtensionsList] = useState<RCExtension[]>([])
    let [page, setPage] = useState(1)
    let [shouldFetch, setShouldFetch] = useState(false)
    let [rateLimitInterval, setRateLimitInterval] = useState(0)

    const fetchExtensions = () => {
        setExtensionsList([])
        setShouldFetch(true)
        setisExtensionListPending(true)
        setPage(1)
    }

    useEffect(() => {
        if (!shouldFetch) return

        let targetUID = localStorage.getItem('target_uid')
        if (!targetUID) return
        let extensionsURL = `${baseExtensionsURL}?page=${page}&perPage=1000`;

            setTimeout(async () => {
                try {
                    const headers = {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                    let response = await RestCentral.get(extensionsURL, headers)
                    console.log(response)

                    let resRecords = response.data.records
                    let newRecords = [...extensionsList]
                    for (let index = 0; index < resRecords.length; index++) {
                        let resRecord = resRecords[index]
                        let site = resRecord.site ? resRecord.site.name : null
                        let name = resRecord.name ?? "N/A"
                        let extension = new RCExtension(resRecord.id,resRecord.extensionNumber, name, resRecord.contact, site, resRecord.type, resRecord.status, resRecord.hidden, resRecord.uri )
                        newRecords.push(extension)
                    }
                    setExtensionsList(newRecords)
                    setRateLimitInterval(0)

                    if (response.data.navigation.nextPage) {
                        setRateLimitInterval(response.rateLimitInterval)
                        setPage(page + 1)
                    }
                    else {
                        setisExtensionListPending(false)
                        setShouldFetch(false)
                        setRateLimitInterval(0)
                        setPage(1)
                    }
                }
                catch (e) {
                    console.log('Something bad happened')
                    console.log(e)
                    postMessage(new Message('Failed to fetch extensions', 'error'))
                }
            }, rateLimitInterval)
    }, [page, shouldFetch, accessToken, extensionsList, rateLimitInterval, postMessage])
    
    return {extensionsList, isExtensionListPending, error, fetchExtensions}
}

export default useExtensionList