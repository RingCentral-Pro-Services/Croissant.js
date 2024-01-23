import { response } from "express";
import { useEffect, useState } from "react";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { PhoneNumberPayload } from "../models/PhoneNumberPayload";

const useAssignPhoneNumbers = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [payloads, setPayloads] = useState<PhoneNumberPayload[]>([])
    const [isAssignmentPending, setIsAssignmentPending] = useState(true)
    const [rateLimitIntervaal, setRateLimitInterval] = useState(250)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [shouldAssignNumbers, setShouldAssignNumbers] = useState(false)
    const baseURL = 'https://platform.ringcentral.com/restapi/v2/accounts/~/phone-numbers/phoneNumberId'

    const assignNumbers = (numbers: PhoneNumberPayload[]) => {
        setPayloads(numbers)
        setShouldAssignNumbers(true)
    }
 
    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldAssignNumbers || !accessToken) return
        if (currentExtensionIndex >= payloads.length) {
            setCurrentExtensionIndex(0)
            setShouldAssignNumbers(false)
            setIsAssignmentPending(false)
            return
        }

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }

                const url = baseURL.replace('phoneNumberId', payloads[currentExtensionIndex].phoneNumberID)
                const response = await RestCentral.patch(url, headers, payloads[currentExtensionIndex].payload())
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message('Rate limit reached. Waiting 60 seconds before continuing', 'info'), 60000)
                }
                else {
                    setRateLimitInterval(250)
                }
                next()
            }
            catch (e: any) {
                console.log('Something went wrong assigning numbers')
                console.log(e)
                postMessage(new Message(`Something went wrong assigning number ${payloads[currentExtensionIndex].phoneNumber}. ${e.error ?? ''}`, 'error'))
                postError(new SyncError(payloads[currentExtensionIndex].phoneNumber, 0, ['Fail to assign number', ''], e.error ?? ''))
                next()
            }
        }, rateLimitIntervaal)
    }, [payloads, rateLimitIntervaal, currentExtensionIndex, shouldAssignNumbers, baseURL])

    const next = () => {
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setProgressValue(currentExtensionIndex + 1)
    }

    return {assignNumbers, isAssignmentPending}
}

export default useAssignPhoneNumbers