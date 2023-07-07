import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Extension } from "../../../../../models/Extension";
import { BusinessHours, CallHandling, CustomRule, PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class SiteDataBundle implements ExcelFormattable {
    public businessHoursRecpient = ''
    public afterHoursRecipient = ''

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
            this.extension.callerIdName,
            this.prettyBusinessHours(),
            this.prettyRouting('BusinessHours'),
            this.prettyRouting('AfterHours'),
            this.extension.operator?.name ?? '', // Company fax / SMS recipient. Seems to have been deleted elsewhere. Look into this
            '', // Zero dialing settings
            this.extension.regionalSettings.timezone?.name ?? ''
        ]
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