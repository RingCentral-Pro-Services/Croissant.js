import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { CallMonitoringDataBundle } from "../../Users/models/CallMonitoringDataBundle";

export class AuditCallMonitoringGroupPair implements ExcelFormattable {
    constructor(private origingalGroup: CallMonitoringDataBundle, private newGroup: CallMonitoringDataBundle | undefined) {}

    toExcelRow(): string[] {
        return [
            // Padding for unused columns
            '',
            '',
            '',
            '',

            // Name
            this.origingalGroup.data.name,
            this.newGroup?.data.name ?? '',
            this.origingalGroup.data.name == this.newGroup?.data.name ? 'TRUE' : 'FALSE',

            // Monitoring users
            this.origingalGroup.data.members.filter((m) => m.permissions.includes('Monitoring')).map((m) => m.extensionNumber).sort().join('\n'),
            this.newGroup?.data.members.filter((m) => m.permissions.includes('Monitoring')).map((m) => m.extensionNumber).sort().join('\n') ?? '',
            this.origingalGroup.data.members.filter((m) => m.permissions.includes('Monitoring')).map((m) => m.extensionNumber).sort().join('\n') == this.newGroup?.data.members.filter((m) => m.permissions.includes('Monitoring')).map((m) => m.extensionNumber).sort().join('\n') ? 'TRUE' : 'FALSE',

            // Monitored users
            this.origingalGroup.data.members.filter((m) => m.permissions.includes('Monitored')).map((m) => m.extensionNumber).sort().join('\n'),
            this.newGroup?.data.members.filter((m) => m.permissions.includes('Monitored')).map((m) => m.extensionNumber).sort().join('\n') ?? '',
            this.origingalGroup.data.members.filter((m) => m.permissions.includes('Monitored')).map((m) => m.extensionNumber).sort().join('\n') == this.newGroup?.data.members.filter((m) => m.permissions.includes('Monitored')).map((m) => m.extensionNumber).sort().join('\n') ? 'TRUE' : 'FALSE',
        ]
    }
}