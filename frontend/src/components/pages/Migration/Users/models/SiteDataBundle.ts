import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Extension } from "../../../../../models/Extension";
import { BusinessHours, CallHandling, CustomRule, PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class SiteDataBundle implements ExcelFormattable {
    public businessHoursRecpient = ''
    public afterHoursRecipient = ''
    public extensions: Extension[] = []

    constructor(public extension: SiteData, public extendedData?: ExtendedSiteData, public phoneNumberMap?: Map<string, PhoneNumber>) {}

    toExcelRow(): string[] {
        return [
            this.extension.name,
            this.extension.extensionNumber,
            this.extension.code ?? '',
            this.extension.businessAddress.street,
            '', // Street 2 ???
            this.extension.businessAddress.city,
            this.extension.businessAddress.state,
            this.extension.businessAddress.zip,
            this.extension.businessAddress.country,
            this.extension.callerIdName ?? 'Same as main site',
            this.prettyBusinessHours(),
            this.prettyRouting('BusinessHours'),
            this.prettyRouting('AfterHours'),
            this.extension.operator?.name ?? '', // Company fax / SMS recipient. Seems to have been deleted elsewhere. Look into this
            '', // Zero dialing settings
            this.extension.regionalSettings.timezone?.name ?? '',
            this.extension.regionalSettings.formattingLocale?.name ?? '',
            this.extension.regionalSettings.greetingLanguage?.name ?? '',
            this.extension.regionalSettings.homeCountry?.name ?? '',
            this.extension.regionalSettings.language?.name ?? '',
            this.extension.regionalSettings.timeFormat ?? '',
            this.prettyCustomRules()
        ]
    }

    prettyCustomRules() {
        if (!this.extendedData || !this.extendedData.customRules || this.extendedData.customRules.length === 0) return ''

        let result = ''

        for (let index = 0; index < this.extendedData.customRules?.length; index++) {
            const rule = this.extendedData.customRules[index]
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
            const transferExtension = this.extensions.find((ext) => `${ext.data.id}` === `${rule.transfer?.extension.id}`)
            return `Transfer to ${transferExtension?.data.name} - Ext. ${transferExtension?.data.extensionNumber}`
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

    prettyRouting(mode: 'BusinessHours' | 'AfterHours') {
        let extension = ''
        if (mode === 'BusinessHours') {
            extension = this.businessHoursRecpient
        }
        else {
            extension = this.afterHoursRecipient
        }

        return `${extension}`
    }

    prettyBusinessHours() {
        let result = ''

        if (!this.extendedData!.businessHours) return result
        if (Object.keys(this.extendedData!.businessHours.schedule).length === 0) return '24/7'

        const weeklyRanges = this.extendedData!.businessHours.schedule.weeklyRanges
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
}

export interface ExtendedSiteData {
    businessHours: BusinessHours
    businessHoursCallHandling?: CallHandling
    afterHoursCallHandling?: CallHandling
    directNumbers?: PhoneNumber[]
    customRules?: CustomRule[]
}