import { useState } from 'react'
import z from 'zod'
import { Message } from '../models/Message'
import { SyncError } from '../models/SyncError'

const useValidateExcelData = (scehema: z.Schema, postMessage: (message: Message) => void, postError: (error: SyncError) => void) => {
    const [isDataValidationPending, setIsPending] = useState(true)
    const [validatedData, setValidatedData] = useState<any[]>([])

    const validate = (excelData: any[]) => {
        console.log(excelData)
        setIsPending(true)
        let validItems: any[] = []

        for (let index = 0; index < excelData.length; index++) {
            try {
                scehema.parse(excelData[index])
                validItems.push(excelData[index])
            }
            catch(error: any) {
                for (let errorIndex = 0; errorIndex < error.issues.length; errorIndex++) {
                    postMessage(new Message(`Validation: Row ${excelData[index]['__rowNum__'] + 1} - ${error.issues[errorIndex].message}`, 'error'))
                    postError(new SyncError(`Excel Row ${excelData[index]['__rowNum__'] + 1}`, 0, ['Failed validation', error.issues[errorIndex].message]))
                }
            }
        }
        setValidatedData(validItems)
        setIsPending(false)
    }

    return {validatedData, isDataValidationPending, validate}
}

export default useValidateExcelData