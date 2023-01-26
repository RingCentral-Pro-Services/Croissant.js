import { useEffect, useState } from "react"
import { IntercomStatus, IntercomUser } from "../../../../models/IntercomStatus"
import { Message } from "../../../../models/Message"
import RCExtension from "../../../../models/RCExtension"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"

const useIntercom = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [shouldChangeIntercom, setShouldChangeIntercom] = useState(false)
    const [shouldChangePermissions, setShouldChangePermissions] = useState(false)
    const [intercomData, setIntercomData] = useState<IntercomStatus[]>([])

    const [extensions, setExtensions] =  useState<RCExtension[]>([])

    const [auditData, setAuditData] = useState<IntercomStatus[]>([])
    const [completeAuditData, setCompleteAuditData] = useState<IntercomStatus[]>([])
    const [shouldAudit, setShouldAudit] = useState(false)
    const [shouldFetchUsers, setShouldFetchUsers] = useState(false)

    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [isIntercomPending, setIsIntercomPending] = useState(true)
    const [isAuditPending, setIsAuditPending] = useState(true)

    const [progressValue, setProgressValueInternal] = useState(0)

    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/intercom'
    const basePermissionsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/intercom/permissions'

    const changeIntercom = (intercomData: IntercomStatus[]) => {
        setIntercomData(intercomData)
        setShouldChangeIntercom(true)
        setCurrentExtensionIndex(0)
        setProgressValueInternal(0)
    }

    const auditIntercom = (extensions: RCExtension[]) => {
        setExtensions(extensions)
        setProgressValueInternal(0)
        setShouldAudit(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem("cs_access_token")
        if (!accessToken || !shouldChangeIntercom) {
            return
        }
        if (currentExtensionIndex >= intercomData.length) {
            setShouldChangeIntercom(false)
            setShouldChangePermissions(true)
            setCurrentExtensionIndex(0)
            return
        }

        setTimeout(async () => {
            const url = baseURL.replace('extensionId', intercomData[currentExtensionIndex].id)
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                console.log('Payload:')
                console.log(intercomData[currentExtensionIndex].payload())
                const response = await RestCentral.put(url, headers, intercomData[currentExtensionIndex].payload())
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
                console.log(`Failed to enable intercom for ${intercomData[currentExtensionIndex].extensionName} - Ext. ${intercomData[currentExtensionIndex].extensionNumber}`)
                postMessage(new Message(`Failed to enable intercom for extension ${intercomData[currentExtensionIndex].extensionName} - ${intercomData[currentExtensionIndex].extensionNumber}`, 'error'))
                console.log(e)
                next()
            }
        }, rateLimitInterval)
    }, [shouldChangeIntercom, currentExtensionIndex, rateLimitInterval])

    useEffect(() => {
        const accessToken = localStorage.getItem("cs_access_token")
        if (!accessToken || !shouldChangePermissions) {
            return
        }
        if (currentExtensionIndex >= intercomData.length) {
            setIsIntercomPending(false)
            setShouldChangePermissions(false)
            return
        }

        setTimeout(async () => {
            const url = basePermissionsURL.replace('extensionId', intercomData[currentExtensionIndex].id)
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                const payload = {
                    extensions: intercomData[currentExtensionIndex].users
                }
                const response = await RestCentral.put(url, headers, payload)
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
                console.log(`Failed to adjust intercom permissions for ${intercomData[currentExtensionIndex].extensionName} - Ext. ${intercomData[currentExtensionIndex].extensionNumber}`)
                postMessage(new Message(`Failed to adjust intercom permissions for extension ${intercomData[currentExtensionIndex].extensionName} - ${intercomData[currentExtensionIndex].extensionNumber}`, 'error'))
                console.log(e)
                next()
            }
        }, rateLimitInterval)
    }, [shouldChangeIntercom, currentExtensionIndex, rateLimitInterval])

    useEffect(() => {
        const accessToken = localStorage.getItem("cs_access_token")
        if (!accessToken || !shouldAudit) {
            return
        }
        if (currentExtensionIndex >= extensions.length) {
            // setIsIntercomPending(false)
            setShouldAudit(false)
            setCurrentExtensionIndex(0)
            setShouldFetchUsers(true)
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
                    `${extensions[currentExtensionIndex].id}`,
                    extensions[currentExtensionIndex].name,
                    `${extensions[currentExtensionIndex].extensionNumber}`,
                    response.data.enabled ? 'Enabled' : 'Disabled',
                    response.data.enabled ? response.data.device.name : '',
                    ''
                )

                setAuditData(prev => [...prev, status])
                next()
            }
            catch (e: any) {
                console.log(`Failed to audit intercom for extension ${extensions[currentExtensionIndex].id}`)
                postMessage(new Message(`Failed to audit intercom for extension ${extensions[currentExtensionIndex].id}`, 'error'))
                console.log(e)
                next()
            }
        }, rateLimitInterval)
    }, [auditData, shouldAudit, currentExtensionIndex, rateLimitInterval, extensions])

    useEffect(() => {
        const accessToken = localStorage.getItem("cs_access_token")
        if (!accessToken || !shouldFetchUsers) {
            return
        }
        if (currentExtensionIndex >= auditData.length) {
            setIsAuditPending(false)
            setShouldFetchUsers(false)
            setProgressValueInternal(0)
            setProgressValue(0)
            return
        }

        setTimeout(async () => {
            const url = basePermissionsURL.replace('extensionId', `${auditData[currentExtensionIndex].id}`)
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

                const users = response.data.extensions as IntercomUser[]
                const data = auditData[currentExtensionIndex]
                data.users = users

                setCompleteAuditData(prev => [...prev, data])
                next()
            }
            catch (e: any) {
                console.log(`Failed to get intercom permissions for extension ${auditData[currentExtensionIndex].extensionName}`)
                postMessage(new Message(`Failed to audit intercom permissions for extension ${auditData[currentExtensionIndex].extensionName}`, 'error'))
                console.log(e)
                next()
            }
        }, rateLimitInterval)
    }, [auditData, shouldFetchUsers, currentExtensionIndex, rateLimitInterval, extensions])

    const next = () => {
        setProgressValueInternal(prev => prev + 1)
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setProgressValue(progressValue + 1)
    }

    return { auditIntercom, changeIntercom, auditData, isIntercomPending, isAuditPending, completeAuditData }
}

export default useIntercom