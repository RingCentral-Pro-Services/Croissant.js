import React, {useState, useEffect} from "react"
import useLogin from "../hooks/useLogin"
import useGetAccessToken from "../rcapi/useGetAccessToken"
import useMessageQueue from "../hooks/useMessageQueue"
import useExtensionList from "../rcapi/useExtensionList"
import { Message } from "../models/Message"
import useFetchCallQueueMembers from "../rcapi/useFetchCallQueueMembers"
import useWriteExcelFile from "../hooks/useWriteExcelFile"

const CallQueues = () => {
    useLogin()
    let [targetUID, setTargetUID] = useState("~")
    const {fetchToken} = useGetAccessToken()
    let {messages, postMessage} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    let {callQueues, isQueueListPending, fetchQueueMembers} = useFetchCallQueueMembers()
    let {writeExcel} = useWriteExcelFile()

    const handleClick = () => {
        fetchExtensions()
    }

    useEffect(() => {
        localStorage.setItem('target_uid', targetUID)
        fetchToken()
    },[targetUID, fetchToken])

    useEffect(() => {
        if (isExtensionListPending) return
        
        fetchQueueMembers(extensionsList)
    }, [extensionsList, isExtensionListPending])

    useEffect(() => {
        if (isQueueListPending) return

        const header = ['Name', 'Ext', 'Site', 'Status', 'Members']
        writeExcel(header, callQueues, 'queues.xlsx')
    }, [isQueueListPending, callQueues])

    return (
        <>
            <h2>Call Queues</h2>
            <input type="text" className="input-field" value={targetUID} onChange={(e) => setTargetUID(e.target.value)}/>
            <button onClick={handleClick}>Go</button>
            {messages.map((message: Message) => (
                <div key={message.body}>
                    <p className={message.type}>{message.body}</p>
                </div>
            ))}
        </>
    )
}

export default CallQueues