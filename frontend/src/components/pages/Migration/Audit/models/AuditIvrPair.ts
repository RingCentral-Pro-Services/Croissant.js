import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { IVRDataBundle } from "../../Users/models/IVRDataBundle";

export class AuditIvrPair implements ExcelFormattable {
    constructor(private originalIvr: IVRDataBundle, private newIvr: IVRDataBundle | undefined) {}

    toExcelRow(): string[] {
        return [
            this.originalIvr.extension.data.extensionNumber,
            this.newIvr?.extension.data.extensionNumber ?? '',

            // Name
            this.originalIvr.extension.data.name,
            this.newIvr?.extension.data.name ?? '',
            this.originalIvr.extension.data.name == this.newIvr?.extension.data.name ? 'TRUE' : 'FALSE',

            // Site
            this.originalIvr.extension.data.site?.name ?? '',
            this.newIvr?.extension.data.site?.name ?? '',
            this.originalIvr.extension.data.site?.name == this.newIvr?.extension.data.site?.name ? 'TRUE' : 'FALSE',

            // Phone numbers
            this.originalIvr.extendedData?.directNumbers?.map((n) => n.phoneNumber).join(', ') ?? '',
            this.newIvr?.extendedData?.directNumbers?.map((n) => n.phoneNumber).join(', ') ?? '',
            this.originalIvr.extendedData?.directNumbers?.map((n) => n.phoneNumber).join(', ') == this.newIvr?.extendedData?.directNumbers?.join(', ') ? 'TRUE' : 'FALSE',

            // Language
            this.originalIvr.extension.data.regionalSettings?.language.name ?? '',
            this.newIvr?.extension.data.regionalSettings?.language.name ?? '',
            this.originalIvr.extension.data.regionalSettings?.language.name == this.newIvr?.extension.data.regionalSettings?.language.name ? 'TRUE' : 'FALSE',

            // Prompt mode
            this.originalIvr.extendedData?.ivrData?.prompt?.mode ?? '',
            this.newIvr?.extendedData?.ivrData?.prompt?.mode ?? '',
            this.originalIvr.extendedData?.ivrData?.prompt?.mode == this.newIvr?.extendedData?.ivrData?.prompt?.mode ? 'TRUE' : 'FALSE',

            // Prompt script
            this.originalIvr.extendedData?.ivrData?.prompt?.audio?.displayName ?? '',
            this.newIvr?.extendedData?.ivrData?.prompt?.audio?.displayName ?? '',
            this.originalIvr.extendedData?.ivrData?.prompt?.audio?.displayName == this.newIvr?.extendedData?.ivrData?.prompt?.audio?.displayName ? 'TRUE' : 'FALSE',

            this.getActionForKey('1', this.originalIvr),
            this.getActionForKey('1', this.newIvr),
            this.getActionForKey('1', this.originalIvr) == this.getActionForKey('1', this.newIvr) ? 'TRUE' : 'FALSE',

            this.getActionForKey('2', this.originalIvr),
            this.getActionForKey('2', this.newIvr),
            this.getActionForKey('2', this.originalIvr) == this.getActionForKey('2', this.newIvr) ? 'TRUE' : 'FALSE',

            this.getActionForKey('3', this.originalIvr),
            this.getActionForKey('3', this.newIvr),
            this.getActionForKey('3', this.originalIvr) == this.getActionForKey('3', this.newIvr) ? 'TRUE' : 'FALSE',

            this.getActionForKey('4', this.originalIvr),
            this.getActionForKey('4', this.newIvr),
            this.getActionForKey('4', this.originalIvr) == this.getActionForKey('4', this.newIvr) ? 'TRUE' : 'FALSE',

            this.getActionForKey('5', this.originalIvr),
            this.getActionForKey('5', this.newIvr),
            this.getActionForKey('5', this.originalIvr) == this.getActionForKey('5', this.newIvr) ? 'TRUE' : 'FALSE',

            this.getActionForKey('6', this.originalIvr),
            this.getActionForKey('6', this.newIvr),
            this.getActionForKey('6', this.originalIvr) == this.getActionForKey('6', this.newIvr) ? 'TRUE' : 'FALSE',

            this.getActionForKey('7', this.originalIvr),
            this.getActionForKey('7', this.newIvr),
            this.getActionForKey('7', this.originalIvr) == this.getActionForKey('7', this.newIvr) ? 'TRUE' : 'FALSE',

            this.getActionForKey('8', this.originalIvr),
            this.getActionForKey('8', this.newIvr),
            this.getActionForKey('8', this.originalIvr) == this.getActionForKey('8', this.newIvr) ? 'TRUE' : 'FALSE',

            this.getActionForKey('9', this.originalIvr),
            this.getActionForKey('9', this.newIvr),
            this.getActionForKey('9', this.originalIvr) == this.getActionForKey('9', this.newIvr) ? 'TRUE' : 'FALSE',

            this.getActionForKey('0', this.originalIvr),
            this.getActionForKey('0', this.newIvr),
            this.getActionForKey('0', this.originalIvr) == this.getActionForKey('9', this.newIvr) ? 'TRUE' : 'FALSE',

            this.getActionForKey('Star', this.originalIvr),
            this.getActionForKey('Star', this.newIvr),
            this.getActionForKey('Star', this.originalIvr) == this.getActionForKey('Star', this.newIvr) ? 'TRUE' : 'FALSE',

            this.getActionForKey('Hash', this.originalIvr),
            this.getActionForKey('Hash', this.newIvr),
            this.getActionForKey('Hash', this.originalIvr) == this.getActionForKey('Pound', this.newIvr) ? 'TRUE' : 'FALSE',
        ]
    }

    private getActionForKey(keypress: string, ivr: IVRDataBundle | undefined) {
        if (!ivr || !ivr.extendedData?.ivrData?.actions) return ''

        for (let action of ivr.extendedData.ivrData.actions) {
            if (action.input === keypress) {
                if (action.action === 'Transfer') return `Transfer to ${action.phoneNumber}`
                if (action.action === 'Connect') return `Transfer to ${action.extension?.extensionNumber ?? ''}`
                if (action.action === 'Voicemail') return `Tranfer to voicemail of ${action.extension?.extensionNumber ?? ''}`
                if (action.action === 'Repeat') return 'Repeat prompt'
                if (action.action === 'ReturnToRoot') return 'Return to root'
                if (action.action === 'ReturnToPrevious') return 'Return to previous'
                if (action.action === 'ReturnToTopLevelMenu') return 'Return to top level menu'
                if (action.action === 'ConnectToOperator') return 'Connect to operator'
                return ''
            }
        }

        return ''
    }

}