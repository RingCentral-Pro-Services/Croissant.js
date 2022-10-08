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

const NotificationAudit = () => {
    useLogin()
    let [targetUID, setTargetUID] = useState("")
    const {fetchToken, hasCustomerToken} = useGetAccessToken()
    let {messages, postMessage} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    let {notifications, fetchNotificationSettings, isNotificationListPending} = useFetchNotifications(postMessage)
    const [isPending, setIsPending] = useState(false)
    const {writeExcel} = useWriteExcelFile()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()

    const handleClick = () => {
        setIsPending(true)
        fetchExtensions()
    }

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (isExtensionListPending) return 
        console.log('useEffect')
        fetchNotificationSettings(extensionsList)
    }, [isExtensionListPending, extensionsList])

    useEffect(() => {
        if (isNotificationListPending) return
        if (!isPending) return

        let header = ['Mailbox ID', 'Name', 'Ext', 'Type', 'Email Addresses']
        writeExcel(header, notifications, 'notifications.xlsx')
        setIsPending(false)
    }, [isNotificationListPending, notifications, writeExcel, isPending])

    return (
        <>
            <Header title="Notification Audit" body="Generate a spreadsheet containing notification settings for all extensions"/>
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
                ></TextField>
                <Button disabled={!hasCustomerToken} variant="contained" onClick={handleClick}>Go</Button>
                {notifications.length > 0 ? <FeedbackArea tableHeader={['Mailbox ID', 'Name', 'Ext', 'Type', 'Email Addresses']} tableData={notifications} messages={messages} timedMessages={timedMessages} /> : <></>}
            </div>
        </>
    )
}

export default NotificationAudit