import { DataGridFormattable } from "../../../../models/DataGridFormattable";
import { ERL } from "../../Automatic Location Updates/models/ERL";
import { Device } from "../../Migration/User Data Download/models/UserDataBundle";

export class DeviceERLMapping implements DataGridFormattable {
    constructor(public device: Device, public erl: ERL) {}

    toDataGridRow(): any {
        return {
            id: this.device.id,
            deviceName: this.device.name,
            erlName: this.erl.name,
        }
    }

    toDataGidHeader(): any {
        return [
            { field: 'deviceName', headerName: 'Device Name', width: 400 },
            { field: 'erlName', headerName: 'ERL', width: 400 },
        ]
    }

    property(key: string): any {
        return this[key as keyof DeviceERLMapping]
    }
}