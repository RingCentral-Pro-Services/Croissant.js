import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { CallRecordingDataBundle } from "../../Users/models/CallRecordingDataBundle";

export class AuditCallRecordingPair implements ExcelFormattable {
    constructor(public originalSettings: CallRecordingDataBundle | undefined, public newSettings: CallRecordingDataBundle | undefined) {}

    toExcelRow(): string[] {
        return [
            // Padding for unused columns
            '',
            '',
            '',
            '',

            // On demand
            this.originalSettings?.onDemand.enabled ? 'On' : 'Off',
            this.newSettings?.onDemand.enabled ? 'On' : 'Off',
            this.originalSettings?.onDemand.enabled === this.newSettings?.onDemand.enabled ? 'TRUE' : 'FALSE',

            // Automatic recording
            this.originalSettings?.automatic.enabled ? 'On' : 'Off',
            this.newSettings?.automatic.enabled ? 'On' : 'Off',
            this.originalSettings?.automatic.enabled === this.newSettings?.automatic.enabled ? 'TRUE' : 'FALSE',

            // Outbound call tones
            this.originalSettings?.automatic.outboundCallTones ? 'On' : 'Off',
            this.newSettings?.automatic.outboundCallTones ? 'On' : 'Off',
            this.originalSettings?.automatic.outboundCallTones === this.newSettings?.automatic.outboundCallTones ? 'TRUE' : 'FALSE',

            // Outbound call announcement
            this.originalSettings?.automatic.outboundCallAnnouncement ? 'On' : 'Off',
            this.newSettings?.automatic.outboundCallAnnouncement ? 'On' : 'Off',
            this.originalSettings?.automatic.outboundCallAnnouncement === this.newSettings?.automatic.outboundCallAnnouncement ? 'TRUE' : 'FALSE',

            // Allow mute
            this.originalSettings?.automatic.allowMute ? 'On' : 'Off',
            this.newSettings?.automatic.allowMute ? 'On' : 'Off',
            this.originalSettings?.automatic.allowMute === this.newSettings?.automatic.allowMute ? 'TRUE' : 'FALSE',

            // Recorded extensions
            this.originalSettings?.members?.map((member) => member.extensionNumber).sort().join('\n') ?? '',
            this.newSettings?.members?.map((member) => member.extensionNumber).sort().join('\n') ?? '',
            this.originalSettings?.members?.map((member) => member.extensionNumber).sort().join('\n') === this.newSettings?.members?.map((member) => member.name).sort().join('\n') ? 'TRUE' : 'FALSE',
        ]
    }
}