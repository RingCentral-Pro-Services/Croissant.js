import { useEffect, useState } from "react"
import AmazonPollyPrompt from "../models/AmazonPollyPrompt"

const useReadAudioPrompts = (excelData: any[], isExcelDataPending: boolean) => {
    const [rawPrompts, setPrompts] = useState<AmazonPollyPrompt[]>([])
    const [isAudioPromptReadPending, setIsPending] = useState(true)

    useEffect(() => {
        if (isExcelDataPending) return

        let promptList: AmazonPollyPrompt[] = []
        for (let index = 0; index < excelData.length; index++) {
            const prompt = new AmazonPollyPrompt(excelData[index]['Prompt Name'], excelData[index]['Prompt Text'])
            promptList.push(prompt)
        }
        setPrompts(promptList)
        setIsPending(false)
    }, [isExcelDataPending, excelData])

    return {rawPrompts, isAudioPromptReadPending}
}

export default useReadAudioPrompts