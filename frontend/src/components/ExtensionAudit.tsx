import React, { useEffect, useState } from 'react'
import csvify from '../helpers/csvify'
import RCExtension from '../models/RCExtension'
import useExtensionList from '../rcapi/useExtensionList'
import useGetAccessToken from '../rcapi/useGetAccessToken'
const FileSaver = require('file-saver');

const ExtensionAudit = () => {
    let [targetUID, setTargetUID] = useState("~")
    const {fetchToken} = useGetAccessToken()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList()

    const handleClick = () => {
        fetchExtensions()
    }

    useEffect(() => {
        localStorage.setItem('target_uid', targetUID)
        fetchToken()
    },[targetUID])

    useEffect(() => {
        if (isExtensionListPending) return

        let data = csvify(['Name', 'Ext', 'Site', 'Type', 'Status', 'Hidden'], extensionsList)

        const blob = new Blob([data])
        FileSaver.saveAs(blob, 'audit.csv')
    }, [isExtensionListPending])

    return (
        <>
            <h2>Extension Audit</h2>
            <input type="text" className="input-field" value={targetUID} onChange={(e) => setTargetUID(e.target.value)}/>
            <button onClick={handleClick}>Go</button>
            <p>{isExtensionListPending ? "Fetching extensions": `${extensionsList.length} extensions fetched`}</p>
            {extensionsList.map((extension: RCExtension) => (
                <div key={extension.id}>
                    <p>{extension.toRow()}</p>
                </div>
            ))}
        </>
    )
}

export default ExtensionAudit