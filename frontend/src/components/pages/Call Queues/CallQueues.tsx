import React, {useState, useEffect} from "react"
import useLogin from "../../../hooks/useLogin"
import useGetAccessToken from "../../../rcapi/useGetAccessToken"
import useMessageQueue from "../../../hooks/useMessageQueue"
import useExtensionList from "../../../rcapi/useExtensionList"
import useFetchCallQueueMembers from "../../../rcapi/useFetchCallQueueMembers"
import useWriteExcelFile from "../../../hooks/useWriteExcelFile"
import Header from "../../shared/Header"
import {Button} from '@mui/material'
import useAnalytics from "../../../hooks/useAnalytics"
import UIDInputField from "../../shared/UIDInputField"
import useGetCallQueueSettings from "../../../rcapi/useGetCallQueueSettings"
import usePostTimedMessage from "../../../hooks/usePostTimedMessage"
import MessagesArea from "../../shared/MessagesArea"
import useWritePrettyExcel from "../../../hooks/useWritePrettyExcel"
import FeedbackArea from "../../shared/FeedbackArea"

const CallQueues = () => {
    useLogin('auditcallqueues')
    const {fireEvent} = useAnalytics()
    let [targetUID, setTargetUID] = useState("")
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()
    let {messages, errors, postMessage, postError} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    let {callQueues, isQueueListPending, fetchQueueMembers} = useFetchCallQueueMembers(setProgressValue, setMaxProgressValue, postTimedMessage)
    const {fetchCallQueueSettings, queues: adjsutedQueues, isCallQueueSettingsPending} = useGetCallQueueSettings(setProgressValue, postMessage, postTimedMessage, postError)
    let {writeExcel} = useWriteExcelFile()
    const [isPending, setisPending] = useState(false)
    const {writePrettyExcel} = useWritePrettyExcel()

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
        const header = ['Queue Name', 'Extension', 'Site', 'Status', 'Members (Ext)', 'Greeting', 'Audio While Connecting', 'Hold Music', 'Voicemail', 'Interrupt Audio', 'Interrupt Prompt', 'Ring Type', 'Total Ring Time', 'User Ring Time' , 'Max Wait Time Action', 'Max Wait Time Destination', 'Max Callers Action', 'Max Callers Destination', 'No Answer Action', 'Wrap Up Time']
        writePrettyExcel(header, adjsutedQueues, 'Call Queues', 'queues.xlsx', '/call-queue-template.xlsx')
        setisPending(false)
        setProgressValue(adjsutedQueues.length * 2)
    }, [isCallQueueSettingsPending])

    return (
        <>
            <Header title='Audit Call Queues' body='Export a spreadsheet of all queues in an account' />
            <div className="tool-card">
                <h2>Export Call Queues</h2>
                <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} />
                <Button className='healthy-margin-right' disabled={!hasCustomerToken || isPending} variant="contained" onClick={handleClick}>Go</Button>
                {isPending ? <progress className='healthy-margin-top' value={progressValue} max={maxProgressValue} /> : <></>}
                {timedMessages.length > 0 ? <MessagesArea messages={timedMessages} /> : <></>}
                {!isCallQueueSettingsPending ? <FeedbackArea tableHeader={['Queue Name', 'Extension', 'Site', 'Status', 'Members (Ext)', 'Wait time', 'Wrap-up time']} tableData={callQueues} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
            </div>
        </>
    )
}

export default CallQueues