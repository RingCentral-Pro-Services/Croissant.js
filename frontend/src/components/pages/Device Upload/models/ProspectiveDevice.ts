import { DataGridFormattable } from "../../../../models/DataGridFormattable"
import { Extension } from "../../../../models/Extension"

export interface ProspectiveDeviceData {
    macAddress: string
    modelID: string,
    modelName: string,
    name: string
    extension: Extension
}

export class ProspectiveDevice implements DataGridFormattable {
    constructor(public data: ProspectiveDeviceData) {}

    toDataGridRow(): any {
        return {
            id: this.data.extension.data.id,
            extension: this.data.extension.data.name,
            model: this.data.modelName,
            macAddress: this.data.macAddress,
            name: this.data.name
        }
    }

    toDataGidHeader(): any {
        return [
            { field: 'extension', headerName: 'Extension Name', width: 200 },
            { field: 'model', headerName: 'Model', width: 200 },
            { field: 'macAddress', headerName: 'MAC Address', width: 200 },
            { field: 'name', headerName: 'Device Name', width: 200 },
        ]
    }

    property(key: string): any {
        return this[key as keyof ProspectiveDevice]
    }
}