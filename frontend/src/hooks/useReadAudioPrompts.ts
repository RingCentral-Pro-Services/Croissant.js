import { useEffect, useState } from "react"
import { promptSchema } from "../helpers/schemas"
import AmazonPollyPrompt from "../models/AmazonPollyPrompt"
import { Message } from "../models/Message"
import { SyncError } from "../models/SyncError"
import useValidateExcelData from "./useValidateExcelData"

const useReadAudioPrompts = (excelData: any[], isExcelDataPending: boolean, postMessage: (message: Message) => void, postError: (error: SyncError) => void) => {
    const [rawPrompts, setPrompts] = useState<AmazonPollyPrompt[]>([])
    const [isAudioPromptReadPending, setIsPending] = useState(true)
    const {validatedData, isDataValidationPending, validate} = useValidateExcelData(promptSchema, postMessage, postError)

    useEffect(() => {
        if (isExcelDataPending) return

        validate(excelData)
    }, [isExcelDataPending, excelData])

    useEffect(() => {
        if (isDataValidationPending) return

        let promptList: AmazonPollyPrompt[] = []
        for (let index = 0; index < validatedData.length; index++) {
            const prompt = new AmazonPollyPrompt(validatedData[index]['Prompt Name'], excelData[index]['Prompt Text'])
            promptList.push(prompt)
        }
        setPrompts(promptList)
        setIsPending(false)
    }, [isDataValidationPending, validatedData])

    return {rawPrompts, isAudioPromptReadPending}
}

export default useReadAudioPrompts