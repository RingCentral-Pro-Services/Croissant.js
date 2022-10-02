import {useState} from "react"
import { Message } from "../models/Message"

const useMessageQueue = () => {
    let [messages, setMessages] = useState<Message[]>([])
    
    const postMessage = (message: Message) => {
        setMessages(prev => [...prev, message])
    }

    return {messages, postMessage}
}

export default useMessageQueue