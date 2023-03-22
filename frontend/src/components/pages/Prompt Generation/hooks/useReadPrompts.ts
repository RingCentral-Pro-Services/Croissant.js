import { useState } from "react"
import { AmazonPollyPrompt } from '../models/AmazonPollyPrompt'

const useReadPrompts = () => {
    const [prompts, setPrompts] = useState<AmazonPollyPrompt[]>([])
    const [isPromptReadPending, setIsPromptReadPending] = useState(true)

    const convert = (data: any) => {
        const promptList: AmazonPollyPrompt[] = []

        for (const prompt of data) {
            promptList.push(new AmazonPollyPrompt(prompt['Prompt Name'], prompt['Prompt Text']))
        }

        setPrompts(promptList)
        setIsPromptReadPending(false)
    }

    return {convert, prompts, isPromptReadPending}
}

export default useReadPrompts