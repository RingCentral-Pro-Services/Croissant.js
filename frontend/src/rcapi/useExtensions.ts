import { useEffect, useState } from "react";
import { RestCentral } from "./RestCentral";
import { Message } from "../models/Message";
import { Extension } from "../models/Extension";


/*
* This hook is meant to replace useExtensionList.ts
* It uses the new Extension class to store extension data
* Doing it this was will allow me to slowly migrate the rest of the app to use the new class
*/
const useExtensions = (postMessage: (message: Message) => void) => {
    let [isExtensionListPending, setisExtensionListPending] = useState(true)
    const [isMultiSiteEnabled, setIsMultiSiteEnabled] = useState(false)
    let error = ""
    const baseExtensionsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const accessToken = localStorage.getItem('cs_access_token')
    let [extensionsList, setExtensionsList] = useState<Extension[]>([])
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
        if (!accessToken || !shouldFetch) return
        
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
                        let extensionData = resRecords[index]
                        let extension = new Extension(extensionData)
                        newRecords.push(extension)
                    }
                    setExtensionsList(newRecords)
                    setRateLimitInterval(0)

                    if (response.data.navigation.nextPage) {
                        setRateLimitInterval(response.rateLimitInterval)
                        setPage(page + 1)
                    }
                    else {
                        determineMode(newRecords)
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

    const determineMode = (extensions: Extension[]) => {
        const sites = extensions.filter((extension) => extension.prettyType() === 'Site')
        console.log('sites')
        console.log(sites)
        setIsMultiSiteEnabled(sites.length > 0)
    }
    
    return {extensionsList, isExtensionListPending, error, isMultiSiteEnabled, fetchExtensions}
}

export default useExtensions