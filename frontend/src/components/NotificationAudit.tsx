import React, {useState, useEffect} from "react"
import useLogin from "../hooks/useLogin"
import { Message } from "../models/Message"
import useExtensionList from "../rcapi/useExtensionList"
import useGetAccessToken from "../rcapi/useGetAccessToken"
import useMessageQueue from "../hooks/useMessageQueue"
import useFetchNotifications from "../rcapi/useFetchNotifications"
import useWriteExcelFile from "../hooks/useWriteExcelFile"
import Header from "./Header"
import {TextField, Button} from '@mui/material'
import FeedbackArea from "./FeedbackArea"
import usePostTimedMessage from "../hooks/usePostTimedMessage"
import FileSelect from "./FileSelect"
import useReadExcel from "../hooks/useReadExcel"
import useSwapNotificationEmails from "../rcapi/useSwapNotificationEmails"
import useUpdateNotifications from "../rcapi/useUpdateNotifications"

const NotificationAudit = () => {
    useLogin()
    let [targetUID, setTargetUID] = useState("")
    const {fetchToken, hasCustomerToken} = useGetAccessToken()
    let {messages, postMessage} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const [isPending, setIsPending] = useState(false)
    const {writeExcel} = useWriteExcelFile()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const [selectedSheet, setSelectedSheet] = useState('')
    const {readFile, excelData, isExcelDataPending} = useReadExcel()

    // Progess bar
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    let {notifications, fetchNotificationSettings, isNotificationListPending} = useFetchNotifications(postMessage, setProgressValue, setMaxProgressValue)
    const {updateNotifications, isNotificationUpdatePending} = useUpdateNotifications(setProgressValue, postMessage, postTimedMessage)
    const {adjustedNotifications, isEmailSwapPending} = useSwapNotificationEmails(notifications, excelData, isExcelDataPending)

    const handleClick = () => {
        setIsPending(true)
        fetchExtensions()
    }

    const handleSyncButtonClick = () => {
        setMaxProgressValue(adjustedNotifications.length)
        setProgressValue(0)
        updateNotifications(adjustedNotifications)
    }

    const handleFileSubmit = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (isNotificationUpdatePending) return

        console.log('Done')
    }, [isNotificationUpdatePending])

    useEffect(() => {
        if (isExtensionListPending) return 
        fetchNotificationSettings(extensionsList)
    }, [isExtensionListPending, extensionsList])

    useEffect(() => {
        if (isNotificationListPending) return
        if (!isPending) return

        console.log(notifications)
        let header = ['Mailbox ID', 'Name', 'Ext', 'Type', 'Email Addresses']
        writeExcel(header, notifications, 'notifications.xlsx')
        setIsPending(false)
    }, [isNotificationListPending, notifications, writeExcel, isPending])

    return (
        <>
            <Header title="Notifications" body="Audit and update notification emails"/>
            <div className="tool-card">
            <h2>Extension Notifications</h2>
            <TextField 
                className="vertical-middle healthy-margin-right"
                required
                id="outline-required"
                label="Account UID"
                defaultValue=""
                size="small"
                onChange={(e) => setTargetUID(e.target.value)}
                disabled={hasCustomerToken}
            ></TextField>
            <Button disabled={!hasCustomerToken || isPending} variant="contained" onClick={handleClick}>Go</Button>
            {isNotificationListPending ? <></> : <FileSelect isPending={false} enabled={true} setSelectedFile={setSelectedFile} setSelectedSheet={setSelectedSheet} accept='.xlsx' defaultSheet='Notifications' handleSubmit={handleFileSubmit}/>}
            {isEmailSwapPending ? <></> : <Button variant='contained' onClick={handleSyncButtonClick} >Sync</Button>}
            {false ? <></> : <progress className='healthy-margin-top' id='sync_progress' value={progressValue} max={maxProgressValue} />}
            {isEmailSwapPending ? <></> : <FeedbackArea tableHeader={['Mailbox ID', 'Name', 'Ext', 'Type', 'Email Addresses']} tableData={notifications} messages={messages} timedMessages={timedMessages} />}
            </div>
        </>
    )
}

export default NotificationAudit