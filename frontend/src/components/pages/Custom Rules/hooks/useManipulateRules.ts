import { useEffect, useState } from "react"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useManipulateRules = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [ruleIDs, setRuleIDs] = useState<string[]>([])
    const [action, setAction] = useState('')
    const [isRuleManipulationPending, setIsRuleManipulationPending] = useState(true)
    const [currentRuleIndex, setCurrentRuleIndex] = useState(0)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [shouldFetch, setShouldFetch] = useState(false)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/ruleId'

    const manipulateRules = (ruleIDs: string[], action: string) => {
        setRuleIDs(ruleIDs)
        setAction(action)
        setShouldFetch(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken || !shouldFetch) return
        if (currentRuleIndex >= ruleIDs.length) {
            setShouldFetch(false)
            setIsRuleManipulationPending(false)
            setProgressValue(Number.MAX_SAFE_INTEGER)
            return
        }

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
                const ruleData = ruleIDs[currentRuleIndex].split('|')
                const extensionID = ruleData[0]
                const ruleID = ruleData[1]
                const url = baseURL.replace('extensionId', extensionID).replace('ruleId', ruleID)

                if (action === 'enable') {
                    const response = await RestCentral.put(url, headers, { enabled: true })
                    console.log(response)

                    if (response.rateLimitInterval > 0) {
                        setRateLimitInterval(response.rateLimitInterval)
                        postTimedMessage(new Message('Rate limit exceeded. Waiting 60 seconds before continuing...', 'info'), 60000)
                    }
                    else {
                        setRateLimitInterval(250)
                    }
                    fetchNext()
                }
                else if (action === 'disable') {
                    const response = await RestCentral.put(url, headers, { enabled: false })
                    console.log(response)

                    if (response.rateLimitInterval > 0) {
                        setRateLimitInterval(response.rateLimitInterval)
                        postTimedMessage(new Message('Rate limit exceeded. Waiting 60 seconds before continuing...', 'info'), 60000)
                    }
                    else {
                        setRateLimitInterval(250)
                    }
                    fetchNext()
                }
                else if (action === 'delete') {
                    const response = await RestCentral.delete(url, headers)
                    console.log(response)

                    if (response.rateLimitInterval > 0) {
                        setRateLimitInterval(response.rateLimitInterval)
                        postTimedMessage(new Message('Rate limit exceeded. Waiting 60 seconds before continuing...', 'info'), 60000)
                    }
                    else {
                        setRateLimitInterval(250)
                    }
                    fetchNext()
                }
            }
            catch (e: any) {
                console.log(`Failed to ${action} rule ${ruleIDs[currentRuleIndex]}`)
                console.error(e)
                // fetchNext()
            }
        }, rateLimitInterval)
    }, [shouldFetch, currentRuleIndex, rateLimitInterval, ruleIDs, action])

    const fetchNext = () => {
        setCurrentRuleIndex(prev => prev + 1)
        setProgressValue(currentRuleIndex + 1)
    }

    return { manipulateRules, isRuleManipulationPending }
}

export default useManipulateRules