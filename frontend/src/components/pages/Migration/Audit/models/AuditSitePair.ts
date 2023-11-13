import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { CustomRule } from "../../User Data Download/models/UserDataBundle";
import { SiteDataBundle } from "../../Users/models/SiteDataBundle";

export class AuditSitePair implements ExcelFormattable {
    constructor(private originalSite: SiteDataBundle, private newSite: SiteDataBundle | undefined) {}

    toExcelRow(): string[] {
        return [
            this.originalSite.extension.extensionNumber,
            this.originalSite.extension.name,
            this.newSite?.extension.name ?? '',
            this.originalSite.extension.name === this.newSite?.extension.name ? 'TRUE' : 'FALSE',
            this.originalSite.extension.code ?? '',
            this.newSite?.extension.code ?? '',
            this.originalSite.extension.code === this.newSite?.extension.code ? 'TRUE' : 'FALSE',
            this.originalSite.extension.businessAddress.street,
            this.newSite?.extension.businessAddress.street ?? '',
            this.originalSite.extension.businessAddress.street === this.newSite?.extension.businessAddress.street ? 'TRUE' : 'FALSE',
            '',
            '',
            '',
            this.originalSite.extension.businessAddress.city,
            this.newSite?.extension.businessAddress.city ?? '',
            this.originalSite.extension.businessAddress.city === this.newSite?.extension.businessAddress.city ? 'TRUE' : 'FALSE',
            this.originalSite.extension.businessAddress.state,
            this.newSite?.extension.businessAddress.state ?? '',
            this.originalSite.extension.businessAddress.state === this.newSite?.extension.businessAddress.state ? 'TRUE' : 'FALSE',
            this.originalSite.extension.businessAddress.zip,
            this.newSite?.extension.businessAddress.zip ?? '',
            this.originalSite.extension.businessAddress.zip === this.newSite?.extension.businessAddress.zip ? 'TRUE' : 'FALSE',
            this.originalSite.extension.businessAddress.country,
            this.newSite?.extension.businessAddress.country ?? '',
            this.originalSite.extension.businessAddress.country === this.newSite?.extension.businessAddress.country ? 'TRUE' : 'FALSE',
            this.originalSite.extension.callerIdName,
            this.newSite?.extension.callerIdName ?? '',
            this.originalSite.extension.callerIdName === this.newSite?.extension.callerIdName ? 'TRUE' : 'FALSE',
            this.prettyBusinessHours(this.originalSite.extendedData?.businessHours),
            this.prettyBusinessHours(this.newSite?.extendedData?.businessHours),
            this.prettyBusinessHours(this.originalSite.extendedData?.businessHours) === this.prettyBusinessHours(this.newSite?.extendedData?.businessHours) ? 'TRUE' : 'FALSE',
            this.originalSite.businessHoursRecpient,
            this.newSite?.businessHoursRecpient ?? '',
            this.originalSite.businessHoursRecpient === this.newSite?.businessHoursRecpient ? 'TRUE' : 'FALSE',
            this.originalSite.afterHoursRecipient,
            this.newSite?.afterHoursRecipient ?? '',
            this.originalSite.afterHoursRecipient === this.newSite?.afterHoursRecipient ? 'TRUE' : 'FALSE',
            '', // Company SMS / Fax Recipient
            '', // Company SMS / Fax Recipient
            '', // Company SMS / Fax Recipient
            '', // Zero-dialing settings
            '', // Zero-dialing settings
            '', // Zero-dialing settings
            this.originalSite.extension.regionalSettings.timezone?.name ?? '',
            this.newSite?.extension.regionalSettings.timezone?.name ?? '',
            this.originalSite.extension.regionalSettings.timezone?.name === this.newSite?.extension.regionalSettings.timezone?.name ? 'TRUE' : 'FALSE',
            this.originalSite.extendedData?.customRules?.map((rule) => rule.name).sort().join('\n') ?? '',
            this.newSite?.extendedData?.customRules?.map((rule) => rule.name).sort().join('\n') ?? '',
            this.originalSite.extendedData?.customRules?.map((rule) => rule.name).sort().join('\n') === this.newSite?.extendedData?.customRules?.map((rule) => rule.name).sort().join('\n') ? 'TRUE' : 'FALSE',
        ]
    }

    prettyBusinessHours(businessHours: any) {
        let result = ''

        if (!businessHours) return result
        if (Object.keys(businessHours.schedule).length === 0) return '24/7'

        const weeklyRanges = businessHours.schedule.weeklyRanges
        if (weeklyRanges.sunday) {
            result += `Sunday: ${this.convertTo12HourTime(weeklyRanges.sunday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.sunday[0].to)}\n`
        }
        if (weeklyRanges.monday) {
            result += `Monday: ${this.convertTo12HourTime(weeklyRanges.monday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.monday[0].to)}\n`
        }
        if (weeklyRanges.tuesday) {
            result += `Tuesday: ${this.convertTo12HourTime(weeklyRanges.tuesday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.tuesday[0].to)}\n`
        }
        if (weeklyRanges.wednesday) {
            result += `Wednesday: ${this.convertTo12HourTime(weeklyRanges.wednesday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.wednesday[0].to)}\n`
        }
        if (weeklyRanges.thursday) {
            result += `Thursday: ${this.convertTo12HourTime(weeklyRanges.thursday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.thursday[0].to)}\n`
        }
        if (weeklyRanges.friday) {
            result += `Friday: ${this.convertTo12HourTime(weeklyRanges.friday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.friday[0].to)}\n`
        }
        if (weeklyRanges.saturday) {
            result += `Saturday: ${this.convertTo12HourTime(weeklyRanges.saturday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.saturday[0].to)}\n`
        }
        return result
    }

    convertTo12HourTime(time: string) {
        const hour = parseInt(time.split(':')[0])
        const minute = time.split(':')[1]
        if (hour === 0) return `12:${minute} AM`
        if (hour === 12) return `12:${minute} PM`
        if (hour < 12) return `${hour}:${minute} AM`
        return `${hour - 12}:${minute} PM`
    }

    prettyCustomRules(customRules: CustomRule[] | undefined) {
        if (!customRules || customRules.length === 0) return ''

        let result = ''

        for (let index = 0; index < customRules?.length; index++) {
            const rule = customRules[index]
            result += `Name: ${rule.name}\n\n`
            result += `Enabled: ${rule.enabled ? 'Yes' : 'No'}\n\n`

            if (rule.schedule) {
                result += 'Schedule:\n'
                result += `${this.prettyRuleHours(rule)}\n`
            }
            
            if (rule.calledNumbers) {
                result += 'Called Numbers:\n'
                for (const calledNumber of rule.calledNumbers) {
                    result += `${calledNumber.phoneNumber}\n`
                }
                result += '\n'
            }

            if (rule.callers) {
                result += 'Callers:\n'
                for (const caller of rule.callers) {
                    result += `${caller.name ?? ''} - ${caller.callerId}\n`
                }
                result += '\n'
            }

            result += 'Action:\n'
            result += `${this.prettyRuleAction(rule)}\n\n`

            result += '-----------------\n\n'
        }

        return result
    }

    prettyRuleAction(rule: CustomRule) {
        if (rule.callHandlingAction === 'UnconditionalForwarding' && rule.unconditionalForwarding) {
            return `Transfer to ${rule.unconditionalForwarding.phoneNumber}`
        }
        else if (rule.callHandlingAction === 'TransferToExtension' && rule.transfer) {
            // const transferExtension = this.extensions.find((ext) => `${ext.data.id}` === `${rule.transfer?.extension.id}`)
            // return `Transfer to ${transferExtension?.data.name} - Ext. ${transferExtension?.data.extensionNumber}`
            return `Transfer to ${rule.transfer.extension.id}`
        }
        else if (rule.callHandlingAction === 'TakeMessagesOnly' && rule.voicemail) {
            return `Send to Voicemail`
        }
        else if (rule.callHandlingAction) {
            return `Play Announcement`
        }

        return ''
    }

    prettyRuleHours(rule: CustomRule) {
        let result = ''

        if (!rule.schedule) return result
        if (rule.schedule.ref) return `${rule.schedule.ref}\n`
        if (Object.keys(rule.schedule).length === 0) return '24/7\n'

        if (rule.schedule.weeklyRanges) {
            const weeklyRanges = rule.schedule.weeklyRanges
            if (weeklyRanges.sunday) {
                result += `Sunday: ${this.convertTo12HourTime(weeklyRanges.sunday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.sunday[0].to)}\n`
            }
            if (weeklyRanges.monday) {
                result += `Monday: ${this.convertTo12HourTime(weeklyRanges.monday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.monday[0].to)}\n`
            }
            if (weeklyRanges.tuesday) {
                result += `Tuesday: ${this.convertTo12HourTime(weeklyRanges.tuesday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.tuesday[0].to)}\n`
            }
            if (weeklyRanges.wednesday) {
                result += `Wednesday: ${this.convertTo12HourTime(weeklyRanges.wednesday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.wednesday[0].to)}\n`
            }
            if (weeklyRanges.thursday) {
                result += `Thursday: ${this.convertTo12HourTime(weeklyRanges.thursday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.thursday[0].to)}\n`
            }
            if (weeklyRanges.friday) {
                result += `Friday: ${this.convertTo12HourTime(weeklyRanges.friday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.friday[0].to)}\n`
            }
            if (weeklyRanges.saturday) {
                result += `Saturday: ${this.convertTo12HourTime(weeklyRanges.saturday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.saturday[0].to)}\n`
            }
        }
        else if (rule.schedule.ranges) {
            result += '(Shown in GMT timezone)\n'
            for (const range of rule.schedule.ranges) {
                result += `${range.from} - ${range.to}\n`
            }
        }

        return result
    }

}