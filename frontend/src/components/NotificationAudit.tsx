import React, {useState, useEffect} from "react"
import useLogin from "../hooks/useLogin"
import { Message } from "../models/Message"
import useExtensionList from "../rcapi/useExtensionList"
import useGetAccessToken from "../rcapi/useGetAccessToken"
import useMessageQueue from "../hooks/useMessageQueue"
import useFetchNotifications from "../rcapi/useFetchNotifications"
import csvify from "../helpers/csvify"
import useWriteExcelFile from "../hooks/useWriteExcelFile"
const FileSaver = require('file-saver');

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

    const handleClick = () => {
        fetchExtensions()
    }

    const handleFileOpenClick = () => {
        document.getElementById('notifications-file-select')?.click()
    }

    const handleSubmit = () => {
        if (!selectedFile) return
    }

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
        
        // let data = csvify(['Mailbox ID', 'Name', 'Ext', 'Type', 'Email Addresses'], notifications)
        // const blob = new Blob([data])
        // FileSaver.saveAs(blob, 'notifications.csv')
        let header = ['Mailbox ID', 'Name', 'Ext', 'Type', 'Email Addresses']
        writeExcel(header, notifications, 'notifications.xlsx')
    }, [isNotificationListPending, notifications])

    return (
        <>
            <h2>Extension Notifications</h2>
            <input type="text" className="input-field" value={targetUID} onChange={(e) => setTargetUID(e.target.value)}/>
            <button onClick={handleClick}>Go</button>
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
        </>
    )
}

export default NotificationAudit