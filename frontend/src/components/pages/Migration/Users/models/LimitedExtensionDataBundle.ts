import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Extension } from "../../../../../models/Extension";
import { CallerID, CallHandling, Device, PERL, PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class LimitedExtensionDataBundle implements ExcelFormattable {
    public hasEncounteredFatalError = false
    
    constructor(public extension: Extension, public extendedData?: LEExtendedData, public phoneNumberMap?: Map<string, PhoneNumber>) {}

    toExcelRow(): string[] {
        return [
            '', // Initial on completion. Ignored.
            this.extension.data.extensionNumber,
            '', // Temporary extension. Ignored.
            this.extension.data.name,
            '', // Last name. Ignored.
            this.extension.data.contact.email,
            this.extension.data.site?.name ?? '',
            this.extendedData?.devices![0].phoneLines[0].phoneInfo.phoneNumber ?? '',
            '', // Tenporary number. Ignored
            this.extendedData!.directNumbers!.map((number) => number.phoneNumber).join(', ') ?? '',
            '', // Additional temp DIDs
            this.prettyDeviceType(),
            this.extendedData!.devices![0].model ? this.extendedData!.devices![0].model.name : '',
            this.extendedData!.devices![0].serial ?? '',
            this.extendedData!.devices![0].emergency.address?.customerName ?? '',
            this.extendedData!.devices![0].emergency.address?.street ?? '',
            this.extendedData!.devices![0].emergency.address?.street2 ?? '', 
            this.extendedData!.devices![0].emergency.address?.city ?? '', 
            this.extendedData!.devices![0].emergency.address?.state ?? '', 
            this.extendedData!.devices![0].emergency.address?.zip ?? '', 
            this.extendedData!.devices![0].emergency.address?.country ?? '', 
            '', // Default area code. Ignored
            this.extendedData!.devices![0].name,
            '', // Locked. Ignored
            '', // WMI. Ignored
            this.extension.data.regionalSettings?.timezone.description ?? '',
            this.extension.data.regionalSettings?.formattingLocale.name ?? '',
            this.extension.data.regionalSettings?.language.name ?? '',
            this.extension.data.regionalSettings?.timeFormat ?? '',
            '', // International calling. Ignored
            this.prettyGreeting('Unavailable'),
            this.prettyGreeting('HoldMusic'),
            this.prettyPERLs(),
            this.prettyDeviceCallerID(), // Device caller ID
            this.prettyCommonAreaCallerID(), // Common phone caller ID
            this.extension.data.costCenter?.name ?? ''
        ]
    }

    prettyDeviceType() {
        if (!this.extendedData?.devices || !this.extendedData.devices[0].useAsCommonPhone) return 'LE'
        return 'LE + Hot Desk'
    }

    prettyGreeting(greetingType: string) {
        const unavailableGreeting = this.extendedData?.businessHoursCallHandling?.greetings.find((greeting) => greeting.type === greetingType)
        if (!unavailableGreeting) return ''
        if (unavailableGreeting.custom) return 'Custom'
        return 'Default'
    }

    prettyPERLs() {
        let result = ''

        if (!this.extendedData?.pERLs) return result

        for (const erl of this.extendedData.pERLs) {
            result += `${erl.name} -----------\n`
            result += `${erl.address.customerName}\n`
            result += `${erl.address.street}\n`
            if (erl.address.street2) {
                result += `${erl.address.street2}\n`
            }
            result += `${erl.address.city}\n`
            result += `${erl.address.country}\n`
            result += `${erl.address.zip}\n\n`
        }
        
        return result
    }

    prettyDeviceCallerID() {
        if (!this.extendedData?.callerID || this.extendedData.callerID.byDevice.length === 0) return ''

        const deviceCallerID = this.extendedData.callerID.byDevice[0]
        if (!deviceCallerID.callerId || !deviceCallerID.callerId.phoneInfo) return 'Not Set'
        return deviceCallerID.callerId.phoneInfo.phoneNumber
    }

    prettyCommonAreaCallerID() {
        if (!this.extendedData?.callerID || this.extendedData.callerID.byFeature.length === 0) return ''

        const commonCallerID = this.extendedData.callerID.byFeature.find((callerID) => callerID.feature === '')
        if (!commonCallerID || !commonCallerID.callerId || !commonCallerID.callerId.phoneInfo) return 'Not Set'
        return commonCallerID.callerId.phoneInfo.phoneNumber
    }
}

export interface LEExtendedData {
    directNumbers?: PhoneNumber[]
    devices?: Device[]
    businessHoursCallHandling?: CallHandling
    pERLs?: PERL[]
    callerID?: CallerID
}