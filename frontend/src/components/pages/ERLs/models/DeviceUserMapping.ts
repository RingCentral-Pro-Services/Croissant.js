import ExcelFormattable from "../../../../models/ExcelFormattable";
import { Extension } from "../../../../models/Extension";
import { Device } from "../../Migration/User Data Download/models/UserDataBundle";

export class DeviceUserMapping implements ExcelFormattable {

    constructor(public device: Device, public user: Extension) {}

    prettyDeviceModel() {
        switch (this.device.type) {
            case "HardPhone":
                return this.device.model?.name
            case "SoftPhone":
                return "Softphone"
            case "OtherPhone":
                return "Existing Device"
            default:
                return "Unknown"
        }
    }

    toExcelRow(): string[] {
        return [
            this.device.name,
            this.device.id,
            this.user.data.name,
            this.user.data.extensionNumber,
            this.user.prettyType(),
            this.device.site?.name || '',
            this.prettyDeviceModel(),
            this.device.phoneLines?.map((line) => line.phoneInfo.phoneNumber).join(', ') || '',
        ]
    }

}