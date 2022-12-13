import { useEffect, useState } from "react"
import { Message } from "../../../../models/Message"
import RCExtension from "../../../../models/RCExtension"
import { SimpleHandlingRule } from "../../../../models/SimpleHandlingRule"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useSimpleRuleList = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [adjustedExtensions, setAdjustedExtensions] = useState<RCExtension[]>([])
    const [extensions, setExtensions] = useState<RCExtension[]>([])
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [isRuleListPending, setIsRuleListPending] = useState(true)
    const [shouldFetch, setShouldFetch] = useState(false)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule'

    const fetchRules = (extensions: RCExtension[]) => {
        setExtensions(extensions)
        setShouldFetch(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken || !shouldFetch) return
        if (currentExtensionIndex >= extensions.length) {
            setShouldFetch(false)
            setIsRuleListPending(false)
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
                let url = baseURL.replace('extensionId', `${extensions[currentExtensionIndex].id}`)
                url += `?type=Custom&view=Simple&enabledOnly=false&perPage=1000`

                const response = await RestCentral.get(url, headers)
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message('Rate limit exceeded. Waiting 60 seconds before continuing...', 'info'), 60000)
                }
                else {
                    setRateLimitInterval(250)
                }

                const rules = response.data.records as SimpleHandlingRule[]
                let extension = extensions[currentExtensionIndex]
                extension.customRules = rules
                setAdjustedExtensions(prev => [...prev, extension])
                fetchNext()
            }
            catch (e: any) {
                console.log(`Failed to fetch rules for extension ${extensions[currentExtensionIndex].name}`)
                console.error(e)
                fetchNext()
            }
        }, rateLimitInterval)
    }, [shouldFetch, extensions, rateLimitInterval, currentExtensionIndex])

    const fetchNext = () => {
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setProgressValue(currentExtensionIndex + 1)
    }

    return {fetchRules, isRuleListPending, adjustedExtensions}

}

export default useSimpleRuleList