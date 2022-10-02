import React, {useState, useEffect} from "react"
import useLogin from "../hooks/useLogin"
import { Message } from "../models/Message"
import useExtensionList from "../rcapi/useExtensionList"
import useGetAccessToken from "../rcapi/useGetAccessToken"
import useMessageQueue from "../hooks/useMessageQueue"
import useFetchNotifications from "../rcapi/useFetchNotifications"
import useWriteExcelFile from "../hooks/useWriteExcelFile"
import useReadExcel from "../hooks/useReadExcel"
import Header from "./Header"
import {TextField, Button} from '@mui/material'

const NotificationAudit = () => {
    useLogin()
    let [targetUID, setTargetUID] = useState("~")
    const {fetchToken} = useGetAccessToken()
    let {messages, postMessage} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    let {notifications, fetchNotificationSettings, isNotificationListPending} = useFetchNotifications(postMessage)
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isPending, setIsPending] = useState(false)
    const {writeExcel} = useWriteExcelFile()
    let {readFile, excelData, isExcelDataPending} = useReadExcel()

    const handleClick = () => {
        setIsPending(true)
        fetchExtensions()
    }

    const handleFileOpenClick = () => {
        document.getElementById('notifications-file-select')?.click()
    }

    const handleSubmit = () => {
        if (!selectedFile) return

        readFile(selectedFile, 'IVRs2')
    }

    useEffect(() => {
        if (isExcelDataPending) return

        console.log(excelData)
    }, [isExcelDataPending, excelData])

    useEffect(() => {
        localStorage.setItem('target_uid', targetUID)
        fetchToken()
    },[targetUID, fetchToken])

    useEffect(() => {
        if (isExtensionListPending) return 
        console.log('useEffect')
        fetchNotificationSettings(extensionsList)
    }, [isExtensionListPending, extensionsList])

    useEffect(() => {
        if (isNotificationListPending) return
        if (!isPending) return
        
        // let data = csvify(['Mailbox ID', 'Name', 'Ext', 'Type', 'Email Addresses'], notifications)
        // const blob = new Blob([data])
        // FileSaver.saveAs(blob, 'notifications.csv')
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
                    defaultValue="~"
                    size="small"
                    onChange={(e) => setTargetUID(e.target.value)}
                ></TextField>
                <Button variant="contained" onClick={handleClick}>Go</Button>
            <form>
                <button type='button' className="inline browse-button" onClick={handleFileOpenClick}>Browse...</button>
                <p className="inline healthy-margin-right">{selectedFile ? selectedFile.name : "No file selected"}</p>
                <button type='button' onClick={handleSubmit}>{isPending ? "Processing" : "Submit"}</button>
                <input id="notifications-file-select" type="file" onInput={(e) => setSelectedFile((e.target as HTMLInputElement).files![0])} accept=".xlsx" hidden/>
            </form>
            {messages.map((message: Message) => (
                <div key={message.body}>
                    <p className={message.type}>{message.body}</p>
                </div>
            ))}
            </div>
        </>
    )
}

export default NotificationAudit