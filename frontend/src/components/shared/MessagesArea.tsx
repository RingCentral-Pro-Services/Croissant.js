import React from "react";
import { Message } from "../../models/Message";
import { Alert } from '@mui/material'
import { Notification } from "@mantine/core";
import { NotificationItem } from "../../models/NotificationItem";

const LegacyMessagesArea = (props: {messages: Message[]}) => {
    const {messages} = props

    return (
        <>
            {messages.slice().reverse().map((message) => (
                    <Alert className="healthy-margin-bottom" severity={message.type}>{message.body}</Alert>
            ))}
        </>
    )
}

const NotificationsArea = (props: {notifications: NotificationItem[]}) => {
    const {notifications} = props

    const getColor = (notification: NotificationItem) => {
        switch(notification.type) {
            case 'error':
                return 'red'
            case 'info':
                return 'blue'
            case 'success':
                return 'green'
            case 'warning':
                return 'yellow'
            case 'failure':
                return 'red'
            default:
                return 'blue'
        }
    }

    return (
        <>
            {notifications.map((notification) => (
                <div style={{marginBottom: 10}}>
                    <Notification sx={{backgroundColor: 'ghostwhite'}} title={notification.title} color={getColor(notification)}>
                        {notification.body}
                    </Notification>
                </div>
            ))}
        </>
    )
}

const MessagesArea = (props: {messages?: Message[], notifications?: NotificationItem[]}) => {
    const {messages, notifications} = props

    return (
        <div className="messages-area">
            {messages && messages.length !== 0 ? <LegacyMessagesArea messages={messages} /> : <></>}
            {notifications && notifications.length !== 0 ? <NotificationsArea notifications={notifications} /> : <></>}
        </div>
    )
}

export default MessagesArea