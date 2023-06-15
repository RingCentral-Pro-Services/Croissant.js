import {useState} from "react"
import { Message } from "../models/Message"
import { NotificationItem } from "../models/NotificationItem"
import { SyncError } from "../models/SyncError"

const useMessageQueue = () => {
    let [messages, setMessages] = useState<Message[]>([])
    let [errors, setErrors] = useState<SyncError[]>([])
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    
    const postMessage = (message: Message) => {
        setMessages(prev => [...prev, message])
    }

    const postError = (error: SyncError) => {
        setErrors(prev => [...prev, error])
    }

    const postNotification = (notification: NotificationItem) => {
        setNotifications((prev) => [...prev, notification])
    }

    return {messages, errors, notifications, postMessage, postError, postNotification}
}

export default useMessageQueue