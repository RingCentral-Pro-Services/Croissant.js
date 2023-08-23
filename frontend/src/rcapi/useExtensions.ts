import { useEffect, useState } from "react";
import { RestCentral } from "./RestCentral";
import { Message } from "../models/Message";
import { Extension } from "../models/Extension";
import { wait } from "../helpers/rcapi";
import { ExtensionData } from "../models/ExtensionData";


interface ExtensionResponse {
    extensions: Extension[]
    hasNextPage: boolean
}

/*
* This hook is meant to replace useExtensionList.ts
* It uses the new Extension class to store extension data
* Doing it this was will allow me to slowly migrate the rest of the app to use the new class
*/
const useExtensions = (postMessage: (message: Message) => void) => {
    let [isExtensionListPending, setisExtensionListPending] = useState(true)
    const [isMultiSiteEnabled, setIsMultiSiteEnabled] = useState(false)
    let error = ""
    let [extensionsList, setExtensionsList] = useState<Extension[]>([])
    const baseWaitingPeriod = 250
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension?page=PAGE&perPage=1000'

    const fetchExtensions = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const extensions: Extension[] = []
        let nextPage = true
        let page = 1
        while (nextPage) {
            const response = await getExtensions(page, accessToken)
            extensions.push(...response.extensions)
            if (response.hasNextPage) {
                nextPage = true
                page += 1
            }
            else {
                nextPage = false
            }
        }

        setExtensionsList(extensions)
        setisExtensionListPending(false)
        determineMode(extensions)
        return extensions
    }

    const getExtensions = async (page: number, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.get(baseURL.replace('PAGE', `${page}`), headers)
            const extensionData = response.data.records as ExtensionData[]
            const extensions = extensionData.map((data) => new Extension(data))
            let hasNextPage = false
            if (page < response.data.paging.totalPages) hasNextPage = true
            const deviceResponse: ExtensionResponse = {
                extensions: extensions,
                hasNextPage: hasNextPage
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return deviceResponse
        }
        catch (e: any) {
            console.log(`Failed to get company numbers`)
            console.log(e)
            postMessage(new Message(`Failed to get company numbers ${e.error ?? ''}`, 'error'))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return {
                extensions: [],
                hasNextPage: false
            }
        }
    }

    const determineMode = (extensions: Extension[]) => {
        const sites = extensions.filter((extension) => extension.prettyType() === 'Site')
        console.log('sites')
        console.log(sites)
        setIsMultiSiteEnabled(sites.length > 0)
    }
    
    return {extensionsList, isExtensionListPending, error, isMultiSiteEnabled, fetchExtensions}
}

export default useExtensions