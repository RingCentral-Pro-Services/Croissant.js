import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Extension } from "../../../../../models/Extension";
import { BlockedCallSettings, BlockedPhoneNumber, CallerID, CallHandling, Delegate, Device, IntercomStatus, Notifications, PresenseAllowedUser, PresenseLine, PresenseSettings } from "./UserDataBundle";

export class UserDataRow implements ExcelFormattable {
    constructor(public extension: Extension, public device: Device, 
                public businessHoursCallHandling?: CallHandling, public afterHoursCallHandling?: CallHandling,
                public notifications?: Notifications, public callerID?: CallerID, public blockedCallSettings?: BlockedCallSettings,
                public blockedPhoneNumbers?: BlockedPhoneNumber[], public presenseLines?: PresenseLine[], public presenseSettings?: PresenseSettings,
                public presenseAllowedUsers?: PresenseAllowedUser[], public intercomStatus?: IntercomStatus, public delegates?: Delegate[]) {}

    toExcelRow(): string[] {
        console.log('Device')
        console.log(this.device)
        return [
            '', // Initial upon completion
            '', // User type
            this.extension.data.extensionNumber,
            '', // Temporary extension
            this.extension.data.contact.firstName,
            this.extension.data.contact.lastName ?? '',
            this.extension.data.contact.email,
            this.extension.data.contact.department ?? '',
            this.extension.data.contact.jobTitle ?? '',
            '', // User groups
            '', // Contact phone
            this.extension.data.contact.mobilePhone ?? '',
            this.extension.data.regionalSettings?.formattingLocale.name ?? '',
            this.extension.data.regionalSettings?.formattingLocale.name ?? '',
            this.extension.data.regionalSettings?.language.name ?? '',
            this.extension.data.regionalSettings?.timeFormat ?? '',
            '', // User hours
            this.extension.data.roles?.at(0)?.displayName ?? '',
            this.extension.data.hidden ? 'ON' : 'OFF',
            '', // Receive RC communications
            '', // Send email when phone added
            this.extension.data.site?.name ?? '',
            this.device.phoneLines[0].phoneInfo.phoneNumber, // Phone number
            '', // Temp number
            this.device.model?.name ?? 'RingCentral Phone App',
            this.device.serial,
            this.device.name,
            '', // Default area code
            this.device.emergencyServiceAddress?.customerName ?? '',
            this.device.emergencyServiceAddress?.street ?? '',
            this.device.emergencyServiceAddress?.street2 ?? '',
            this.device.emergencyServiceAddress?.city ?? '',
            this.device.emergencyServiceAddress?.stateName ?? '',
            this.device.emergencyServiceAddress?.zip ?? '',
            this.device.emergencyServiceAddress?.countryName ?? '',
            '', // Device locked?
            '', // WMI
            this.prettyPresenseLines(),
            this.presenseSettings?.ringOnMonitoredCall === true ? 'ON' : 'OFF',
            this.presenseSettings?.pickUpCallsOnHold === true ? 'ON' : 'OFF',
            this.presenseSettings?.allowSeeMyPresence === true ? 'ON' : 'OFF',
            this.prettyPresenseUsers(),
            this.intercomStatus?.enabled ? 'ON' : 'OFF',
            this.prettyDelegates(),
            '', // PMI
            this.greeting('Introductory'),
            this.businessHoursCallHandling?.screening ?? '',
            this.greeting('ConnectingMessage'),
            this.greeting('HoldMusic'),
        ]
    }

    greeting(name: string) {
        for (const greeting of this.businessHoursCallHandling?.greetings ?? []) {
            if (greeting.type === name) {
                if ('preset' in greeting) {
                    return greeting.preset.name    
                }
                else {
                    return 'Custom'
                }
            }
        }
        return ''
    }

    prettyPresenseLines() {
        if (!this.presenseLines) return ''

        let result = ''

        for (const line of this.presenseLines) {
            result += `Line ${line.id} - ${line.extension.extensionName}\n`
        }

        return result
    }

    prettyPresenseUsers() {
        if (!this.presenseAllowedUsers) return ''

        let result = ''

        for (const line of this.presenseAllowedUsers) {
            result += `${line.extensionName} - ${line.extensionNumber}\n`
        }

        return result
    }

    prettyDelegates() {
        if (!this.delegates) return ''

        let result = ''

        for (const delegate of this.delegates) {
            result += `${delegate.extension.name} - ${delegate.extension.extensionNumber}\n`
        }

        return result
    }
}