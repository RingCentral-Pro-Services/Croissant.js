import React, {useState, useEffect} from "react"
import useLogin from "../hooks/useLogin"
import useGetAccessToken from "../rcapi/useGetAccessToken"
import useMessageQueue from "../hooks/useMessageQueue"
import useExtensionList from "../rcapi/useExtensionList"
import { Message } from "../models/Message"
import useFetchCallQueueMembers from "../rcapi/useFetchCallQueueMembers"
import useWriteExcelFile from "../hooks/useWriteExcelFile"
import CreateCallQueues from "./CreateCallQueues"
import Header from "./Header"
import {TextField, Button, CircularProgress} from '@mui/material'
import useAnalytics from "../hooks/useAnalytics"
import UIDInputField from "./UIDInputField"

const CallQueues = () => {
    useLogin()
    const {fireEvent} = useAnalytics()
    let [targetUID, setTargetUID] = useState("")
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()
    let {messages, postMessage} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    let {callQueues, isQueueListPending, fetchQueueMembers} = useFetchCallQueueMembers()
    let {writeExcel} = useWriteExcelFile()
    const [isPending, setisPending] = useState(false)

    const handleClick = () => {
        setisPending(true)
        fetchExtensions()
    }

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (isExtensionListPending) return
        
        fetchQueueMembers(extensionsList)
        fireEvent('call-queue-audit')
    }, [extensionsList, isExtensionListPending])

    useEffect(() => {
        if (isQueueListPending) return

        const header = ['Queue Name', 'Extension', 'Site', 'Status', 'Members (Ext)']
        writeExcel(header, callQueues, 'queues.xlsx')
        setisPending(false)
    }, [isQueueListPending, callQueues])

    return (
        <>
        <Header title='Call Queues' body='Do some stuff with call queues' />
            <div className="tool-card">
                <h2>Export Call Queues</h2>
                <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} />
                <Button className='healthy-margin-right' disabled={!hasCustomerToken || isPending} variant="contained" onClick={handleClick}>Go</Button>
                {isPending ? <CircularProgress className="vertical-middle" /> : <></>}
            </div>
            <CreateCallQueues />
            {messages.map((message: Message) => (
                <div key={message.body}>
                    <p className={message.type}>{message.body}</p>
                </div>
            ))}
        </>
    )
}

export default CallQueues