import React, {useState, useEffect} from "react"
import { Message, MessageType } from "../models/Message"

const useMessageQueue = () => {
    let [messages, setMessages] = useState<Message[]>([])
    
    const postMessage = (message: Message) => {
        let newMessages = [...messages, message]
        console.log(`Messages: ${messages.length}`)
        setMessages(newMessages)
    }

    return {messages, postMessage}
}

export default useMessageQueue