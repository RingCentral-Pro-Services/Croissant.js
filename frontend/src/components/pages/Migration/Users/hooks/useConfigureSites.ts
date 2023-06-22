import { useState } from "react";
import { wait } from "../../../../../helpers/rcapi";
import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { CalledNumber, CallHandling, CustomRule } from "../../User Data Download/models/UserDataBundle";
import { SiteDataBundle } from "../models/SiteDataBundle";

const useConfigureSites = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const baseScheduleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/business-hours'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/ruleId'
    const baseCustomRuleURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule'
    const baseWaitingPeriod = 250
    
    const configureSites = async (bundles: SiteDataBundle[], originalExtensions: Extension[], targetExtensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setMaxProgress(bundles.length)
        for (const bundle of bundles) {
            await setSchedule(bundle, accessToken)
            await setBusinessHoursCallHandling(bundle, originalExtensions, targetExtensions, accessToken)
            await setAfterHoursCallHandling(bundle, originalExtensions, targetExtensions, accessToken)
            for (let customRule of bundle.extendedData!.customRules!) {
                let adjsutedRule = adjustCustomRule(bundle, customRule, originalExtensions, targetExtensions)
                console.log('Adjusted custom rule')
                console.log(adjsutedRule)
                await addCustomRule(bundle, customRule, accessToken)
            }
            setProgressValue((prev) => prev + 1)
        }
    }

    const setSchedule = async (bundle: SiteDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.put(baseScheduleURL.replace('extensionId', `${bundle.extension.id}`), headers, bundle.extendedData?.businessHours)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set schedule`)
            console.log(e)
            postMessage(new Message(`Failed to set schedule for ${bundle.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.name, parseInt(bundle.extension.extensionNumber), ['Failed to set schedule', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setBusinessHoursCallHandling = async (bundle: SiteDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        if (!bundle.extendedData?.businessHoursCallHandling) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            
            const transferID = getTransferExtension(bundle.extendedData!.businessHoursCallHandling, originalExtensions, targetExtensions)
            if (!transferID) {
                postMessage(new Message(`Business hours call handling could not be set for site ${bundle.extension.name}`, 'warning'))
                postError(new SyncError(bundle.extension.name, bundle.extension.extensionNumber, ['Could not set business hours call handling', '']))
                return
            }

            const body = {
                transfer: {
                    extension: {
                        id: transferID
                    }
                }
            }

            const response = await RestCentral.put(baseCallHandlingURL.replace('extensionId', `${bundle.extension.id}`).replace('ruleId', 'business-hours-rule'), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set call handling`)
            console.log(e)
            postMessage(new Message(`Failed to set business hours call handling for ${bundle.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.name, parseInt(bundle.extension.extensionNumber), ['Failed to set business call handling', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setAfterHoursCallHandling = async (bundle: SiteDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        if (!bundle.extendedData?.afterHoursCallHandling) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            
            const transferID = getTransferExtension(bundle.extendedData!.afterHoursCallHandling, originalExtensions, targetExtensions)
            if (!transferID) {
                postMessage(new Message(`After hours call handling could not be set for site ${bundle.extension.name}`, 'warning'))
                postError(new SyncError(bundle.extension.name, bundle.extension.extensionNumber, ['Could not set after hours call handling', '']))
                return
            }

            const body = {
                transfer: {
                    extension: {
                        id: transferID
                    }
                }
            }

            const response = await RestCentral.put(baseCallHandlingURL.replace('extensionId', `${bundle.extension.id}`).replace('ruleId', 'after-hours-rule'), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set call handling`)
            console.log(e)
            postMessage(new Message(`Failed to set after hours call handling for ${bundle.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.name, parseInt(bundle.extension.extensionNumber), ['Failed to set after hours call handling', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const getTransferExtension = (callHandling: CallHandling, originalExtensions: Extension[], targetExtensions: Extension[]) => {
        console.log('----- Transfer -----')
        console.log('Call handling')
        console.log(callHandling)
        console.log(`Original Extensions: ${originalExtensions.length}`)
        console.log(`Target Extensions: ${targetExtensions.length}`)
        if (!callHandling.transfer) return

        const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${callHandling.transfer.extension.id}`)
        if (!originalExtension) {
            console.log('Could not find original extension')
            return
        }

        const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
        if (!newExtension) {
            console.log('could not find target extension')
            return
        }

        return `${newExtension.data.id}`
    }

    const addCustomRule = async (bundle: SiteDataBundle, customRule: CustomRule, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const response = await RestCentral.post(baseCustomRuleURL.replace('extensionId', `${bundle.extension.id}`), headers, customRule)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to add custom rule`)
            console.log(e)
            postMessage(new Message(`Failed to add custom rule ${customRule.name} on ${bundle.extension.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.name, parseInt(bundle.extension.extensionNumber), ['Failed to add custom rule', customRule.name], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const adjustCustomRule = (bundle: SiteDataBundle, customRule: CustomRule, originalExtensions: Extension[], targetExtensions: Extension[]) => {
        try {
            delete customRule.id
            delete customRule.uri

            if (customRule.calledNumbers && customRule.calledNumbers.length !== 0) {
                const goodNumbers: CalledNumber[] = []
                for (const number of customRule.calledNumbers) {
                    const tempNumber = bundle.phoneNumberMap?.get(number.phoneNumber)
                    if (!tempNumber) {
                        postMessage(new Message(`Failed to find temp number for called number ${number.phoneNumber} on custom rule ${customRule.name} on site ${bundle.extension.name}`, 'warning'))
                        postError(new SyncError(bundle.extension.name, bundle.extension.extensionNumber, ['Failed to find temp number for custom rule', number.phoneNumber]))
                        continue
                    }

                    goodNumbers.push({phoneNumber: tempNumber.phoneNumber})
                }
                customRule.calledNumbers = goodNumbers
            }

            if (customRule.callHandlingAction === 'TakeMessagesOnly') {

                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === customRule.voicemail?.recipient.id)
                if (!originalExtension) {
                    postMessage(new Message(`Failed to adjust voicemail recipient for custom rule ${customRule.name} on site ${bundle.extension.name}`, 'error'))
                    postError(new SyncError(bundle.extension.name, bundle.extension.extensionNumber, ['Failed to adjust custom rule', customRule.name]))
                    return customRule
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
                if (!newExtension) {
                    postMessage(new Message(`Failed to adjust voicemail recipient for custom rule ${customRule.name} on site ${bundle.extension.name}`, 'error'))
                    postError(new SyncError(bundle.extension.name, bundle.extension.extensionNumber, ['Failed to adjust custom rule', customRule.name]))
                    return customRule
                }

                customRule.voicemail!.recipient.id = `${newExtension.data.id}`
                delete customRule.forwarding
                delete customRule.greetings
                delete customRule.unconditionalForwarding
                delete customRule.uri
                delete customRule.transfer

                return customRule
            }
            else if (customRule.callHandlingAction === 'TransferToExtension' || customRule.callHandlingAction === 'Bypass') {

                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${customRule.transfer?.extension.id}`)
                if (!originalExtension) {
                    postMessage(new Message(`Failed to adjust transfer extension for custom rule ${customRule.name} on site ${bundle.extension.name}`, 'error'))
                    postError(new SyncError(bundle.extension.name, bundle.extension.extensionNumber, ['Failed to adjust custom rule', customRule.name]))
                    return customRule
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
                if (!newExtension) {
                    postMessage(new Message(`Failed to adjust transfer extension for custom rule ${customRule.name} on site ${bundle.extension.name}`, 'error'))
                    postError(new SyncError(bundle.extension.name, bundle.extension.extensionNumber, ['Failed to adjust custom rule', customRule.name]))
                    return customRule
                }

                customRule.transfer!.extension.id = `${newExtension.data.id}`
                delete customRule.forwarding
                delete customRule.greetings
                delete customRule.unconditionalForwarding
                delete customRule.uri
                delete customRule.voicemail

                return customRule
            }

            else if (customRule.callHandlingAction === 'PlayAnnouncementOnly') {
                delete customRule.forwarding
                delete customRule.greetings
                delete customRule.unconditionalForwarding
                delete customRule.uri
                delete customRule.voicemail

                return customRule
            }
            else if (customRule.callHandlingAction === 'UnconditionalForwarding') {
                delete customRule.forwarding
                delete customRule.greetings
                delete customRule.uri
                delete customRule.voicemail
                delete customRule.transfer

                return customRule
            }
        } 
        catch (e) {
            postMessage(new Message(`Failed to adjust custom rule ${customRule.name} on site ${bundle.extension.name}`, 'error'))
        }
    }

    return {configureSites, progressValue, maxProgress}
}

export default useConfigureSites