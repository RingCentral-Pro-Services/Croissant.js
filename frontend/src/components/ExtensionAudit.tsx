import React, { useEffect, useState } from 'react'
import csvify from '../helpers/csvify'
import useLogin from '../hooks/useLogin'
import useMessageQueue from '../hooks/useMessageQueue'
import RCExtension from '../models/RCExtension'
import useExtensionList from '../rcapi/useExtensionList'
import useGetAccessToken from '../rcapi/useGetAccessToken'
import { Message, MessageType } from '../models/Message'
const FileSaver = require('file-saver');

const ExtensionAudit = () => {
    useLogin()
    let [targetUID, setTargetUID] = useState("~")
    const {fetchToken} = useGetAccessToken()
    let {messages, postMessage} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)

    const handleClick = () => {
        fetchExtensions()
    }

    useEffect(() => {
        localStorage.setItem('target_uid', targetUID)
        fetchToken()
    },[targetUID, fetchToken])

    useEffect(() => {
        if (isExtensionListPending) return

        let data = csvify(['Name', 'Ext', 'Site', 'Type', 'Status', 'Hidden'], extensionsList)
        postMessage(new Message(`Read ${extensionsList.length} extensions`, MessageType.INFO))

        const blob = new Blob([data])
        FileSaver.saveAs(blob, 'audit.csv')
    }, [isExtensionListPending, extensionsList])

    return (
        <>
            <h2>Account Dump</h2>
            <input type="text" className="input-field" value={targetUID} onChange={(e) => setTargetUID(e.target.value)}/>
            <button onClick={handleClick}>Go</button>
            <p>{isExtensionListPending ? "Fetching extensions": `${extensionsList.length} extensions fetched`}</p>
            {messages.map((message: Message) => (
                <div key={message.body}>
                    <p className={message.type}>{message.body}</p>
                </div>
            ))}
        </>
    )
}

export default ExtensionAudit