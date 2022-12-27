import { useEffect, useState } from "react"
import { IntercomStatus } from "../../../../models/IntercomStatus"
import { Message } from "../../../../models/Message"
import RCExtension from "../../../../models/RCExtension"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useIntercom = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [enablementMap, setEnablementMap] = useState<Map<string, string>>(new Map())
    const [shouldEnable, setShouldEnable] = useState(false)

    const [shouldDisable, setShouldDisable] = useState(false)
    const [extensions, setExtensions] =  useState<RCExtension[]>([])

    const [auditData, setAuditData] = useState<IntercomStatus[]>([])
    const [shouldAudit, setShouldAudit] = useState(false)

    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [isIntercomPending, setIsIntercomPending] = useState(true)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/intercom'

    const enableIntercom = (map: Map<string, string>) => {
        setEnablementMap(map)
        setShouldEnable(true)
    }

    const disableIntercom = (extensions: RCExtension[]) => {
        setExtensions(extensions)
        setShouldDisable(true)
    }

    const auditIntercom = (extensions: RCExtension[]) => {
        setExtensions(extensions)
        setShouldAudit(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem("cs_access_token")
        if (!accessToken || !shouldEnable) {
            return
        }
        if (currentExtensionIndex >= enablementMap.size) {
            setIsIntercomPending(false)
            return
        }

        setTimeout(async () => {
            const url = baseURL.replace('extensionId', `${Array.from(enablementMap.keys())[currentExtensionIndex]}`)
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
            const body = {
                enabled: true,
                device: {
                    id: Array.from(enablementMap.values())[currentExtensionIndex]
                }
            }

            try {
                const response = await RestCentral.put(url, headers, body)
                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message('Rate limit reached. Waiting 60 seconds before continuing...', 'info'), response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }
                next()
            }
            catch (e: any) {
                console.log(`Failed to enable intercom for extension ${Array.from(enablementMap.keys())[currentExtensionIndex]}`)
                postMessage(new Message(`Failed to enable intercom for extension ${Array.from(enablementMap.keys())[currentExtensionIndex]}`, 'error'))
                console.log(e)
            }
        }, rateLimitInterval)
    }, [enablementMap, shouldEnable, currentExtensionIndex, rateLimitInterval])

    useEffect(() => {
        const accessToken = localStorage.getItem("cs_access_token")
        if (!accessToken || !shouldDisable) {
            return
        }
        if (currentExtensionIndex >= extensions.length) {
            setIsIntercomPending(false)
            return
        }

        setTimeout(async () => {
            const url = baseURL.replace('extensionId', `${extensions[currentExtensionIndex].id}`)
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                const response = await RestCentral.put(url, headers, { enabled: false })
                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message('Rate limit reached. Waiting 60 seconds before continuing...', 'info'), response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }
                next()
            }
            catch (e: any) {
                console.log(`Failed to disable intercom for extension ${extensions[currentExtensionIndex].id}`)
                postMessage(new Message(`Failed to disable intercom for extension ${extensions[currentExtensionIndex].id}`, 'error'))
                console.log(e)
            }
        }, rateLimitInterval)
    }, [extensions, shouldDisable, currentExtensionIndex, rateLimitInterval])

    useEffect(() => {
        const accessToken = localStorage.getItem("cs_access_token")
        if (!accessToken || !shouldAudit) {
            return
        }
        if (currentExtensionIndex >= extensions.length) {
            setIsIntercomPending(false)
            setShouldAudit(false)
            return
        }

        setTimeout(async () => {
            const url = baseURL.replace('extensionId', `${extensions[currentExtensionIndex].id}`)
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                const response = await RestCentral.get(url, headers)
                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message('Rate limit reached. Waiting 60 seconds before continuing...', 'info'), response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }

                const status = new IntercomStatus (
                    extensions[currentExtensionIndex].name,
                    `${extensions[currentExtensionIndex].extensionNumber}`,
                    response.data.enabled ? 'Enabled' : 'Disabled',
                    response.data.enabled ? response.data.device.name : ''
                )

                setAuditData(prev => [...prev, status])
                next()
            }
            catch (e: any) {
                console.log(`Failed to audit intercom for extension ${extensions[currentExtensionIndex].id}`)
                postMessage(new Message(`Failed to audit intercom for extension ${extensions[currentExtensionIndex].id}`, 'error'))
                console.log(e)
            }
        }, rateLimitInterval)
    }, [auditData, shouldAudit, currentExtensionIndex, rateLimitInterval, extensions])

    const next = () => {
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setProgressValue(currentExtensionIndex + 1)
    }

    return { enableIntercom, disableIntercom, auditIntercom, auditData, isIntercomPending }
}

export default useIntercom