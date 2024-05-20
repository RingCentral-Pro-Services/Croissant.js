import ExcelFormattable from "../../../../models/ExcelFormattable";
import { Extension } from "../../../../models/Extension";
import { Device } from "../../Migration/User Data Download/models/UserDataBundle";

export class DeviceUserMapping implements ExcelFormattable {

    constructor(public device: Device, public user: Extension) {}

    toExcelRow(): string[] {
        return [
            this.device.name,
            this.device.id,
            this.user.data.name,
            this.user.data.extensionNumber,
            this.device.site?.name || '',
            this.device.model?.name || '',
            this.device.phoneLines?.map((line) => line.phoneInfo.phoneNumber).join(', ') || '',
        ]
    }

}