import { Extension } from "../../../../models/Extension"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { ExtensionPresence, PresenceData, PresenceLineData } from "../models/ExtensionPresence"

const useAuditPresence = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, callback: (data: ExtensionPresence) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/presence/line'
    const baseSettingsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/presence'
    const basePermissionsURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/presence/permission'
    const baseWaitingPeriod = 250

    const auditPresence = async (extension: Extension, extensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const presenceData = new ExtensionPresence({
            extensionNumber: extension.data.extensionNumber,
            extensionName: extension.data.name,
            site: extension.data.site?.name ?? '',
            isPresenceStatusVisible: false,
            isRingingOnMonitoredLines: false,
            isPickingUpMonitoredLinesOnHold: false,
            permittedUsers: [],
            lines: []
        })

        await fetchMonitoredLines(extension, presenceData, extensions, accessToken)
        await fetchPresenceSettings(extension, presenceData, accessToken)
        await fetchPermissions(extension, presenceData, extensions, accessToken)
        callback(presenceData)
    }

    const fetchMonitoredLines = async (extension: Extension, presenceData: ExtensionPresence, extensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseURL.replace('extensionId', `${extension.data.id}`)
            const response = await RestCentral.get(url, headers)

            const records = response.data.records
            const lineData: PresenceLineData[] = []

            for (const record of records) {
                const line = record.id
                const extensionNumber = record.extension.extensionNumber
                const extensionName = extensions.find((extension) => extension.data.extensionNumber === extensionNumber)?.data.name ?? ''

                lineData.push({
                    line,
                    extensionNumber,
                    extensionName
                })
            }

            presenceData.data.lines = lineData

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get presence lines for ${extension.data.name}`)
            console.log(e)
            postMessage(new Message(`Failed to get presence lines for ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to get presence lines', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchPresenceSettings = async (extension: Extension, presenceData: ExtensionPresence, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = baseSettingsURL.replace('extensionId', `${extension.data.id}`)
            const response = await RestCentral.get(url, headers)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            presenceData.data.isPresenceStatusVisible = response.data.allowSeeMyPresence
            presenceData.data.isRingingOnMonitoredLines = response.data.ringOnMonitoredCall
            presenceData.data.isPickingUpMonitoredLinesOnHold = response.data.pickUpCallsOnHold
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get presence settings ${extension.data.name}`)
            console.log(e)

            postMessage(new Message(`Failed to get presence settings ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to get presense settings', ''], e.error ?? ''))
            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const fetchPermissions = async (extension: Extension, presenceData: ExtensionPresence, extensions: Extension[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const url = basePermissionsURL.replace('extensionId', `${extension.data.id}`)
            const response = await RestCentral.get(url, headers)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }

            const records = response.data.records
            const permittedUsers: string[] = []

            for (const record of records) {
                const extensionNumber = record.extensionNumber
                const extensionName = extensions.find((extension) => extension.data.extensionNumber === extensionNumber)?.data.name ?? ''
                permittedUsers.push(`${extensionName} Ext. ${extensionNumber}`)
            }

            presenceData.data.permittedUsers = permittedUsers
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get presence permissions ${extension.data.name}`)
            console.log(e)

            postMessage(new Message(`Failed to get presence permissions ${extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(extension.data.name, parseInt(extension.data.extensionNumber), ['Failed to get presense permissions', ''], e.error ?? ''))
            
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {auditPresence}
}

export default useAuditPresence