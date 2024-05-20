import { ERL } from "../../Automatic Location Updates/models/ERL"
import { Device } from "../../Migration/User Data Download/models/UserDataBundle"
import { DeviceERLMapping } from "../models/DeviceERLMapping"

export const readERLData = (data: any[], devices: Device[], erls: ERL[]) => {
    const mappings: DeviceERLMapping[] = []

    for (const item of data) {
        const deviceId = item['Device ID']
        const erlName = item['ERL']

        const device = devices.find((device) => `${device.id}` === deviceId)
        if (!device) {
            console.log(`Could not find device with ID ${deviceId}`)
            continue
        }

        const erl = erls.find((erl) => erl.name === erlName)
        if (!erl) {
            console.log(`Could not find ERL with name ${erlName}`)
            continue
        }

        mappings.push(new DeviceERLMapping(device, erl))
    }

    return mappings
}