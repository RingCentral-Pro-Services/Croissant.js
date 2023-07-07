import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Device } from "../../User Data Download/models/UserDataBundle";

export class UnassignedDeviceRow implements ExcelFormattable {
    constructor(public device: Device) {}

    toExcelRow(): string[] {
        return [
            '', // Initial upon completion. Ignored
            '', // Device type. Ignored.
            this.device.site?.name ?? '',
            this.getPhoneNumber(),
            '', // Temp number
            this.device.model?.name ?? '',
            this.device.serial,
            this.device.name,
            '', // Cost center. Ignored
        ]
    }

    getPhoneNumber() {
        if (!this.device.phoneLines || this.device.phoneLines.length === 0) return ''
        return this.device.phoneLines[0].phoneInfo.phoneNumber
    }
}