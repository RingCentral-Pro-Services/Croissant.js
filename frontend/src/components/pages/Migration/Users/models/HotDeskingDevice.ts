import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Device } from "../../User Data Download/models/UserDataBundle";

export class HotDeskingDevice implements ExcelFormattable {
    constructor(public device: Device) {}

    toExcelRow(): string[] {
        return [
            '', // Initial upon completion. Ignored
            this.device.site?.name ?? '',
            this.device.model?.name ?? '',
            this.device.name,
            this.device.phoneLines[0].phoneInfo.phoneNumber,
            '', // Temp number
            this.device.serial,
            '', // Device lock status. Ignored
            '', // WMI. Ignored.
            this.device.emergency?.location?.name ?? '',
            '', // ERL
            '', // Cost center
        ]
    }
}