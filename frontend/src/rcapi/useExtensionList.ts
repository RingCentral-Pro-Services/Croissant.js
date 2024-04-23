import { useEffect, useState } from "react";
import { RestCentral } from "./RestCentral";
import RCExtension from "../models/RCExtension"
import { Message } from "../models/Message";
import { wait } from "../helpers/rcapi";

interface ExtensionResponse {
    extensions: RCExtension[]
    hasNextPage: boolean
}

const useExtensionList = (postMessage: (message: Message) => void) => {
    let [isExtensionListPending, setisExtensionListPending] = useState(true)
    const [isMultiSiteEnabled, setIsMultiSiteEnabled] = useState(false)
    let error = ""
    let [extensionsList, setExtensionsList] = useState<RCExtension[]>([])
    const baseWaitingPeriod = 250
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension?page=PAGE&perPage=1000'

    const fetchExtensions = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const extensions: RCExtension[] = []
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
            const resRecords = response.data.records
            let newRecords: RCExtension[] = []
            for (let index = 0; index < resRecords.length; index++) {
                let resRecord = resRecords[index]
                let site = resRecord.site ? resRecord.site.name : null
                let name = resRecord.name ?? "N/A"

                if (['Main site', 'main site'].includes(site)) {
                    site = 'Main Site'
                }

                let extension = new RCExtension(resRecord.id,resRecord.extensionNumber, name, resRecord.contact, site, resRecord.type, resRecord.status, resRecord.hidden, resRecord.uri )
                newRecords.push(extension)
            }

            let hasNextPage = false
            if (page < response.data.paging.totalPages) hasNextPage = true
            const deviceResponse: ExtensionResponse = {
                extensions: newRecords,
                hasNextPage: hasNextPage
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return deviceResponse
        }
        catch (e: any) {
            console.log(`Failed to get extensions`)
            console.log(e)
            postMessage(new Message(`Failed to get extensions ${e.error ?? ''}`, 'error'))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return {
                extensions: [],
                hasNextPage: false
            }
        }
    }

    const determineMode = (extensions: RCExtension[]) => {
        const sites = extensions.filter((extension) => extension.prettyType[extension.type] === 'Site')
        console.log('sites')
        console.log(sites)
        setIsMultiSiteEnabled(sites.length > 0)
    }
    
    return {extensionsList, isExtensionListPending, error, isMultiSiteEnabled, fetchExtensions}
}

export default useExtensionList