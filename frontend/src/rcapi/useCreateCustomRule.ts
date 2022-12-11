import { useEffect, useState } from "react";
import { CustomRule } from "../models/CustomRule";
import { Message } from "../models/Message";
import RCExtension from "../models/RCExtension";
import { SyncError } from "../models/SyncError";
import { RestCentral } from "./RestCentral";

const useCreateCustomRule = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [extensions, setExtensions] = useState<RCExtension[]>([])
    const [customRule, setCustomRule] = useState<CustomRule>()
    const [maintainVoicemailDestination, setMaintainVoicemailDestination] = useState(false)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [isCustomRuleCreationPending, setIsCustomRuleCreationPending] = useState(true)
    const [shouldCreateCustomRule, setShouldCreateCustomRule] = useState(false)
    const baseURL = `https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule`

    const createCustomRule = (extensions: RCExtension[], customRule: CustomRule, maintainVoicemailDestination: boolean) => {
        setExtensions(extensions)
        setCustomRule(customRule)
        setMaintainVoicemailDestination(maintainVoicemailDestination)
        setShouldCreateCustomRule(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken || !shouldCreateCustomRule) return
        if (currentExtensionIndex >= extensions.length) {
            setIsCustomRuleCreationPending(false)
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
                const url = baseURL.replace('extensionId', `${extensions[currentExtensionIndex].id}`)
                const payload = customRule
                if (!maintainVoicemailDestination) payload!.voicemail!.recipient.id = extensions[currentExtensionIndex].id
                if (payload?.callHandlingAction !== 'TakeMessagesOnly') delete payload?.voicemail
                delete payload?.forwarding
                delete payload?.transfer?.uri
                delete payload?.id
                delete payload?.uri
                delete payload?.greetings
                delete payload?.queue
                const response = await RestCentral.post(url, headers, payload)
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message(`Rate limit reached. Pausing for ${response.rateLimitInterval / 1000} seconds...`, 'info'), response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }
                createNext()
            }
            catch (e: any) {
                postMessage(new Message(`Failed to create custom rule for extension ${extensions[currentExtensionIndex].name}. ${e.error}`, 'error'))
                postError(new SyncError(extensions[currentExtensionIndex].name, extensions[currentExtensionIndex].extensionNumber, ['Custom rule creation failed', ''], e.error ?? ''))
                console.log('Failed to create custom rule')
                console.error(e)
                createNext()
            }
        }, rateLimitInterval)
    }, [shouldCreateCustomRule, extensions, customRule, currentExtensionIndex])

    const createNext = () => {
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setProgressValue(currentExtensionIndex + 1)
    }

    return { createCustomRule, isCustomRuleCreationPending }
}

export default useCreateCustomRule;