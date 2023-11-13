import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { ParkLocationDataBundle } from "../../Users/models/ParkLocationDataBundle";

export class AuditParkLocationPair implements ExcelFormattable {
    constructor(private originalParkLocation: ParkLocationDataBundle, private newParkLocation: ParkLocationDataBundle | undefined) {}
    
    toExcelRow(): string[] {
        return [
            // Padding for unused columns
            '',
            '',
            '',
            '',

            // Name
            this.originalParkLocation.extension.data.name,
            this.newParkLocation?.extension.data.name ?? '',
            this.originalParkLocation.extension.data.name == this.newParkLocation?.extension.data.name ? 'TRUE' : 'FALSE',

            // Extension
            this.originalParkLocation.extension.data.extensionNumber,
            this.newParkLocation?.extension.data.extensionNumber ?? '',
            this.originalParkLocation.extension.data.extensionNumber == this.newParkLocation?.extension.data.extensionNumber ? 'TRUE' : 'FALSE',

            // Site
            this.originalParkLocation.extension.data.site?.name ?? '',
            this.newParkLocation?.extension.data.site?.name ?? '',
            this.originalParkLocation.extension.data.site?.name == this.newParkLocation?.extension.data.site?.name ? 'TRUE' : 'FALSE',

            // Members
            this.originalParkLocation.members?.map((m) => m.extensionNumber).sort().join('\n') ?? '',
            this.newParkLocation?.members?.map((m) => m.extensionNumber).sort().join('\n') ?? '',
            this.originalParkLocation.members?.map((m) => m.extensionNumber).sort().join('\n') == this.newParkLocation?.members?.map((m) => m.extensionNumber).sort().join('\n') ? 'TRUE' : 'FALSE',
        ]
    }

}