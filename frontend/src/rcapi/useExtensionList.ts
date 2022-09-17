import e from "express";
import { access } from "fs"
import { useEffect, useState } from "react";
import RCExtension from "../models/RCExtension"
const axios = require('axios').default;

const useExtensionList = () => {
    let [isExtensionListPending, setisExtensionListPending] = useState(true)
    let error = ""
    const extensionsURL = 'https://platform.devtest.ringcentral.com/restapi/v1.0/account/~/extension'
    const accessToken = localStorage.getItem('rc_access_token')
    let [extensionsList, setExtensionsList] = useState<RCExtension[]>([])
    let [page, setPage] = useState(1)

    useEffect(() => {
        axios
        .get(`${extensionsURL}?page=${page}&perPage=1`, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        })
        .then((res: any) => {
            console.log('RC API response')
            console.log(res)
            let resRecords = res.data.records
            let newRecords = [...extensionsList]
            for (let index = 0; index < resRecords.length; index++) {
                let resRecord = resRecords[index]
                let extension: RCExtension = {
                    uri: resRecord.uri,
                    id: resRecord.id,
                    extensionNumber: resRecord.extensionNumber,
                    name: resRecord.name,
                    type: resRecord.type,
                    status: resRecord.status,
                    hidden: resRecord.hidden
                }
                newRecords.push(extension)
            }
            setExtensionsList(newRecords)

            if (res.data.navigation.nextPage) {
                setPage(page + 1)
            }
            else {
                setisExtensionListPending(false)
            }
        })
    }, [page])
    
    return {extensionsList, isExtensionListPending, error}
}

export default useExtensionList