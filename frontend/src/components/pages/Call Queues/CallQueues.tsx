import React, {useState, useEffect} from "react"
import useLogin from "../../../hooks/useLogin"
import useGetAccessToken from "../../../rcapi/useGetAccessToken"
import useMessageQueue from "../../../hooks/useMessageQueue"
import useExtensionList from "../../../rcapi/useExtensionList"
import { Message } from "../../../models/Message"
import useFetchCallQueueMembers from "../../../rcapi/useFetchCallQueueMembers"
import useWriteExcelFile from "../../../hooks/useWriteExcelFile"
import CreateCallQueues from "./CreateCallQueues"
import Header from "../../shared/Header"
import {TextField, Button, CircularProgress} from '@mui/material'
import useAnalytics from "../../../hooks/useAnalytics"
import UIDInputField from "../../shared/UIDInputField"
import useGetCallQueueSettings from "../../../rcapi/useGetCallQueueSettings"
import usePostTimedMessage from "../../../hooks/usePostTimedMessage"
import MessagesArea from "../../shared/MessagesArea"

const CallQueues = () => {
    useLogin()
    const {fireEvent} = useAnalytics()
    let [targetUID, setTargetUID] = useState("")
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()
    let {messages, postMessage, postError} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    let {callQueues, isQueueListPending, fetchQueueMembers} = useFetchCallQueueMembers(setProgressValue, setMaxProgressValue, postTimedMessage)
    const {fetchCallQueueSettings, queues: adjsutedQueues, isCallQueueSettingsPending} = useGetCallQueueSettings(setProgressValue, postMessage, postTimedMessage, postError)
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

        fetchCallQueueSettings(callQueues, extensionsList)
    }, [isQueueListPending, callQueues])

    useEffect(() => {
        if (isCallQueueSettingsPending) return
        console.log('Queues')
        console.log(adjsutedQueues)
        const header = ['Queue Name', 'Extension', 'Site', 'Status', 'Members (Ext)', 'Greeting', 'Audio While Connecting', 'Hold Music', 'Voicemail', 'Interrupt Audio', 'Interrupt Prompt', 'Ring Type', 'Total Ring Time', 'User Ring Time' , 'Max Wait Time Action', 'No Answer Action', 'Wrap Up Time']
        writeExcel(header, adjsutedQueues, 'queues.xlsx')
        setisPending(false)
        setProgressValue(adjsutedQueues.length * 2)
    }, [isCallQueueSettingsPending])

    return (
        <>
        <Header title='Call Queues' body='Do some stuff with call queues' />
            <div className="tool-card">
                <h2>Export Call Queues</h2>
                <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} />
                <Button className='healthy-margin-right' disabled={!hasCustomerToken || isPending} variant="contained" onClick={handleClick}>Go</Button>
                {isPending ? <progress className='healthy-margin-top' value={progressValue} max={maxProgressValue} /> : <></>}
                {timedMessages.length > 0 ? <MessagesArea messages={timedMessages} /> : <></>}
            </div>
            <CreateCallQueues />
        </>
    )
}

export default CallQueues