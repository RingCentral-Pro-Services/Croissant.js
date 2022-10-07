import { useState } from "react"
import { Message } from "../models/Message"

const usePostTimedMessage = () => {
    const [timedMessages, setTimedMessages] = useState<Message[]>([])

    const postTimedMessage = (message: Message, duration: number) => {
        const messageID = Math.random()
        message.id = messageID
        setTimedMessages(prev => [...prev, message])

        setTimeout(() => {
            let newMessages = timedMessages.filter((currentMessage) => {
                return currentMessage.id !== messageID
            })
            setTimedMessages(newMessages)
        }, duration)
    }

    return {timedMessages, postTimedMessage}
}

export default usePostTimedMessage