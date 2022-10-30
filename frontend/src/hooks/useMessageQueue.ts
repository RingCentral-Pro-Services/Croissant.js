import {useState} from "react"
import { Message } from "../models/Message"
import { SyncError } from "../models/SyncError"

const useMessageQueue = () => {
    let [messages, setMessages] = useState<Message[]>([])
    let [errors, setErrors] = useState<SyncError[]>([])
    
    const postMessage = (message: Message) => {
        setMessages(prev => [...prev, message])
    }

    const postError = (error: SyncError) => {
        setErrors(prev => [...prev, error])
    }

    return {messages, errors, postMessage, postError}
}

export default useMessageQueue