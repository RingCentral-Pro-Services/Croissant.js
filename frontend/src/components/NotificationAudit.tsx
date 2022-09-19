import React, {useState, useEffect} from "react"
import useLogin from "../hooks/useLogin"
import { Message, MessageType } from "../models/Message"
import useExtensionList from "../rcapi/useExtensionList"
import useGetAccessToken from "../rcapi/useGetAccessToken"
import useMessageQueue from "../hooks/useMessageQueue"
import useFetchNotifications from "../rcapi/useFetchNotifications"
import csvify from "../helpers/csvify"
const FileSaver = require('file-saver');

const NotificationAudit = () => {
    useLogin()
    let [targetUID, setTargetUID] = useState("~")
    const {fetchToken} = useGetAccessToken()
    let {messages, postMessage} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    let {notifications, fetchNotificationSettings, isNotificationListPending} = useFetchNotifications(postMessage)

    const handleClick = () => {
        fetchExtensions()
    }

    useEffect(() => {
        localStorage.setItem('target_uid', targetUID)
        fetchToken()
    },[targetUID, fetchToken])

    useEffect(() => {
        if (isExtensionListPending) return
        postMessage(new Message(`Read ${extensionsList.length} extensions`, MessageType.INFO))

        fetchNotificationSettings(extensionsList)
    }, [isExtensionListPending, extensionsList])

    useEffect(() => {
        if (isNotificationListPending) return
        
        let data = csvify(['Mailbox ID', 'Name', 'Ext', 'Type', 'Email Addresses'], notifications)
        const blob = new Blob([data])
        FileSaver.saveAs(blob, 'notifications.csv')
    }, [isNotificationListPending, notifications])

    return (
        <>
            <h2>Extension Notifications</h2>
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

export default NotificationAudit