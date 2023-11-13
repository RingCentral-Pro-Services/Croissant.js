import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { LimitedExtensionDataBundle } from "../../Users/models/LimitedExtensionDataBundle";

export class AuditLePair implements ExcelFormattable {
    constructor(private originalLeBundle: LimitedExtensionDataBundle, private newLeBundle: LimitedExtensionDataBundle | undefined) {
        if (newLeBundle && newLeBundle.extension.data.contact.email.includes('.ps.ringcentral.com')) {
            newLeBundle.extension.data.contact.email = newLeBundle.extension.data.contact.email.replace('.ps.ringcentral.com', '')
        }

        if (newLeBundle && newLeBundle.extendedData?.devices && newLeBundle.extendedData.devices.length > 0 && newLeBundle.extendedData.devices[0].serial.startsWith('N')) {
            newLeBundle.extendedData.devices[0].serial = newLeBundle.extendedData.devices[0].serial.substring(1)
        }
    }

    toExcelRow(): string[] {
        return [
            this.originalLeBundle.extension.data.extensionNumber,
            this.newLeBundle?.extension.data.extensionNumber ?? '',
            this.originalLeBundle.extension.data.name,
            this.newLeBundle?.extension.data.name ?? '',
            this.originalLeBundle.extension.data.name === this.newLeBundle?.extension.data.name ? 'TRUE' : 'FALSE',
            '', // Last name
            '', // Last name
            'TRUE', // Last name
            this.originalLeBundle.extension.data.contact.email,
            this.newLeBundle?.extension.data.contact.email ?? '',
            this.originalLeBundle.extension.data.contact.email === this.newLeBundle?.extension.data.contact.email ? 'TRUE' : 'FALSE',
            this.originalLeBundle.extension.data.site?.name ?? '',
            this.newLeBundle?.extension.data.site?.name ?? '',
            this.originalLeBundle.extension.data.site?.name === this.newLeBundle?.extension.data.site?.name ? 'TRUE' : 'FALSE',
            this.originalLeBundle.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].phoneLines[0].phoneInfo.phoneNumber : '',
            this.newLeBundle?.extendedData?.devices ? this.newLeBundle.extendedData.devices[0].phoneLines[0].phoneInfo.phoneNumber : '',
            this.originalLeBundle.extendedData?.devices && this.newLeBundle?.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].phoneLines[0].phoneInfo.phoneNumber === this.newLeBundle.extendedData.devices[0].phoneLines[0].phoneInfo.phoneNumber ? 'TRUE' : 'FALSE' : 'FALSE',
            this.originalLeBundle.extendedData?.directNumbers?.map((n) => n.phoneNumber).join('\n') ?? '',
            this.newLeBundle?.extendedData?.directNumbers?.map((n) => n.phoneNumber).join('\n') ?? '',
            this.originalLeBundle.extendedData?.directNumbers && this.newLeBundle?.extendedData?.directNumbers ? this.originalLeBundle.extendedData.directNumbers.map((n) => n.phoneNumber).join('\n') === this.newLeBundle.extendedData.directNumbers.map((n) => n.phoneNumber).join('\n') ? 'TRUE' : 'FALSE' : 'FALSE',
            this.originalLeBundle.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].type : '',
            this.newLeBundle?.extendedData?.devices ? this.newLeBundle.extendedData.devices[0].type : '',
            this.originalLeBundle.extendedData?.devices && this.newLeBundle?.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].type === this.newLeBundle.extendedData.devices[0].type ? 'TRUE' : 'FALSE' : 'FALSE',
            this.originalLeBundle.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].model?.name : '',
            this.newLeBundle?.extendedData?.devices ? this.newLeBundle.extendedData.devices[0].model?.name : '',
            this.originalLeBundle.extendedData?.devices && this.newLeBundle?.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].model?.name === this.newLeBundle.extendedData.devices[0].model?.name ? 'TRUE' : 'FALSE' : 'FALSE',
            this.originalLeBundle.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].serial : '',
            this.newLeBundle?.extendedData?.devices ? this.newLeBundle.extendedData.devices[0].serial : '',
            this.originalLeBundle.extendedData?.devices && this.newLeBundle?.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].serial === this.newLeBundle.extendedData.devices[0].serial ? 'TRUE' : 'FALSE' : 'FALSE',
            this.originalLeBundle.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].emergencyServiceAddress?.customerName : '',
            this.newLeBundle?.extendedData?.devices ? this.newLeBundle.extendedData.devices[0].emergencyServiceAddress?.customerName : '',
            this.originalLeBundle.extendedData?.devices && this.newLeBundle?.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].emergencyServiceAddress?.customerName === this.newLeBundle.extendedData.devices[0].emergencyServiceAddress?.customerName ? 'TRUE' : 'FALSE' : 'FALSE',
            this.originalLeBundle.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].emergencyServiceAddress?.street : '',
            this.newLeBundle?.extendedData?.devices ? this.newLeBundle.extendedData.devices[0].emergencyServiceAddress?.street : '',
            this.originalLeBundle.extendedData?.devices && this.newLeBundle?.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].emergencyServiceAddress?.street === this.newLeBundle.extendedData.devices[0].emergencyServiceAddress?.street ? 'TRUE' : 'FALSE' : 'FALSE',
            this.originalLeBundle.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].emergencyServiceAddress?.street2 : '',
            this.newLeBundle?.extendedData?.devices ? this.newLeBundle.extendedData.devices[0].emergencyServiceAddress?.street2 : '',
            this.originalLeBundle.extendedData?.devices && this.newLeBundle?.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].emergencyServiceAddress?.street2 === this.newLeBundle.extendedData.devices[0].emergencyServiceAddress?.street2 ? 'TRUE' : 'FALSE' : 'FALSE',
            this.originalLeBundle.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].emergencyServiceAddress?.city : '',
            this.newLeBundle?.extendedData?.devices ? this.newLeBundle.extendedData.devices[0].emergencyServiceAddress?.city : '',
            this.originalLeBundle.extendedData?.devices && this.newLeBundle?.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].emergencyServiceAddress?.city === this.newLeBundle.extendedData.devices[0].emergencyServiceAddress?.city ? 'TRUE' : 'FALSE' : 'FALSE',
            this.originalLeBundle.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].emergencyServiceAddress?.state : '',
            this.newLeBundle?.extendedData?.devices ? this.newLeBundle.extendedData.devices[0].emergencyServiceAddress?.state : '',
            this.originalLeBundle.extendedData?.devices && this.newLeBundle?.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].emergencyServiceAddress?.state === this.newLeBundle.extendedData.devices[0].emergencyServiceAddress?.state ? 'TRUE' : 'FALSE' : 'FALSE',
            this.originalLeBundle.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].emergencyServiceAddress?.zip : '',
            this.newLeBundle?.extendedData?.devices ? this.newLeBundle.extendedData.devices[0].emergencyServiceAddress?.zip : '',
            this.originalLeBundle.extendedData?.devices && this.newLeBundle?.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].emergencyServiceAddress?.zip === this.newLeBundle.extendedData.devices[0].emergencyServiceAddress?.zip ? 'TRUE' : 'FALSE' : 'FALSE',
            this.originalLeBundle.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].emergencyServiceAddress?.country : '',
            this.newLeBundle?.extendedData?.devices ? this.newLeBundle.extendedData.devices[0].emergencyServiceAddress?.country : '',
            this.originalLeBundle.extendedData?.devices && this.newLeBundle?.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].emergencyServiceAddress?.country === this.newLeBundle.extendedData.devices[0].emergencyServiceAddress?.country ? 'TRUE' : 'FALSE' : 'FALSE',

            '', // Default area code
            '', // Default area code
            'TRUE', // Default area code

            // Device name
            this.originalLeBundle.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].name : '',
            this.newLeBundle?.extendedData?.devices ? this.newLeBundle.extendedData.devices[0].name : '',
            this.originalLeBundle.extendedData?.devices && this.newLeBundle?.extendedData?.devices ? this.originalLeBundle.extendedData.devices[0].name === this.newLeBundle.extendedData.devices[0].name ? 'TRUE' : 'FALSE' : 'FALSE',

            '', // Device lock status
            '', // Device lock status
            'TRUE', // Device lock status

            '', // WMI
            '', // WMI
            'TRUE', // WMI

            // Regional settings
            this.originalLeBundle.extension.data.regionalSettings?.timezone?.name ?? '',
            this.newLeBundle?.extension.data.regionalSettings?.timezone?.name ?? '',
            this.originalLeBundle.extension.data.regionalSettings?.timezone?.name === this.newLeBundle?.extension.data.regionalSettings?.timezone?.name ? 'TRUE' : 'FALSE',

            // Formatting locale    
            this.originalLeBundle.extension.data.regionalSettings?.formattingLocale.name ?? '',
            this.newLeBundle?.extension.data.regionalSettings?.formattingLocale.name ?? '',
            this.originalLeBundle.extension.data.regionalSettings?.formattingLocale.name === this.newLeBundle?.extension.data.regionalSettings?.formattingLocale.name ? 'TRUE' : 'FALSE',

            // Language
            this.originalLeBundle.extension.data.regionalSettings?.language.name ?? '',
            this.newLeBundle?.extension.data.regionalSettings?.language.name ?? '',
            this.originalLeBundle.extension.data.regionalSettings?.language.name === this.newLeBundle?.extension.data.regionalSettings?.language.name ? 'TRUE' : 'FALSE',

            // Time format
            this.originalLeBundle.extension.data.regionalSettings?.timeFormat ?? '',
            this.newLeBundle?.extension.data.regionalSettings?.timeFormat ?? '',
            this.originalLeBundle.extension.data.regionalSettings?.timeFormat === this.newLeBundle?.extension.data.regionalSettings?.timeFormat ? 'TRUE' : 'FALSE',

            '', // International calling
            '', // International calling
            'TRUE', // International calling

            // Unavailable greeting
            this.prettyGreeting(this.originalLeBundle, 'Unavailable'),
            this.prettyGreeting(this.newLeBundle, 'Unavailable'),
            this.prettyGreeting(this.originalLeBundle, 'Unavailable') === this.prettyGreeting(this.newLeBundle, 'Unavailable') ? 'TRUE' : 'FALSE',

            // Hold music greeting
            this.prettyGreeting(this.originalLeBundle, 'HoldMusic'),
            this.prettyGreeting(this.newLeBundle, 'HoldMusic'),
            this.prettyGreeting(this.originalLeBundle, 'HoldMusic') === this.prettyGreeting(this.newLeBundle, 'HoldMusic') ? 'TRUE' : 'FALSE',

            // PERLs
            this.originalLeBundle.extendedData?.pERLs ? this.originalLeBundle.extendedData.pERLs.map((p) => p.name).join('\n') : '',
            this.newLeBundle?.extendedData?.pERLs ? this.newLeBundle.extendedData.pERLs.map((p) => p.name).join('\n') : '',
            this.originalLeBundle.extendedData?.pERLs && this.newLeBundle?.extendedData?.pERLs ? this.originalLeBundle.extendedData.pERLs.map((p) => p.name).join('\n') === this.newLeBundle.extendedData.pERLs.map((p) => p.name).join('\n') ? 'TRUE' : 'FALSE' : 'FALSE',

            // Device caller ID
            this.prettyDeviceCallerID(this.originalLeBundle),
            this.prettyDeviceCallerID(this.newLeBundle),
            this.prettyDeviceCallerID(this.originalLeBundle) === this.prettyDeviceCallerID(this.newLeBundle) ? 'TRUE' : 'FALSE',

            // Common phone caller ID
            this.prettyCommonAreaCallerID(this.originalLeBundle),
            this.prettyCommonAreaCallerID(this.newLeBundle),
            this.prettyCommonAreaCallerID(this.originalLeBundle) === this.prettyCommonAreaCallerID(this.newLeBundle) ? 'TRUE' : 'FALSE',

            // Cost center
            this.originalLeBundle.extension.data.costCenter?.name ?? '',
            this.newLeBundle?.extension.data.costCenter?.name ?? '',
            this.originalLeBundle.extension.data.costCenter?.name === this.newLeBundle?.extension.data.costCenter?.name ? 'TRUE' : 'FALSE',
        ]
    }

    prettyGreeting(bundle: LimitedExtensionDataBundle | undefined, greetingType: string) {
        if (!bundle) return ''
        const unavailableGreeting = bundle.extendedData?.businessHoursCallHandling?.greetings.find((greeting) => greeting.type === greetingType)
        if (!unavailableGreeting) return ''
        if (unavailableGreeting.custom) return 'Custom'
        return 'Default'
    }

    prettyDeviceCallerID(bundle: LimitedExtensionDataBundle | undefined) {
        if (!bundle) return ''
        if (!bundle.extendedData?.callerID || bundle.extendedData.callerID.byDevice.length === 0) return ''

        const deviceCallerID = bundle.extendedData.callerID.byDevice[0]
        if (!deviceCallerID.callerId || !deviceCallerID.callerId.phoneInfo) return 'Not Set'
        return deviceCallerID.callerId.phoneInfo.phoneNumber
    }

    prettyCommonAreaCallerID(bundle: LimitedExtensionDataBundle | undefined) {
        if (!bundle) return ''
        if (!bundle.extendedData?.callerID || bundle.extendedData.callerID.byFeature.length === 0) return ''

        const commonCallerID = bundle.extendedData.callerID.byFeature.find((callerID) => callerID.feature === '')
        if (!commonCallerID || !commonCallerID.callerId || !commonCallerID.callerId.phoneInfo) return 'Not Set'
        return commonCallerID.callerId.phoneInfo.phoneNumber
    }

}