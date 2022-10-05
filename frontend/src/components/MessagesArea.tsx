import React from "react";
import { Message } from "../models/Message";
import { Alert } from '@mui/material'

const MessagesArea = (props: {messages: Message[]}) => {
    const {messages} = props

    return (
        <div className="messages-area">
            {messages.slice().reverse().map((message) => (
                <Alert className="healthy-margin-bottom" severity={message.type}>{message.body}</Alert>
            ))}
        </div>
    )
}

export default MessagesArea