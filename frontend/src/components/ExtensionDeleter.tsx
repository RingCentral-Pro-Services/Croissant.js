import React, {useEffect, useState} from "react"
import useLogin from "../hooks/useLogin"
import Header from "./Header"
import useGetAccessToken from "../rcapi/useGetAccessToken"
import UIDInputField from "./UIDInputField"
import useExtensionList from "../rcapi/useExtensionList"
import useMessageQueue from "../hooks/useMessageQueue"
import RCExtension from "../models/RCExtension"
import AdditiveFilter from "./AdditiveFilter"

const ExtensionDeleter = () => {
    useLogin()
    const [targetUID, setTargetUID] = useState('')
    const [sites, setSites] = useState<string[]>([])
    const [selectedSites, setSelectedSites] = useState<string[]>([])

    const {postMessage, messages} = useMessageQueue()
    const {fetchToken, hasCustomerToken} = useGetAccessToken()
    const {extensionsList, fetchExtensions, isExtensionListPending} = useExtensionList(postMessage)

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        fetchExtensions()
    }, [hasCustomerToken])

    useEffect(() => {
        if (isExtensionListPending) return

        const extractedSites = extensionsList.filter((extension) => {
            return extension.prettyType[extension.type] === 'Site'
        })

        let siteNames = extractedSites.map((site) => {
            return site.name
        })

        siteNames = ['Main Site', ...siteNames]

        setSites(siteNames)

        console.log(`Sites: ${siteNames.length}`)
        console.log(siteNames)
    }, [extensionsList, isExtensionListPending])

    useEffect(() => {
        console.log(selectedSites)
    }, [selectedSites])

    return (
        <>
            <Header title="Extension Deleter" body="Delete extensions in bulk"/>
            <div className="tool-card">
                <h2>Extension Deleter</h2>
                <UIDInputField disabled={hasCustomerToken} setTargetUID={setTargetUID}/>
                <AdditiveFilter options={sites} title='Sites' placeholder='Sites' setSelected={setSelectedSites} />
            </div>
        </>
    )
}

export default ExtensionDeleter