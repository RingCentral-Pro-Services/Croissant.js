import { wait } from "../../../../helpers/rcapi"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { ERL } from "../../Automatic Location Updates/models/ERL"
import { Device } from "../../Migration/User Data Download/models/UserDataBundle"
import { DeviceERLMapping } from "../models/DeviceERLMapping"

const erlUrl = 'https://platform.ringcentral.com/restapi/v1.0/account/~/device/deviceId'
const baseWaitingPeriod = 250

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

export const applyERL = async (mapping: DeviceERLMapping, token: string, postMessage: (message: Message) => void, postError: (error: SyncError) => void, postTimedMessage: (message: Message, duration: number) => void) => {
    try {
        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }

        const body = {
            emergency: {
                location: {
                    id: mapping.erl.id
                
                }
            }
        }

        const res = await RestCentral.put(erlUrl.replace('deviceId', `${mapping.device.id}`), headers, body)
        console.log(res)
    }
    catch (e: any) {
        if (e.rateLimitInterval > 0) {
            postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
        }
        postMessage(new Message(`Could not apply ERL ${mapping.erl.name} to device ${mapping.device.name}. ${e.error}`, 'error'))
        postError(new SyncError(mapping.device.name, 0, ['Failed to apply ERL', ''], e.error ?? '', mapping))
        console.log(`Failed to apply ERL for device ${mapping.device.name}`)
        console.log(e)
        e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
    }
}