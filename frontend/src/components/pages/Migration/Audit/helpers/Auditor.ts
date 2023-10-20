import { Message } from "../../../../../models/Message"
import { AccountData } from "../hooks/useFetchAccountData"
import { AuditDiscrepency } from "../models/AuditDiscrepency"
import { compareObjects } from "./AuditEngine"

export class Auditor {
    constructor(private postMessage: (message: Message) => void) {}

    compareAccounts(originalAccountData: AccountData, newAccountData: AccountData, ) {
        const discrepencies: AuditDiscrepency[] = []

        discrepencies.push(...this.compareSites(originalAccountData, newAccountData))
        discrepencies.push(...this.compareUsers(originalAccountData, newAccountData))
        discrepencies.push(...this.compareIVRs(originalAccountData, newAccountData))
        discrepencies.push(...this.compareLimitedExtensions(originalAccountData, newAccountData))
        discrepencies.push(...this.compareCallQueues(originalAccountData, newAccountData))
        discrepencies.push(...this.compareMessageOnlyExtensions(originalAccountData, newAccountData))
        discrepencies.push(...this.comparePrompts(originalAccountData, newAccountData))

        return discrepencies
    }

    private compareSites(originalAccountData: AccountData, newAccountData: AccountData) {
        const discrepencies: AuditDiscrepency[] = []
    
        for (const site of originalAccountData.sites) {
            const newAccountCounterpart = newAccountData.sites.find((currentSite) => currentSite.extension.name === site.extension.name)
            if (!newAccountCounterpart) {
                this.postMessage(new Message(`Site '${site.extension.name}' was not found in the new account`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: site.extension.name,
                    extensionNumber: site.extension.extensionNumber,
                    objectType: 'Site',
                    issue: {
                        path: 'extension',
                        expectedValue: site.extension.name,
                        foundValue: 'nothing'
                    }
                }))
                continue
            }

            if (site.extension.extensionNumber !== newAccountCounterpart.extension.extensionNumber) {
                this.postMessage(new Message(`Site '${site.extension.name}' has a different extension number. Expected: ${site.extension.extensionNumber}. Found : ${newAccountCounterpart.extension.extensionNumber}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: site.extension.name,
                    extensionNumber: site.extension.extensionNumber,
                    objectType: 'Site',
                    issue: {
                        path: 'extension number',
                        expectedValue: site.extension.extensionNumber,
                        foundValue: newAccountCounterpart.extension.extensionNumber
                    }
                }))
            }

            if (site.extension.callerIdName !== newAccountCounterpart.extension.callerIdName) {
                this.postMessage(new Message(`Site '${site.extension.name}' has a different caller Id name. Expected: ${site.extension.callerIdName}. Found: ${newAccountCounterpart.extension.callerIdName}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: site.extension.name,
                    extensionNumber: site.extension.extensionNumber,
                    objectType: 'Site',
                    issue: {
                        path: 'caller id name',
                        expectedValue: site.extension.callerIdName,
                        foundValue: newAccountCounterpart.extension.callerIdName
                    }
                }))
            }

            if (site.extension.code !== newAccountCounterpart.extension.code) {
                this.postMessage(new Message(`Site '${site.extension.name}' has a different site code. Expected: ${site.extension.code}. Found: ${newAccountCounterpart.extension.code}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: site.extension.name,
                    extensionNumber: site.extension.extensionNumber,
                    objectType: 'Site',
                    issue: {
                        path: 'site code',
                        expectedValue: site.extension.code ?? '',
                        foundValue: newAccountCounterpart.extension.code ?? ''
                    }
                }))
            }

            if (site.extension.regionalSettings.timezone?.name !== newAccountCounterpart.extension.regionalSettings.timezone?.name) {
                this.postMessage(new Message(`Site '${site.extension.name}' has a different timezone. Expected: ${site.extension.regionalSettings.timezone?.name}. Found: ${newAccountCounterpart.extension.regionalSettings.timezone?.name}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: site.extension.name,
                    extensionNumber: site.extension.extensionNumber,
                    objectType: 'Site',
                    issue: {
                        path: 'time zone',
                        expectedValue: site.extension.regionalSettings.timezone?.name ?? '',
                        foundValue: newAccountCounterpart.extension.regionalSettings.timezone?.name ?? ''
                    }
                }))
            }

            if (site.extendedData?.directNumbers?.length !== newAccountCounterpart.extendedData?.directNumbers?.length) {
                this.postMessage(new Message(`Site '${site.extension.name}' has a different number of phone numbers. Expected: ${site.extendedData?.directNumbers?.length} numbers. Found: ${newAccountCounterpart.extendedData?.directNumbers?.length} numbers`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: site.extension.name,
                    extensionNumber: site.extension.extensionNumber,
                    objectType: 'Site',
                    issue: {
                        path: 'direct numbers',
                        expectedValue: `${site.extendedData?.directNumbers?.length ?? ''}`,
                        foundValue: `${newAccountCounterpart.extendedData?.directNumbers?.length ?? ''}`
                    }
                }))
            }

            if (site.extendedData?.businessHoursCallHandling?.callHandlingAction !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.callHandlingAction) {
                this.postMessage(new Message(`Site '${site.extension.name}' has a business hours call handling action. Expected: ${site.extendedData?.businessHoursCallHandling?.callHandlingAction}. Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.callHandlingAction}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: site.extension.name,
                    extensionNumber: site.extension.extensionNumber,
                    objectType: 'Site',
                    issue: {
                        path: 'business hours call handling action',
                        expectedValue: site.extendedData?.businessHoursCallHandling?.callHandlingAction ?? '',
                        foundValue: newAccountCounterpart.extendedData?.businessHoursCallHandling?.callHandlingAction ?? ''
                    }
                }))
            }

            if (site.extendedData?.businessHoursCallHandling?.transfer.extension.extensionNumber !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.transfer.extension.extensionNumber) {
                this.postMessage(new Message(`Site '${site.extension.name}' has a business hours call handling transfer. Expected: ${site.extendedData?.businessHoursCallHandling?.transfer.extension.extensionNumber}. Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.transfer.extension.extensionNumber}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: site.extension.name,
                    extensionNumber: site.extension.extensionNumber,
                    objectType: 'Site',
                    issue: {
                        path: 'business hours call handling transfer',
                        expectedValue: site.extendedData?.businessHoursCallHandling?.transfer.extension.extensionNumber ?? '',
                        foundValue: newAccountCounterpart.extendedData?.businessHoursCallHandling?.transfer.extension.extensionNumber ?? ''
                    }
                }))
            }

            const issues = compareObjects(site.extendedData?.businessHours.schedule, newAccountCounterpart.extendedData?.businessHours.schedule)
            for (const issue of issues) {
                this.postMessage(new Message(`Site '${site.extension.name}' has different business hours. Expected: ${site.extendedData?.businessHours}. Found: ${newAccountCounterpart.extendedData?.businessHours}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: site.extension.name,
                    extensionNumber: site.extension.extensionNumber,
                    objectType: 'Site',
                    issue: {
                        path: 'business hours',
                        expectedValue: issue.expectedValue,
                        foundValue: issue.foundValue
                    }
                }))
            }

            for (const rule of site.extendedData?.customRules ?? []) {
                const newAccountRule = newAccountCounterpart.extendedData?.customRules?.find((currentRule) => currentRule.name === rule.name)
                if (!newAccountRule) {
                    this.postMessage(new Message(`Site '${site.extension.name}' is missing custom rule '${rule.name}'`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: site.extension.name,
                        extensionNumber: site.extension.extensionNumber,
                        objectType: 'Site',
                        issue: {
                            path: 'custom rule',
                            expectedValue: rule.name,
                            foundValue: 'nothing'
                        }
                    }))
                    continue
                }

                if (rule.calledNumbers?.length !== newAccountRule.calledNumbers?.length) {
                    this.postMessage(new Message(`Site '${site.extension.name}' has a different number of called numbers for custom rule '${rule.name}'. Expected: ${rule.calledNumbers?.length}. Found: ${newAccountRule.calledNumbers?.length}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: `${site.extension.name} - ${rule.name}`,
                        extensionNumber: site.extension.extensionNumber,
                        objectType: 'Site',
                        issue: {
                            path: 'custom rule - called numbers',
                            expectedValue: `${rule.calledNumbers?.length} called numbers`,
                            foundValue: `${newAccountRule.calledNumbers?.length} called numbers`
                        }
                    }))
                }

                if (rule.callers?.length !== newAccountRule.callers?.length) {
                    this.postMessage(new Message(`Site '${site.extension.name}' has a different number of caller IDs for custom rule '${rule.name}'. Expected: ${rule.callers?.length}. Found: ${newAccountRule.callers?.length}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: `${site.extension.name} - ${rule.name}`,
                        extensionNumber: site.extension.extensionNumber,
                        objectType: 'Site',
                        issue: {
                            path: 'custom rule - called numbers',
                            expectedValue: `${rule.callers?.length} callers`,
                            foundValue: `${newAccountRule.callers?.length} callers`
                        }
                    }))
                }
            }
        }

        return discrepencies
    }

    private compareMessageOnlyExtensions(originalAccountData: AccountData, newAccountData: AccountData) {
        const discrepencies: AuditDiscrepency[] = []

        for (const messageOnly of originalAccountData.messageOnlyExtensions) {
            const newAccountCounterpart = newAccountData.messageOnlyExtensions.find((currentItem) => currentItem.extension.data.name === messageOnly.extension.data.name)
            if (!newAccountCounterpart) {
                this.postMessage(new Message(`Message-Only / Announcement-Only '${messageOnly.extension.data.name}' was not found in the new account`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: messageOnly.extension.data.name,
                    extensionNumber: messageOnly.extension.data.extensionNumber,
                    objectType: 'Message-Only / Announcement-Only',
                    issue: {
                        path: 'extension',
                        expectedValue: messageOnly.extension.data.name,
                        foundValue: 'nothing'
                    }
                }))
                continue
            }

            if (messageOnly.extension.data.extensionNumber !== newAccountCounterpart.extension.data.extensionNumber) {
                this.postMessage(new Message(`Message-Only / Announcement-Only '${messageOnly.extension.data.name}' has a different extension number. Expected: ${messageOnly.extension.data.extensionNumber}. Found: ${newAccountCounterpart.extension.data.extensionNumber}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: messageOnly.extension.data.name,
                    extensionNumber: messageOnly.extension.data.extensionNumber,
                    objectType: 'Message-Only / Announcement-Only',
                    issue: {
                        path: 'extension number',
                        expectedValue: messageOnly.extension.data.extensionNumber,
                        foundValue: newAccountCounterpart.extension.data.extensionNumber
                    }
                }))
            }

            if (messageOnly.extension.data.site?.name !== newAccountCounterpart.extension.data.site?.name) {
                this.postMessage(new Message(`Message-Only / Announcement-Only '${messageOnly.extension.data.name}' is assigned to a different site. Expected: ${messageOnly.extension.data.site?.name}. Found: ${newAccountCounterpart.extension.data.site?.name}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: messageOnly.extension.data.name,
                    extensionNumber: messageOnly.extension.data.extensionNumber,
                    objectType: 'Message-Only / Announcement-Only',
                    issue: {
                        path: 'site',
                        expectedValue: messageOnly.extension.data.site?.name ?? '',
                        foundValue: newAccountCounterpart.extension.data.site?.name ?? ''
                    }
                }))
            }

            if (messageOnly.extension.data.costCenter?.name !== newAccountCounterpart.extension.data.costCenter?.name) {
                this.postMessage(new Message(`Message-Only / Announcement-Only '${messageOnly.extension.data.name}' is assigned to a different cost center. Expected: ${messageOnly.extension.data.costCenter?.name}. Found: ${newAccountCounterpart.extension.data.costCenter?.name}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: messageOnly.extension.data.name,
                    extensionNumber: messageOnly.extension.data.extensionNumber,
                    objectType: 'Message-Only / Announcement-Only',
                    issue: {
                        path: 'cost center',
                        expectedValue: messageOnly.extension.data.costCenter?.name ?? '',
                        foundValue: newAccountCounterpart.extension.data.costCenter?.name ?? ''
                    }
                }))
            }

            if (messageOnly.extension.data.hidden !== newAccountCounterpart.extension.data.hidden) {
                this.postMessage(new Message(`Message-Only / Announcement-Only '${messageOnly.extension.data.name}' has a different hidden status. Expected: ${messageOnly.extension.data.hidden}. Found: ${newAccountCounterpart.extension.data.hidden}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: messageOnly.extension.data.name,
                    extensionNumber: messageOnly.extension.data.extensionNumber,
                    objectType: 'Message-Only / Announcement-Only',
                    issue: {
                        path: 'hidden status',
                        expectedValue: `${messageOnly.extension.data.hidden ? 'Hidden' : 'Not Hidden'}`,
                        foundValue: `${newAccountCounterpart.extension.data.hidden ? 'Hidden' : 'Not Hidden'}`
                    }
                }))
            }

            if (messageOnly.extendedData?.directNumbers?.length !== newAccountCounterpart.extendedData?.directNumbers?.length) {
                this.postMessage(new Message(`Message-Only / Announcement-Only '${messageOnly.extension.data.name}' has a different number of phone numbers. Expected: ${messageOnly.extendedData?.directNumbers?.length}. Found: ${newAccountCounterpart.extendedData?.directNumbers?.length}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: messageOnly.extension.data.name,
                    extensionNumber: messageOnly.extension.data.extensionNumber,
                    objectType: 'Message-Only / Announcement-Only',
                    issue: {
                        path: 'direct numbers',
                        expectedValue: `${messageOnly.extendedData?.directNumbers?.length}`,
                        foundValue: `${newAccountCounterpart.extendedData?.directNumbers?.length}`
                    }
                }))
            }

            if (messageOnly.extendedData?.greeting?.type !== newAccountCounterpart.extendedData?.greeting?.type) {
                this.postMessage(new Message(`Message-Only / Announcement-Only '${messageOnly.extension.data.name}' has a different greeting type. Expected: ${messageOnly.extendedData?.greeting?.type}. Found: ${newAccountCounterpart.extendedData?.greeting?.type}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: messageOnly.extension.data.name,
                    extensionNumber: messageOnly.extension.data.extensionNumber,
                    objectType: 'Message-Only / Announcement-Only',
                    issue: {
                        path: 'greeting type',
                        expectedValue: messageOnly.extendedData?.greeting?.type ?? '',
                        foundValue: newAccountCounterpart.extendedData?.greeting?.type ?? ''
                    }
                }))
            }
            
        }

        return discrepencies
    }

    private compareIVRs(originalAccountData: AccountData, newAccountData: AccountData) {
        const discrepencies: AuditDiscrepency[] = []

        for (const ivr of originalAccountData.ivrs) {
            const newAccountCounterpart = newAccountData.ivrs.find((currentItem) => currentItem.extension.data.name === ivr.extension.data.name)
            if (!newAccountCounterpart) {
                this.postMessage(new Message(`IVR '${ivr.extension.data.name}' was not found in the new account`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: ivr.extension.data.name,
                    extensionNumber: ivr.extension.data.extensionNumber,
                    objectType: 'IVR Menu',
                    issue: {
                        path: 'extension',
                        expectedValue: ivr.extension.data.name,
                        foundValue: 'nothing'
                    }
                }))
                continue
            }

            if (ivr.extension.data.extensionNumber !== newAccountCounterpart.extension.data.extensionNumber) {
                this.postMessage(new Message(`IVR '${ivr.extension.data.name}' has a different extension number. Expected: ${ivr.extension.data.extensionNumber}. Found: ${newAccountCounterpart.extension.data.extensionNumber}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: ivr.extension.data.name,
                    extensionNumber: ivr.extension.data.extensionNumber,
                    objectType: 'IVR Menu',
                    issue: {
                        path: 'extension number',
                        expectedValue: ivr.extension.data.extensionNumber,
                        foundValue: newAccountCounterpart.extension.data.extensionNumber
                    }
                }))
            }

            if (ivr.extension.data.site?.name !== newAccountCounterpart.extension.data.site?.name) {
                this.postMessage(new Message(`IVR '${ivr.extension.data.name}' is assigned to a different site. Expected: ${ivr.extension.data.site?.name}. Found: ${newAccountCounterpart.extension.data.site?.name}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: ivr.extension.data.name,
                    extensionNumber: ivr.extension.data.extensionNumber,
                    objectType: 'IVR Menu',
                    issue: {
                        path: 'site',
                        expectedValue: ivr.extension.data.site?.name ?? '',
                        foundValue: newAccountCounterpart.extension.data.site?.name ?? ''
                    }
                }))
            }

            if (ivr.extension.data.costCenter?.name !== newAccountCounterpart.extension.data.costCenter?.name) {
                this.postMessage(new Message(`IVR '${ivr.extension.data.name}' is assigned to a different cost center. Expected: ${ivr.extension.data.costCenter?.name}. Found: ${newAccountCounterpart.extension.data.costCenter?.name}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: ivr.extension.data.name,
                    extensionNumber: ivr.extension.data.extensionNumber,
                    objectType: 'IVR Menu',
                    issue: {
                        path: 'cost center',
                        expectedValue: ivr.extension.data.costCenter?.name ?? '',
                        foundValue: newAccountCounterpart.extension.data.costCenter?.name ?? ''
                    }
                }))
            }

            if (ivr.extension.data.hidden !== newAccountCounterpart.extension.data.hidden) {
                this.postMessage(new Message(`IVR '${ivr.extension.data.name}' has a different hidden status. Expected: ${ivr.extension.data.hidden}. Found: ${newAccountCounterpart.extension.data.hidden}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: ivr.extension.data.name,
                    extensionNumber: ivr.extension.data.extensionNumber,
                    objectType: 'IVR Menu',
                    issue: {
                        path: 'hidden status',
                        expectedValue: `${ivr.extension.data.hidden ? 'Hidden' : 'Not Hidden'}`,
                        foundValue: `${newAccountCounterpart.extension.data.hidden ? 'Hidden' : 'Not Hidden'}`
                    }
                }))
            }

            if (ivr.extendedData?.directNumbers?.length !== newAccountCounterpart.extendedData?.directNumbers?.length) {
                this.postMessage(new Message(`IVR '${ivr.extension.data.name}' has a different number of phone numbers. Expected: ${ivr.extendedData?.directNumbers?.length}. Found: ${newAccountCounterpart.extendedData?.directNumbers?.length}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: ivr.extension.data.name,
                    extensionNumber: ivr.extension.data.extensionNumber,
                    objectType: 'IVR Menu',
                    issue: {
                        path: 'direct numbers',
                        expectedValue: `${ivr.extendedData?.directNumbers?.length}`,
                        foundValue: `${newAccountCounterpart.extendedData?.directNumbers?.length}`
                    }
                }))
            }

            if (ivr.extendedData?.ivrData?.prompt?.mode !== newAccountCounterpart.extendedData?.ivrData?.prompt?.mode) {
                this.postMessage(new Message(`IVR '${ivr.extension.data.name}' has a different prompt mode. Expected: ${ivr.extendedData?.ivrData?.prompt?.mode}. Found: ${newAccountCounterpart.extendedData?.ivrData?.prompt?.mode}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: ivr.extension.data.name,
                    extensionNumber: ivr.extension.data.extensionNumber,
                    objectType: 'IVR Menu',
                    issue: {
                        path: 'prompt mode',
                        expectedValue: `${ivr.extendedData?.ivrData?.prompt?.mode}`,
                        foundValue: `${newAccountCounterpart.extendedData?.ivrData?.prompt?.mode}`
                    }
                }))
            }

            if (ivr.extendedData?.ivrData?.prompt?.text !== newAccountCounterpart.extendedData?.ivrData?.prompt?.text) {
                this.postMessage(new Message(`IVR '${ivr.extension.data.name}' has a different text-to-speech prompt. Expected: ${ivr.extendedData?.ivrData?.prompt?.text}. Found: ${newAccountCounterpart.extendedData?.ivrData?.prompt?.text}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: ivr.extension.data.name,
                    extensionNumber: ivr.extension.data.extensionNumber,
                    objectType: 'IVR Menu',
                    issue: {
                        path: 'prompt',
                        expectedValue: `${ivr.extendedData?.ivrData?.prompt?.text}`,
                        foundValue: `${newAccountCounterpart.extendedData?.ivrData?.prompt?.text}`
                    }
                }))
            }

            for (const action of ivr.extendedData?.ivrData?.actions ?? []) {
                const newAccountAction = newAccountCounterpart.extendedData?.ivrData?.actions?.find((currentAction) => currentAction.input === action.input)
                if (!newAccountAction) {
                    this.postMessage(new Message(`IVR '${ivr.extension.data.name}' is missing key press ${action.input} in the new account`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: ivr.extension.data.name,
                        extensionNumber: ivr.extension.data.extensionNumber,
                        objectType: 'IVR Menu',
                        issue: {
                            path: `key press ${action.input}`,
                            expectedValue: `key press ${action.input}`,
                            foundValue: 'nothing'
                        }
                    }))
                    continue
                }

                if (action.action !== newAccountAction.action) {
                    this.postMessage(new Message(`IVR '${ivr.extension.data.name}' has a different key press action for key press ${action.input}. Expected: ${action.action}. Found: ${newAccountAction.action}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: ivr.extension.data.name,
                        extensionNumber: ivr.extension.data.extensionNumber,
                        objectType: 'IVR Menu',
                        issue: {
                            path: 'key press action',
                            expectedValue: action.action,
                            foundValue: newAccountAction.action
                        }
                    }))
                }

                if (action.extension?.name !== newAccountAction.extension?.name) {
                    this.postMessage(new Message(`IVR '${ivr.extension.data.name}' has a different key press destination for key press ${action.input}. Expected: ${action.extension?.name}. Found: ${newAccountAction.extension?.name}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: ivr.extension.data.name,
                        extensionNumber: ivr.extension.data.extensionNumber,
                        objectType: 'IVR Menu',
                        issue: {
                            path: 'key press action',
                            expectedValue: action.extension?.name ?? '',
                            foundValue: newAccountAction.extension?.name ?? ''
                        }
                    }))
                }

                if (action.phoneNumber !== newAccountAction.phoneNumber) {
                    this.postMessage(new Message(`IVR '${ivr.extension.data.name}' has a different key press destination for key press ${action.input}. Expected: ${action.extension?.name}. Found: ${newAccountAction.extension?.name}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: ivr.extension.data.name,
                        extensionNumber: ivr.extension.data.extensionNumber,
                        objectType: 'IVR Menu',
                        issue: {
                            path: 'key press action',
                            expectedValue: action.phoneNumber ?? '',
                            foundValue: newAccountAction.phoneNumber ?? ''
                        }
                    }))
                }
            }
        }
        return discrepencies
    }

    private compareLimitedExtensions(originalAccountData: AccountData, newAccountData: AccountData) {
        const discrepencies: AuditDiscrepency[] = []

        for (const limitedExtension of originalAccountData.limitedExtensions) {
            const newAccountCounterpart = newAccountData.limitedExtensions.find((currentItem) => currentItem.extension.data.name === limitedExtension.extension.data.name)
            if (!newAccountCounterpart) {
                this.postMessage(new Message(`Limited extension '${limitedExtension.extension.data.name}' was not found in the new account`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: limitedExtension.extension.data.name,
                    extensionNumber: limitedExtension.extension.data.extensionNumber,
                    objectType: 'Limited Extension',
                    issue: {
                        path: 'extension',
                        expectedValue: limitedExtension.extension.data.name,
                        foundValue: 'nothing'
                    }
                }))
                continue
            }

            if (limitedExtension.extension.data.extensionNumber !== newAccountCounterpart.extension.data.extensionNumber) {
                this.postMessage(new Message(`Limited extensions '${limitedExtension.extension.data.name}' has a different extension number. Expected: ${limitedExtension.extension.data.extensionNumber}. Found: ${newAccountCounterpart.extension.data.extensionNumber}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: limitedExtension.extension.data.name,
                    extensionNumber: limitedExtension.extension.data.extensionNumber,
                    objectType: 'Limited Extension',
                    issue: {
                        path: 'extension number',
                        expectedValue: limitedExtension.extension.data.extensionNumber,
                        foundValue: newAccountCounterpart.extension.data.extensionNumber
                    }
                }))
            }

            if (limitedExtension.extension.data.site?.name !== newAccountCounterpart.extension.data.site?.name) {
                this.postMessage(new Message(`Limited extensions '${limitedExtension.extension.data.name}' is assigned to a different site. Expected: ${limitedExtension.extension.data.site?.name}. Found: ${newAccountCounterpart.extension.data.site?.name}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: limitedExtension.extension.data.name,
                    extensionNumber: limitedExtension.extension.data.extensionNumber,
                    objectType: 'Limited Extension',
                    issue: {
                        path: 'site',
                        expectedValue: limitedExtension.extension.data.site?.name ?? '',
                        foundValue: newAccountCounterpart.extension.data.site?.name ?? ''
                    }
                }))
            }

            if (limitedExtension.extension.data.costCenter?.name !== newAccountCounterpart.extension.data.costCenter?.name) {
                this.postMessage(new Message(`Limited extensions '${limitedExtension.extension.data.name}' is assigned to a different cost center. Expected: ${limitedExtension.extension.data.costCenter?.name}. Found: ${newAccountCounterpart.extension.data.costCenter?.name}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: limitedExtension.extension.data.name,
                    extensionNumber: limitedExtension.extension.data.extensionNumber,
                    objectType: 'Limited Extension',
                    issue: {
                        path: 'cost center',
                        expectedValue: limitedExtension.extension.data.costCenter?.name ?? '',
                        foundValue: newAccountCounterpart.extension.data.costCenter?.name ?? ''
                    }
                }))
            }

            if (limitedExtension.extension.data.hidden !== newAccountCounterpart.extension.data.hidden) {
                this.postMessage(new Message(`Limited extensions '${limitedExtension.extension.data.name}' has a different hidden status. Expected: ${limitedExtension.extension.data.hidden}. Found: ${newAccountCounterpart.extension.data.hidden}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: limitedExtension.extension.data.name,
                    extensionNumber: limitedExtension.extension.data.extensionNumber,
                    objectType: 'Limited Extension',
                    issue: {
                        path: 'hidden status',
                        expectedValue: `${limitedExtension.extension.data.hidden ? 'Hidden' : 'Not Hidden'}`,
                        foundValue: `${newAccountCounterpart.extension.data.hidden ? 'Hidden' : 'Not Hidden'}`
                    }
                }))
            }

            if (limitedExtension.extendedData?.directNumbers?.length !== newAccountCounterpart.extendedData?.directNumbers?.length) {
                this.postMessage(new Message(`Limited extensions '${limitedExtension.extension.data.name}' has a different number of phone numbers. Expected: ${limitedExtension.extendedData?.directNumbers?.length}. Found: ${newAccountCounterpart.extendedData?.directNumbers?.length}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: limitedExtension.extension.data.name,
                    extensionNumber: limitedExtension.extension.data.extensionNumber,
                    objectType: 'Limited Extension',
                    issue: {
                        path: 'direct numbers',
                        expectedValue: `${limitedExtension.extendedData?.directNumbers?.length}`,
                        foundValue: `${newAccountCounterpart.extendedData?.directNumbers?.length}`
                    }
                }))
            }

            if (limitedExtension.extendedData?.devices && limitedExtension.extendedData.devices.length > 0 && newAccountCounterpart.extendedData?.devices && newAccountCounterpart.extendedData.devices.length > 0) {
                if (limitedExtension.extendedData.devices[0].name !== newAccountCounterpart.extendedData.devices[0].name) {
                    this.postMessage(new Message(`Limited extensions '${limitedExtension.extension.data.name}' has a different device name. Expected: ${limitedExtension.extendedData?.devices[0].name}. Found: ${newAccountCounterpart.extendedData?.devices[0].name}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: limitedExtension.extension.data.name,
                        extensionNumber: limitedExtension.extension.data.extensionNumber,
                        objectType: 'Limited Extension',
                        issue: {
                            path: 'device name',
                            expectedValue: limitedExtension.extendedData.devices[0].name,
                            foundValue: newAccountCounterpart.extendedData.devices[0].name
                        }
                    }))
                }

                if (limitedExtension.extendedData.devices[0].model?.name !== newAccountCounterpart.extendedData.devices[0].model?.name) {
                    this.postMessage(new Message(`Limited extensions '${limitedExtension.extension.data.name}' has a different device model. Expected: ${limitedExtension.extendedData?.devices[0].model.name}. Found: ${newAccountCounterpart.extendedData?.devices[0].model.name}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: limitedExtension.extension.data.name,
                        extensionNumber: limitedExtension.extension.data.extensionNumber,
                        objectType: 'Limited Extension',
                        issue: {
                            path: 'device name',
                            expectedValue: limitedExtension.extendedData.devices[0].model.name,
                            foundValue: newAccountCounterpart.extendedData.devices[0].model.name
                        }
                    }))
                }

                if (limitedExtension.extendedData.devices[0].type !== newAccountCounterpart.extendedData.devices[0].type) {
                    this.postMessage(new Message(`Limited extensions '${limitedExtension.extension.data.name}' has a different device type. Expected: ${limitedExtension.extendedData?.devices[0].type}. Found: ${newAccountCounterpart.extendedData?.devices[0].type}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: limitedExtension.extension.data.name,
                        extensionNumber: limitedExtension.extension.data.extensionNumber,
                        objectType: 'Limited Extension',
                        issue: {
                            path: 'device name',
                            expectedValue: limitedExtension.extendedData.devices[0].type,
                            foundValue: newAccountCounterpart.extendedData.devices[0].type
                        }
                    }))
                }

                if (limitedExtension.extendedData.devices[0].useAsCommonPhone !== newAccountCounterpart.extendedData.devices[0].useAsCommonPhone) {
                    this.postMessage(new Message(`Limited extensions '${limitedExtension.extension.data.name}' has a different hot desking status. Expected: ${limitedExtension.extendedData?.devices[0].useAsCommonPhone ? 'Hot Desking' : 'Not hot desking'}. Found: ${newAccountCounterpart.extendedData?.devices[0].name ? 'Hot Desking' : 'Not hot desking'}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: limitedExtension.extension.data.name,
                        extensionNumber: limitedExtension.extension.data.extensionNumber,
                        objectType: 'Limited Extension',
                        issue: {
                            path: 'device name',
                            expectedValue: limitedExtension.extendedData.devices[0].useAsCommonPhone ? 'Hot Desking' : 'Not hot desking',
                            foundValue: newAccountCounterpart.extendedData.devices[0].useAsCommonPhone ? 'Hot Desking' : 'Not hot desking'
                        }
                    }))
                }

                if (limitedExtension.extendedData.devices[0].emergency.location?.name !== newAccountCounterpart.extendedData.devices[0].emergency.location?.name) {
                    this.postMessage(new Message(`Limited extensions '${limitedExtension.extension.data.name}' has a different ERL. Expected: ${limitedExtension.extendedData?.devices[0].emergency.location?.name}. Found: ${newAccountCounterpart.extendedData.devices[0].emergency.location?.name}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: limitedExtension.extension.data.name,
                        extensionNumber: limitedExtension.extension.data.extensionNumber,
                        objectType: 'Limited Extension',
                        issue: {
                            path: 'device ER:',
                            expectedValue: limitedExtension.extendedData.devices[0].emergency.location?.name ?? '',
                            foundValue: newAccountCounterpart.extendedData.devices[0].emergency.location?.name ?? ''
                        }
                    }))
                }

            }
        }
        return discrepencies
    }

    private compareCallQueues(originalAccountData: AccountData, newAccountData: AccountData) {
        const discrepencies: AuditDiscrepency[] = []

        for (const queue of originalAccountData.callQueues) {
            const newAccountCounterpart = newAccountData.callQueues.find((currentItem) => currentItem.extension.data.name === queue.extension.data.name)
            if (!newAccountCounterpart) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' was not found in the new account`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'extension',
                        expectedValue: queue.extension.data.name,
                        foundValue: 'nothing'
                    }
                }))
                continue
            }

            if (queue.extension.data.extensionNumber !== newAccountCounterpart.extension.data.extensionNumber) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has a different extension number. Expected: ${queue.extension.data.extensionNumber}. Found: ${newAccountCounterpart.extension.data.extensionNumber}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'extension number',
                        expectedValue: queue.extension.data.extensionNumber,
                        foundValue: newAccountCounterpart.extension.data.extensionNumber
                    }
                }))
            }

            if (queue.extension.data.site?.name !== newAccountCounterpart.extension.data.site?.name) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' is assigned to a different site. Expected: ${queue.extension.data.site?.name}. Found: ${newAccountCounterpart.extension.data.site?.name}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'site',
                        expectedValue: queue.extension.data.site?.name ?? '',
                        foundValue: newAccountCounterpart.extension.data.site?.name ?? ''
                    }
                }))
            }

            if (queue.extension.data.costCenter && queue.extension.data.costCenter?.name !== newAccountCounterpart.extension.data.costCenter?.name) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' is assigned to a different cost center. Expected: ${queue.extension.data.costCenter?.name}. Found: ${newAccountCounterpart.extension.data.costCenter?.name}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'cost center',
                        expectedValue: queue.extension.data.costCenter?.name ?? '',
                        foundValue: newAccountCounterpart.extension.data.costCenter?.name ?? ''
                    }
                }))
            }

            if (queue.extension.data.hidden !== newAccountCounterpart.extension.data.hidden) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has a different hidden status. Expected: ${queue.extension.data.hidden}. Found: ${newAccountCounterpart.extension.data.hidden}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'hidden status',
                        expectedValue: `${queue.extension.data.hidden ? 'Hidden' : 'Not Hidden'}`,
                        foundValue: `${newAccountCounterpart.extension.data.hidden ? 'Hidden' : 'Not Hidden'}`
                    }
                }))
            }

            if (queue.extendedData?.directNumbers?.length !== newAccountCounterpart.extendedData?.directNumbers?.length) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has a different number of phone numbers. Expected: ${queue.extendedData?.directNumbers?.length}. Found: ${newAccountCounterpart.extendedData?.directNumbers?.length}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'direct numbers',
                        expectedValue: `${queue.extendedData?.directNumbers?.length}`,
                        foundValue: `${newAccountCounterpart.extendedData?.directNumbers?.length}`
                    }
                }))
            }

            const newMembers = newAccountCounterpart.extendedData?.members ?? []
            const newMemberExtensions = newMembers.map((member) => member.extensionNumber)
            for (const member of queue.extendedData?.members ?? []) {
                if (!newMemberExtensions.includes(member.extensionNumber)) {
                    this.postMessage(new Message(`Call queue '${queue.extension.data.name}' is missing member ${member.extensionNumber}. Expected: ${member.extensionNumber}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: queue.extension.data.name,
                        extensionNumber: queue.extension.data.extensionNumber,
                        objectType: 'Call Queue',
                        issue: {
                            path: 'members',
                            expectedValue: `${member.extensionNumber}`,
                            foundValue: `nothing`
                        }
                    }))
                }
            }

            const newManagers = newAccountCounterpart.extendedData?.managers ?? []
            const newManagerExtensions = newManagers.map((manager) => manager.extension.extensionNumber)
            for (const manager of queue.extendedData?.managers ?? []) {
                if (!newManagerExtensions.includes(manager.extension.extensionNumber)) {
                    this.postMessage(new Message(`Call queue '${queue.extension.data.name}' is missing manager ${manager.extension.extensionNumber}. Expected: ${manager.extension.extensionNumber}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: queue.extension.data.name,
                        extensionNumber: queue.extension.data.extensionNumber,
                        objectType: 'Call Queue',
                        issue: {
                            path: 'managers',
                            expectedValue: `${manager.extension.extensionNumber}`,
                            foundValue: `nothing`
                        }
                    }))
                }
            }

            const newMemberPresense = newAccountCounterpart.extendedData?.memberPresense ?? []
            for (const memberPresense of queue.extendedData?.memberPresense ?? []) {
                const newMember = newMemberPresense.find((member) => member.member.extensionNumber === memberPresense.member.extensionNumber)
                if (!newMember) {
                    this.postMessage(new Message(`Call queue '${queue.extension.data.name}' is missing presense setting for ${memberPresense.member.extensionNumber}. Expected: to find presense setting for ${memberPresense.member.extensionNumber}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: queue.extension.data.name,
                        extensionNumber: queue.extension.data.extensionNumber,
                        objectType: 'Call Queue',
                        issue: {
                            path: 'member presense',
                            expectedValue: `${memberPresense.member.extensionNumber}`,
                            foundValue: `nothing`
                        }
                    }))
                }

                if (newMember?.acceptCurrentQueueCalls !== memberPresense.acceptCurrentQueueCalls) {
                    this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has incorrect presense setting for member ${memberPresense.member.extensionNumber}. Expected: ${memberPresense.acceptCurrentQueueCalls ? 'Accept current queue calls': `Don't accept current queue calls`}. Found: ${newMember?.acceptCurrentQueueCalls ? 'Accept current queue calls': `Don't accept current queue calls`}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: queue.extension.data.name,
                        extensionNumber: queue.extension.data.extensionNumber,
                        objectType: 'Call Queue',
                        issue: {
                            path: 'member presense',
                            expectedValue: `${memberPresense.acceptCurrentQueueCalls ? 'Accept current queue calls': `Don't accept current queue calls`}`,
                            foundValue: `${newMember?.acceptCurrentQueueCalls ? 'Accept current queue calls': `Don't accept current queue calls`}`
                        }
                    }))
                }

                if (newMember?.acceptQueueCalls !== memberPresense.acceptQueueCalls) {
                    this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has incorrect presense setting for member ${memberPresense.member.extensionNumber}. Expected: ${memberPresense.acceptQueueCalls ? 'Accept current queue calls': `Don't accept current queue calls`}. Found: ${newMember?.acceptQueueCalls ? 'Accept current queue calls': `Don't accept current queue calls`}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: queue.extension.data.name,
                        extensionNumber: queue.extension.data.extensionNumber,
                        objectType: 'Call Queue',
                        issue: {
                            path: 'member presense',
                            expectedValue: `${memberPresense.acceptQueueCalls ? 'Accept current queue calls': `Don't accept current queue calls`}`,
                            foundValue: `${newMember?.acceptQueueCalls ? 'Accept current queue calls': `Don't accept current queue calls`}`
                        }
                    }))
                }
            }

            if (queue.extendedData?.businessHoursCallHandling?.queue?.transferMode !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.transferMode) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has a different ring type. Expected: ${queue.extendedData?.businessHoursCallHandling?.queue?.transferMode}. Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.transferMode}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'ring type',
                        expectedValue: queue.extendedData?.businessHoursCallHandling?.queue?.transferMode ?? '',
                        foundValue: newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.transferMode ?? ''
                    }
                }))
            }

            if (queue.extendedData?.businessHoursCallHandling?.queue?.agentTimeout !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.agentTimeout) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has a different wait time. Expected: ${queue.extendedData?.businessHoursCallHandling?.queue?.agentTimeout}. Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.agentTimeout}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'wait time',
                        expectedValue: `${queue.extendedData?.businessHoursCallHandling?.queue?.agentTimeout}`,
                        foundValue: `${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.agentTimeout}`
                    }
                }))
            }

            if (queue.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionMode !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionMode) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has a different interrupt audio mode. Expected: ${queue.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionMode}. Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionMode}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'interrupt audio mode',
                        expectedValue: queue.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionMode ?? '',
                        foundValue: newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionMode ?? ''
                    }
                }))
            }

            if (queue.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionPeriod !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionPeriod) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has a different interrupt audio period. Expected: ${queue.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionPeriod}. Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionPeriod}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'interrupt audio period',
                        expectedValue: `${queue.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionPeriod}`,
                        foundValue: `${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.holdAudioInterruptionPeriod}`
                    }
                }))
            }

            if (queue.extendedData?.businessHoursCallHandling?.queue?.holdTime !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.holdTime) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has a different wait time. Expected: ${queue.extendedData?.businessHoursCallHandling?.queue?.holdTime}. Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.holdTime}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'wait time',
                        expectedValue: `${queue.extendedData?.businessHoursCallHandling?.queue?.holdTime}`,
                        foundValue: `${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.holdTime}`
                    }
                }))
            }

            if (queue.extendedData?.businessHoursCallHandling?.queue?.holdTimeExpirationAction !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.holdTimeExpirationAction) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has a different max wait time action. Expected: ${queue.extendedData?.businessHoursCallHandling?.queue?.holdTimeExpirationAction}. Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.holdTimeExpirationAction}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'max wait time action',
                        expectedValue: `${queue.extendedData?.businessHoursCallHandling?.queue?.holdTimeExpirationAction}`,
                        foundValue: `${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.holdTimeExpirationAction}`
                    }
                }))
            }

            if (queue.extendedData?.businessHoursCallHandling?.queue?.maxCallers !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.maxCallers) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has a different max callers. Expected: ${queue.extendedData?.businessHoursCallHandling?.queue?.maxCallers}. Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.maxCallers}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'max callers',
                        expectedValue: `${queue.extendedData?.businessHoursCallHandling?.queue?.maxCallers}`,
                        foundValue: `${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.maxCallers}`
                    }
                }))
            }

            if (queue.extendedData?.businessHoursCallHandling?.queue?.maxCallersAction !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.maxCallersAction) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has a different max callers action. Expected: ${queue.extendedData?.businessHoursCallHandling?.queue?.maxCallersAction}. Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.maxCallersAction}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'max callers action',
                        expectedValue: `${queue.extendedData?.businessHoursCallHandling?.queue?.maxCallersAction}`,
                        foundValue: `${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.maxCallersAction}`
                    }
                }))
            }

            if (queue.extendedData?.businessHoursCallHandling?.queue?.noAnswerAction !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.noAnswerAction) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has a different no answer action. Expected: ${queue.extendedData?.businessHoursCallHandling?.queue?.noAnswerAction}. Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.noAnswerAction}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'no answer action',
                        expectedValue: `${queue.extendedData?.businessHoursCallHandling?.queue?.noAnswerAction}`,
                        foundValue: `${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.noAnswerAction}`
                    }
                }))
            }

            if (queue.extendedData?.businessHoursCallHandling?.queue?.wrapUpTime !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.wrapUpTime) {
                this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has a different wrap up time. Expected: ${queue.extendedData?.businessHoursCallHandling?.queue?.wrapUpTime}. Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.wrapUpTime}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: queue.extension.data.name,
                    extensionNumber: queue.extension.data.extensionNumber,
                    objectType: 'Call Queue',
                    issue: {
                        path: 'wrap up time',
                        expectedValue: `${queue.extendedData?.businessHoursCallHandling?.queue?.wrapUpTime}`,
                        foundValue: `${newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.wrapUpTime}`
                    }
                }))
            }

            for (const transferAction of queue.extendedData?.businessHoursCallHandling?.queue?.transfer ?? []) {
                const newAccountTransfer = newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.transfer?.find((transfer) => transfer.action === transfer.action)
                if (!newAccountTransfer) {
                    this.postMessage(new Message(`Call queue '${queue.extension.data.name}' is missing a business hours ${transferAction.action} transfer. Expected: ${transferAction.action} tranfer to ${transferAction.extension.name} - Ext. ${transferAction.extension.extensionNumber}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: queue.extension.data.name,
                        extensionNumber: queue.extension.data.extensionNumber,
                        objectType: 'Call Queue',
                        issue: {
                            path: 'business hours transfer',
                            expectedValue: `${transferAction.action} tranfer to ${transferAction.extension.name} - Ext. ${transferAction.extension.extensionNumber}`,
                            foundValue: `nothing`
                        }
                    }))
                    continue
                }

                if (newAccountTransfer?.extension.name !== transferAction.extension.name) {
                    this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has an incorrect ${transferAction.action} transfer. Expected: ${transferAction.action} tranfer to ${transferAction.extension.name} - Ext. ${transferAction.extension.extensionNumber}. Found: ${newAccountTransfer.action} tranfer to ${newAccountTransfer.extension.name} - Ext. ${newAccountTransfer.extension.extensionNumber}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: queue.extension.data.name,
                        extensionNumber: queue.extension.data.extensionNumber,
                        objectType: 'Call Queue',
                        issue: {
                            path: 'business hours transfer',
                            expectedValue: `${transferAction.action} tranfer to ${transferAction.extension.name} - Ext. ${transferAction.extension.extensionNumber}`,
                            foundValue: `nothing`
                        }
                    }))
                }
            }

            for (const transferAction of queue.extendedData?.businessHoursCallHandling?.queue?.unconditionalForwarding ?? []) {
                const newAccountTransfer = newAccountCounterpart.extendedData?.businessHoursCallHandling?.queue?.unconditionalForwarding?.find((transfer) => transfer.action === transfer.action)
                if (!newAccountTransfer) {
                    this.postMessage(new Message(`Call queue '${queue.extension.data.name}' is missing a business hours ${transferAction.action} transfer. Expected: ${transferAction.action} tranfer to ${transferAction.phoneNumber} - Ext. ${transferAction.phoneNumber}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: queue.extension.data.name,
                        extensionNumber: queue.extension.data.extensionNumber,
                        objectType: 'Call Queue',
                        issue: {
                            path: 'business hours transfer',
                            expectedValue: `${transferAction.action} tranfer to ${transferAction.phoneNumber} - Ext. ${transferAction.phoneNumber}`,
                            foundValue: `nothing`
                        }
                    }))
                    continue
                }

                if (newAccountTransfer?.phoneNumber !== transferAction.phoneNumber) {
                    this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has an incorrect ${transferAction.action} transfer. Expected: ${transferAction.action} tranfer to ${transferAction.phoneNumber}. Found: ${newAccountTransfer.action} tranfer to ${newAccountTransfer.phoneNumber}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: queue.extension.data.name,
                        extensionNumber: queue.extension.data.extensionNumber,
                        objectType: 'Call Queue',
                        issue: {
                            path: 'business hours transfer',
                            expectedValue: `${transferAction.action} tranfer to ${transferAction.phoneNumber}`,
                            foundValue: `nothing`
                        }
                    }))
                }
            }

            for (const greeting of queue.extendedData?.businessHoursCallHandling?.greetings ?? []) {
                const newAccountGreeting = newAccountCounterpart.extendedData?.businessHoursCallHandling?.greetings.find((currentGreeting) => currentGreeting.type === greeting.type)
                if (!newAccountGreeting) {
                    this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has an incorrect ${greeting.type} greeting. Expected: ${greeting.preset ? greeting.preset.name : 'Custom greeting'}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: queue.extension.data.name,
                        extensionNumber: queue.extension.data.extensionNumber,
                        objectType: 'Call Queue',
                        issue: {
                            path: `business hours greeting ${greeting.type}`,
                            expectedValue: `${greeting.preset ? greeting.preset.name : 'Custom greeting'}`,
                            foundValue: `nothing`
                        }
                    }))
                    continue
                }

                if (greeting.custom && !newAccountGreeting.custom) {
                    this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has an incorrect ${greeting.type} greeting. Expected: ${greeting.preset ? greeting.preset.name : 'Custom greeting'}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: queue.extension.data.name,
                        extensionNumber: queue.extension.data.extensionNumber,
                        objectType: 'Call Queue',
                        issue: {
                            path: `business hours greeting ${greeting.type}`,
                            expectedValue: `${greeting.preset ? greeting.preset.name : 'Custom greeting'}`,
                            foundValue: `nothing`
                        }
                    }))
                }

                if ((greeting.preset && newAccountGreeting.preset) && greeting.preset.name !== newAccountGreeting.preset.name) {
                    this.postMessage(new Message(`Call queue '${queue.extension.data.name}' has an incorrect ${greeting.type} greeting. Expected: ${greeting.preset ? greeting.preset.name : 'Custom greeting'}. Found: ${newAccountGreeting.preset.name}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: queue.extension.data.name,
                        extensionNumber: queue.extension.data.extensionNumber,
                        objectType: 'Call Queue',
                        issue: {
                            path: `business hours greeting ${greeting.type}`,
                            expectedValue: greeting.preset.name,
                            foundValue: newAccountGreeting.preset.name
                        }
                    }))
                }
            }

        }

        return discrepencies
    }

    private compareUsers(originalAccountData: AccountData, newAccountData: AccountData) {
        const discrepencies: AuditDiscrepency[] = []

        for (const user of originalAccountData.users) {
            const newAccountCounterpart = newAccountData.users.find((currentItem) => currentItem.extension.data.name === user.extension.data.name)
            if (!newAccountCounterpart) {
                this.postMessage(new Message(`User '${user.extension.data.name}' was not found in the new account`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: 'extension',
                        expectedValue: user.extension.data.name,
                        foundValue: 'nothing'
                    }
                }))
                continue
            }

            if (user.extension.data.extensionNumber !== newAccountCounterpart.extension.data.extensionNumber) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has a different extension number. Expected: ${user.extension.data.extensionNumber}. Found: ${newAccountCounterpart.extension.data.extensionNumber}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: 'extension number',
                        expectedValue: user.extension.data.extensionNumber,
                        foundValue: newAccountCounterpart.extension.data.extensionNumber
                    }
                }))
            }

            if (user.extension.data.site?.name !== newAccountCounterpart.extension.data.site?.name) {
                this.postMessage(new Message(`User '${user.extension.data.name}' is assigned to a different site. Expected: ${user.extension.data.site?.name}. Found: ${newAccountCounterpart.extension.data.site?.name}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: 'site',
                        expectedValue: user.extension.data.site?.name ?? '',
                        foundValue: newAccountCounterpart.extension.data.site?.name ?? ''
                    }
                }))
            }

            if (user.extension.data.costCenter && user.extension.data.costCenter?.name !== newAccountCounterpart.extension.data.costCenter?.name) {
                this.postMessage(new Message(`User '${user.extension.data.name}' is assigned to a different cost center. Expected: ${user.extension.data.costCenter?.name}. Found: ${newAccountCounterpart.extension.data.costCenter?.name}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: 'cost center',
                        expectedValue: user.extension.data.costCenter?.name ?? '',
                        foundValue: newAccountCounterpart.extension.data.costCenter?.name ?? ''
                    }
                }))
            }

            if (user.extension.data.hidden !== newAccountCounterpart.extension.data.hidden) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has a different hidden status. Expected: ${user.extension.data.hidden}. Found: ${newAccountCounterpart.extension.data.hidden}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: 'hidden status',
                        expectedValue: `${user.extension.data.hidden ? 'Hidden' : 'Not Hidden'}`,
                        foundValue: `${newAccountCounterpart.extension.data.hidden ? 'Hidden' : 'Not Hidden'}`
                    }
                }))
            }

            if (user.extendedData?.directNumbers?.length !== newAccountCounterpart.extendedData?.directNumbers?.length) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has a different number of phone numbers. Expected: ${user.extendedData?.directNumbers?.length}. Found: ${newAccountCounterpart.extendedData?.directNumbers?.length}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: 'direct numbers',
                        expectedValue: `${user.extendedData?.directNumbers?.length}`,
                        foundValue: `${newAccountCounterpart.extendedData?.directNumbers?.length}`
                    }
                }))
            }

            for (const device of user.extendedData?.devices ?? []) {
                const newAccountDevice = newAccountCounterpart.extendedData?.devices.find((currentDevice) => currentDevice.name === device.name && currentDevice.model?.id === device.model?.id)
                if (!newAccountDevice) {
                    this.postMessage(new Message(`User '${user.extension.data.name}' is missing device ${device.name}. Expected: ${device.name}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: user.extension.data.name,
                        extensionNumber: user.extension.data.extensionNumber,
                        objectType: 'User',
                        issue: {
                            path: 'device',
                            expectedValue: `${device.name}`,
                            foundValue: `nothing`
                        }
                    }))
                    continue
                }

                if (device.emergency.location?.name !== newAccountDevice?.emergency.location?.name) {
                    this.postMessage(new Message(`User '${user.extension.data.name}' has a different ERL for device ${device.name}. Expected: ${device.emergency.location?.name}. Found: ${newAccountDevice?.emergency.location?.name}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: user.extension.data.name,
                        extensionNumber: user.extension.data.extensionNumber,
                        objectType: 'User',
                        issue: {
                            path: 'device ERL',
                            expectedValue: `${device.emergency.location?.name}`,
                            foundValue: `${newAccountDevice.emergency.location?.name}`
                        }
                    }))
                }
            }

            if (user.extendedData?.blockedCallSettings?.mode !== newAccountCounterpart.extendedData?.blockedCallSettings?.mode) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has a different blocked call mode. Expected: ${user.extendedData?.blockedCallSettings?.mode}. Found: ${newAccountCounterpart.extendedData?.blockedCallSettings?.mode}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: 'blocked calls mode',
                        expectedValue: `${user.extendedData?.blockedCallSettings?.mode}`,
                        foundValue: `${newAccountCounterpart.extendedData?.blockedCallSettings?.mode}`
                    }
                }))
            }

            if (user.extendedData?.blockedCallSettings?.noCallerId !== newAccountCounterpart.extendedData?.blockedCallSettings?.noCallerId) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has a different blocked call no caller ID setting. Expected: ${user.extendedData?.blockedCallSettings?.noCallerId}. Found: ${newAccountCounterpart.extendedData?.blockedCallSettings?.noCallerId}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: 'blocked calls - no caller ID',
                        expectedValue: `${user.extendedData?.blockedCallSettings?.noCallerId}`,
                        foundValue: `${newAccountCounterpart.extendedData?.blockedCallSettings?.noCallerId}`
                    }
                }))
            }

            if (user.extendedData?.blockedCallSettings?.payPhones !== newAccountCounterpart.extendedData?.blockedCallSettings?.payPhones) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has a different blocked call payphones setting. Expected: ${user.extendedData?.blockedCallSettings?.payPhones}. Found: ${newAccountCounterpart.extendedData?.blockedCallSettings?.payPhones}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: 'blocked calls - payphone',
                        expectedValue: `${user.extendedData?.blockedCallSettings?.payPhones}`,
                        foundValue: `${newAccountCounterpart.extendedData?.blockedCallSettings?.payPhones}`
                    }
                }))
            }

            const newBlockedNumbers = newAccountCounterpart.extendedData?.blockedPhoneNumbers ?? []
            for (const blockedNumber of user.extendedData?.blockedPhoneNumbers ?? []) {
                if (!newBlockedNumbers.includes(blockedNumber)) {
                    this.postMessage(new Message(`User '${user.extension.data.name}' is missing blocked number ${blockedNumber}. Expected: ${blockedNumber}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: user.extension.data.name,
                        extensionNumber: user.extension.data.extensionNumber,
                        objectType: 'User',
                        issue: {
                            path: 'blocked numbers',
                            expectedValue: `${blockedNumber}}`,
                            foundValue: `nothing`
                        }
                    }))
                }
            }

            for (const customRule of user.extendedData?.customRules ?? []) {
                const newAccountRule = newAccountCounterpart.extendedData?.customRules?.find((rule) => rule.name === customRule.name)
                if (!newAccountRule) {
                    this.postMessage(new Message(`User '${user.extension.data.name}' is missing custom rule ${customRule.name}. Expected: ${customRule.name}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: user.extension.data.name,
                        extensionNumber: user.extension.data.extensionNumber,
                        objectType: 'User',
                        issue: {
                            path: 'custom rule',
                            expectedValue: `${customRule.name}`,
                            foundValue: `nothing`
                        }
                    }))
                }
            }

            const newAccountDelegates = newAccountCounterpart.extendedData?.delegates?.map((delegate) => delegate.extension.name)
            for (const delegate of newAccountCounterpart.extendedData?.delegates ?? []) {
                if (!newAccountDelegates?.includes(delegate.extension.name)) {
                    this.postMessage(new Message(`User '${user.extension.data.name}' is missing delegate ${delegate.extension.name}. Expected: ${delegate.extension.name} - Ext. ${delegate.extension.extensionNumber}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: user.extension.data.name,
                        extensionNumber: user.extension.data.extensionNumber,
                        objectType: 'User',
                        issue: {
                            path: 'delegates',
                            expectedValue: `${delegate.extension.name} - Ext. ${delegate.extension.extensionNumber}`,
                            foundValue: `nothing`
                        }
                    }))
                }
            }

            if (user.extendedData?.forwardAllCalls?.enabled !== newAccountCounterpart.extendedData?.forwardAllCalls?.enabled) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has a different forward all calls setting. Expected: ${user.extendedData?.forwardAllCalls?.enabled ? 'Enabled' : 'Disabled'}. Found: ${newAccountCounterpart.extendedData?.forwardAllCalls?.enabled ? 'Enabled' : 'Disabled'}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: 'forward all calls',
                        expectedValue: `${user.extendedData?.forwardAllCalls?.enabled ? 'Enabled' : 'Disabled'}`,
                        foundValue: `${newAccountCounterpart.extendedData?.forwardAllCalls?.enabled ? 'Enabled' : 'Disabled'}`
                    }
                }))
            }

            if (user.extendedData?.incommingCallInfo?.additionalDigits.enabled !== newAccountCounterpart.extendedData?.incommingCallInfo?.additionalDigits.enabled) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has a different incomming calls addition digits setting. Expected: ${user.extendedData?.incommingCallInfo?.additionalDigits.enabled ? 'Enabled' : 'Disabled'}. Found: ${newAccountCounterpart.extendedData?.incommingCallInfo?.additionalDigits.enabled ? 'Enabled' : 'Disabled'}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: 'incomming calls',
                        expectedValue: `${user.extendedData?.incommingCallInfo?.additionalDigits.enabled ? 'Enabled' : 'Disabled'}`,
                        foundValue: `${newAccountCounterpart.extendedData?.incommingCallInfo?.additionalDigits.enabled ? 'Enabled' : 'Disabled'}`
                    }
                }))
            }

            if (user.extendedData?.intercomStatus?.enabled !== newAccountCounterpart.extendedData?.intercomStatus?.enabled) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has a different intercom setting. Expected: ${user.extendedData?.intercomStatus?.enabled ? 'Enabled' : 'Disabled'}. Found: ${newAccountCounterpart.extendedData?.intercomStatus?.enabled ? 'Enabled' : 'Disabled'}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: 'intercom setting',
                        expectedValue: `${user.extendedData?.intercomStatus?.enabled ? 'Enabled' : 'Disabled'}`,
                        foundValue: `${newAccountCounterpart.extendedData?.intercomStatus?.enabled ? 'Enabled' : 'Disabled'}`
                    }
                }))
            }

            const newIntercomUsers = newAccountCounterpart.extendedData?.intercomUsers?.map((user) => user.name)
            for (const intercomUser of user.extendedData?.intercomUsers ?? []) {
                if (!newIntercomUsers?.includes(intercomUser.name)) {
                    this.postMessage(new Message(`User '${user.extension.data.name}' is missing intercom allowed user ${intercomUser.name} - Ext. ${intercomUser.extensionNumber}. Expected: ${intercomUser.name} - Ext. ${intercomUser.extensionNumber}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: user.extension.data.name,
                        extensionNumber: user.extension.data.extensionNumber,
                        objectType: 'User',
                        issue: {
                            path: 'intercom - allowed users',
                            expectedValue: `${intercomUser.name} - Ext. ${intercomUser.extensionNumber}`,
                            foundValue: `nothing`
                        }
                    }))
                }
            }

            const newPerls = newAccountCounterpart.extendedData?.pERLs?.map((perl) => perl.name)
            for (const perl of user.extendedData?.pERLs ?? []) {
                if (!newPerls?.includes(perl.name)) {
                    this.postMessage(new Message(`User '${user.extension.data.name}' is missing personal ERL ${perl.name}. Expected: ${perl.name}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: user.extension.data.name,
                        extensionNumber: user.extension.data.extensionNumber,
                        objectType: 'User',
                        issue: {
                            path: 'personal erl',
                            expectedValue: `${perl.name}`,
                            foundValue: `nothing`
                        }
                    }))
                }
            }

            const newPresenseAllowedUsers = newAccountCounterpart.extendedData?.presenseAllowedUsers?.map((user) => user.extensionName)
            for (const presenseAllowedUser of user.extendedData?.presenseAllowedUsers ?? []) {
                if (!newPresenseAllowedUsers?.includes(presenseAllowedUser.extensionName)) {
                    this.postMessage(new Message(`User '${user.extension.data.name}' is missing presense allowed user ${presenseAllowedUser.extensionName}. Expected: ${presenseAllowedUser.extensionName}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: user.extension.data.name,
                        extensionNumber: user.extension.data.extensionNumber,
                        objectType: 'User',
                        issue: {
                            path: 'presense - allowed user',
                            expectedValue: `${presenseAllowedUser.extensionName}`,
                            foundValue: `nothing`
                        }
                    }))
                }
            }

            const newPresenseLines = newAccountCounterpart.extendedData?.presenseLines?.map((line) => line.id)
            for (const presenseLine of user.extendedData?.presenseLines ?? []) {
                if (!newPresenseLines?.includes(presenseLine.id)) {
                    this.postMessage(new Message(`User '${user.extension.data.name}' is missing presense line ${presenseLine.id}. Expected: Line ${presenseLine.id} - ${presenseLine.extension.extensionName} (Ext. ${presenseLine.extension.extensionNumber}). Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: user.extension.data.name,
                        extensionNumber: user.extension.data.extensionNumber,
                        objectType: 'User',
                        issue: {
                            path: 'presense - line',
                            expectedValue: `Line ${presenseLine.id} - ${presenseLine.extension.extensionName} (Ext. ${presenseLine.extension.extensionNumber})`,
                            foundValue: `nothing`
                        }
                    }))
                }
            }

            if (user.extendedData?.presenseSettings?.allowSeeMyPresence !== newAccountCounterpart.extendedData?.presenseSettings?.allowSeeMyPresence) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has a different allow see my presense setting. Expected: ${user.extendedData?.presenseSettings?.allowSeeMyPresence ? 'Yes' : 'No'} Found: ${newAccountCounterpart.extendedData?.presenseSettings?.allowSeeMyPresence ? 'Yes' : 'No'}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: 'presense - allow see my presense',
                        expectedValue: `${user.extendedData?.presenseSettings?.allowSeeMyPresence ? 'Yes' : 'No'}`,
                        foundValue: `${newAccountCounterpart.extendedData?.presenseSettings?.allowSeeMyPresence ? 'Yes' : 'No'}`
                    }
                }))
            }

            if (user.extendedData?.presenseSettings?.pickUpCallsOnHold !== newAccountCounterpart.extendedData?.presenseSettings?.pickUpCallsOnHold) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has a different pickup calls on hold setting. Expected: ${user.extendedData?.presenseSettings?.pickUpCallsOnHold ? 'Yes' : 'No'} Found: ${newAccountCounterpart.extendedData?.presenseSettings?.pickUpCallsOnHold ? 'Yes' : 'No'}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: 'presense - pickup calls on hold',
                        expectedValue: `${user.extendedData?.presenseSettings?.pickUpCallsOnHold ? 'Yes' : 'No'}`,
                        foundValue: `${newAccountCounterpart.extendedData?.presenseSettings?.pickUpCallsOnHold ? 'Yes' : 'No'}`
                    }
                }))
            }

            const newAccountRoles = newAccountCounterpart.extendedData?.roles?.map((role) => role.displayName)
            for (const role of user.extendedData?.roles ?? []) {
                if (!newAccountRoles?.includes(role.displayName)) {
                    this.postMessage(new Message(`User '${user.extension.data.name}' is not assigned the ${role.displayName} role. Expected: ${role.displayName} Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: user.extension.data.name,
                        extensionNumber: user.extension.data.extensionNumber,
                        objectType: 'User',
                        issue: {
                            path: 'role',
                            expectedValue: `${role.displayName}`,
                            foundValue: `nothing`
                        }
                    }))
                }
            }

            for (const greeting of user.extendedData?.businessHoursCallHandling?.greetings ?? []) {
                const newAccountGreeting = newAccountCounterpart.extendedData?.businessHoursCallHandling?.greetings.find((currentGreeting) => currentGreeting.type === greeting.type)
                if (!newAccountGreeting) {
                    this.postMessage(new Message(`User '${user.extension.data.name}' has an incorrect ${greeting.type} greeting. Expected: ${greeting.preset ? greeting.preset.name : 'Custom greeting'}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: user.extension.data.name,
                        extensionNumber: user.extension.data.extensionNumber,
                        objectType: 'User',
                        issue: {
                            path: `business hours greeting ${greeting.type}`,
                            expectedValue: `${greeting.preset ? greeting.preset.name : 'Custom greeting'}`,
                            foundValue: `nothing`
                        }
                    }))
                    continue
                }

                if (greeting.custom && !newAccountGreeting.custom) {
                    this.postMessage(new Message(`User '${user.extension.data.name}' has an incorrect ${greeting.type} greeting. Expected: ${greeting.preset ? greeting.preset.name : 'Custom greeting'}. Found: nothing`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: user.extension.data.name,
                        extensionNumber: user.extension.data.extensionNumber,
                        objectType: 'User',
                        issue: {
                            path: `business hours greeting ${greeting.type}`,
                            expectedValue: `${greeting.preset ? greeting.preset.name : 'Custom greeting'}`,
                            foundValue: `nothing`
                        }
                    }))
                }

                if ((greeting.preset && newAccountGreeting.preset) && greeting.preset.name !== newAccountGreeting.preset.name) {
                    this.postMessage(new Message(`User '${user.extension.data.name}' has an incorrect ${greeting.type} greeting. Expected: ${greeting.preset ? greeting.preset.name : 'Custom greeting'}. Found: ${newAccountGreeting.preset.name}`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: user.extension.data.name,
                        extensionNumber: user.extension.data.extensionNumber,
                        objectType: 'User',
                        issue: {
                            path: `business hours greeting ${greeting.type}`,
                            expectedValue: greeting.preset.name,
                            foundValue: newAccountGreeting.preset.name
                        }
                    }))
                }
            }

            if (user.extendedData?.businessHoursCallHandling?.callHandlingAction !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.callHandlingAction) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has an incorrect business hours call handling action. Expected: ${user.extendedData?.businessHoursCallHandling?.callHandlingAction} Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.callHandlingAction}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: `business hours call handling action`,
                        expectedValue: user.extendedData?.businessHoursCallHandling?.callHandlingAction ?? '',
                        foundValue: newAccountCounterpart.extendedData?.businessHoursCallHandling?.callHandlingAction ?? ''
                    }
                }))
            }

            if (user.extendedData?.businessHoursCallHandling?.screening !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.screening) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has an incorrect business hours call screening setting. Expected: ${user.extendedData?.businessHoursCallHandling?.screening} Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.screening}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: `business hours call handling action`,
                        expectedValue: user.extendedData?.businessHoursCallHandling?.screening ?? '',
                        foundValue: newAccountCounterpart.extendedData?.businessHoursCallHandling?.screening ?? ''
                    }
                }))
            }

            if ((user.extendedData?.businessHoursCallHandling?.missedCall && newAccountCounterpart.extendedData?.businessHoursCallHandling?.missedCall) && user.extendedData?.businessHoursCallHandling?.missedCall?.actionType !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.missedCall?.actionType) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has an incorrect business hours missed call action. Expected: ${user.extendedData?.businessHoursCallHandling?.missedCall.actionType} Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.missedCall.actionType}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: `business hours missed call action`,
                        expectedValue: user.extendedData?.businessHoursCallHandling?.missedCall.actionType ?? '',
                        foundValue: newAccountCounterpart.extendedData?.businessHoursCallHandling?.missedCall.actionType ?? ''
                    }
                }))
            }

            if (user.extendedData?.businessHoursCallHandling?.forwarding?.ringingMode !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.ringingMode) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has an incorrect business hours ring mode. Expected: ${user.extendedData?.businessHoursCallHandling?.forwarding?.ringingMode} Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.ringingMode}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: `business hours ring mode`,
                        expectedValue: user.extendedData?.businessHoursCallHandling?.forwarding?.ringingMode ?? '',
                        foundValue: newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.ringingMode ?? ''
                    }
                }))
            }

            if (user.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesAlwaysRing !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesAlwaysRing) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has an incorrect business hours softphones always ring setting. Expected: ${user.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesAlwaysRing} Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesAlwaysRing}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: `business hours ring mode`,
                        expectedValue: user.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesAlwaysRing ? 'Yes' : 'No',
                        foundValue: newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesAlwaysRing ? 'Yes' : 'No'
                    }
                }))
            }

            if (user.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesPositionTop !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesPositionTop) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has an incorrect softphone position. Expected: ${user.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesPositionTop} Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesPositionTop}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: `business hours softphone position`,
                        expectedValue: user.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesPositionTop ? 'Yes' : 'No',
                        foundValue: newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesPositionTop ? 'Yes' : 'No'
                    }
                }))
            }

            if (user.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesRingCount !== newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesRingCount) {
                this.postMessage(new Message(`User '${user.extension.data.name}' has an incorrect business hours missed call action. Expected: ${user.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesRingCount} Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesRingCount}`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: user.extension.data.name,
                    extensionNumber: user.extension.data.extensionNumber,
                    objectType: 'User',
                    issue: {
                        path: `business hours softphone ring count`,
                        expectedValue: `${user.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesRingCount}`,
                        foundValue: `${newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.softPhonesRingCount}`
                    }
                }))
            }
            
            const newHandlingRules = newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.rules ?? []
            for (const handlingRule of user.extendedData?.businessHoursCallHandling?.forwarding?.rules ?? []) {
                const matchingRule = newHandlingRules.find((rule) => rule.index === handlingRule.index)
                if (!matchingRule) {
                    this.postMessage(new Message(`User '${user.extension.data.name}' is missing a business hours call handling rule. Expected: ${user.extendedData?.businessHoursCallHandling?.forwarding?.rules.length} rules. Found: ${newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.rules.length} rules`, 'error'))
                    discrepencies.push(new AuditDiscrepency({
                        name: user.extension.data.name,
                        extensionNumber: user.extension.data.extensionNumber,
                        objectType: 'User',
                        issue: {
                            path: `business hours call handling rule`,
                            expectedValue: `${user.extendedData?.businessHoursCallHandling?.forwarding?.rules.length} rules`,
                            foundValue: `${newAccountCounterpart.extendedData?.businessHoursCallHandling?.forwarding?.rules} rules`
                        }
                    }))
                    continue
                }

                const newForwardingNumbers = matchingRule.forwardingNumbers.map((number) => number.label)
                for (const forwardingNumber of handlingRule.forwardingNumbers ?? []) {
                    if (!newForwardingNumbers.includes(forwardingNumber.label)) {
                        this.postMessage(new Message(`User '${user.extension.data.name}' is missing device '${forwardingNumber.label}' in their call handling. Expected: ${forwardingNumber.label} Found: nothing`, 'error'))
                        discrepencies.push(new AuditDiscrepency({
                            name: user.extension.data.name,
                            extensionNumber: user.extension.data.extensionNumber,
                            objectType: 'User',
                            issue: {
                                path: `business hours softphone ring count`,
                                expectedValue: `${forwardingNumber.label}`,
                                foundValue: `nothing`
                            }
                        }))
                    }
                }
            }

        }

        return discrepencies
    }

    private comparePrompts(originalAccountData: AccountData, newAccountData: AccountData) {
        const discrepencies: AuditDiscrepency[] = []

        const newAccountPrompts = newAccountData.prompts.map((prompt) => prompt.filename)
        for (const prompt of originalAccountData.prompts) {
            if (!newAccountPrompts.includes(prompt.filename)) {
                this.postMessage(new Message(`IVR prompt '${prompt.filename}' is missing. Expected: ${prompt.filename} Found: nothing`, 'error'))
                discrepencies.push(new AuditDiscrepency({
                    name: prompt.filename,
                    extensionNumber: 'N/A',
                    objectType: 'IVR Prompt',
                    issue: {
                        path: `ivr prompt`,
                        expectedValue: `${prompt.filename}`,
                        foundValue: `nothing`
                    }
                }))
            }
        }

        return discrepencies
    }
}