import { Extension } from "../../../../../models/Extension";
import { Greeting } from "../../../../../models/Greetings";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { ERL } from "../../../Automatic Location Updates/models/ERL";
import { Device, PERL, PhoneNumber } from "../../User Data Download/models/UserDataBundle";
import { LimitedExtensionDataBundle } from "../models/LimitedExtensionDataBundle";

interface DeviceData {
    newDeviceID: string
    device: Device
}

interface DeviceModelPayload {
    deviceId: string
    model: {
        id: string
    }
    serial: string
}

const useCreateLE = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseVirtualUserURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'
    const baseNumberAssignURL = 'https://platform.ringcentral.com/restapi/v2/accounts/~/phone-numbers/phoneNumberId'
    const basePERLURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/emergency-locations'
    const baseDeviceListURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/device'
    const baseDeviceAddressURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/device/deviceId'
    const baseDeviceModelURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/device/bulk-update'
    const baseDeviceUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/device/deviceId'
    const baseCallHandlingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule/ruleId'
    const baseCustomGreetingURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/greeting'
    const baseWaitingPeriod = 250

    const createLE = async (bundle: LimitedExtensionDataBundle, erls: ERL[], unassignedExtension: Extension, availablePhoneNumbers: PhoneNumber[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await createExtension(bundle, `${unassignedExtension.data.id}`, accessToken)

        if (bundle.hasEncounteredFatalError) return
        
        for (const phoneNumber of availablePhoneNumbers) {
            await assignPhoneNumber(bundle, phoneNumber.id, accessToken)
        }
        for (let i = 0; i < bundle.extendedData!.pERLs!.length; i++) {
            await addPERL(bundle, bundle.extendedData!.pERLs![i], accessToken)
        }

        const originalDevice = bundle.extendedData!.devices![0]
        const deviceIDs = await getDeviceIDs(bundle, accessToken)
        if (deviceIDs && deviceIDs.length !== 0) {
            if (originalDevice.type === 'HardPhone') {
                await setDeviceSerial(bundle, deviceIDs[0], originalDevice, accessToken)
            }
            if (originalDevice.emergency && originalDevice.emergency.location) {
                await setDeviceERL(bundle, deviceIDs[0], originalDevice, erls, bundle.extendedData!.pERLs!, accessToken)
            }
            await setDeviceName(bundle, deviceIDs[0], originalDevice.name, accessToken)
        }
        
        const customGreetings = await setDuringHoursGreetings(bundle, accessToken)
        if (customGreetings) {
            for (const greeting of customGreetings) {
                console.log('setting custom greeting')
                await setCustomGreeting(bundle, 'business-hours-rule', greeting, accessToken)
            }
        }
    }

    const createExtension = async (bundle: LimitedExtensionDataBundle, extensionID: string, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.put(baseVirtualUserURL.replace('extensionId', extensionID), headers, bundle.extension.payload(true))
            bundle.extension.data.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            bundle.hasEncounteredFatalError = true
            console.log(`Failed to create LE`)
            console.log(e)
            postMessage(new Message(`Failed to create limited extension ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to create LE', bundle.extension.data.name], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const assignPhoneNumber = async (bundle: LimitedExtensionDataBundle, phoneNumberID: string, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const body = {
                usageType: 'DirectNumber',
                extension: {
                    id: bundle.extension.data.id
                }
            }
            const response = await RestCentral.patch(baseNumberAssignURL.replace('phoneNumberId', phoneNumberID), headers, body)
            

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to assign direct number`)
            console.log(e)
            postMessage(new Message(`Failed to get phone number ID ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to get phone number ID', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const addPERL = async (bundle: LimitedExtensionDataBundle, erl: PERL, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.post(basePERLURL.replace('extensionId', `${bundle.extension.data.id}`), headers, erl)
            erl.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to add pERL`)
            console.log(e)
            postMessage(new Message(`Failed to add pERL to ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to add pERL', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setDeviceSerial = async (bundle: LimitedExtensionDataBundle, deviceID: string, existingDevice: Device, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const devices: DeviceModelPayload[] = []
            const device: DeviceModelPayload = {
                deviceId: deviceID,
                serial: `N${existingDevice.serial}`,
                model: {
                    id: existingDevice.model.id
                }
            }
            devices.push(device)

            const body = {
                records: devices
            }

            const response = await RestCentral.post(baseDeviceModelURL.replace('extensionId', `${bundle.extension.data.id}`), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set schedule`)
            console.log(e)
            postMessage(new Message(`Failed to set schedule for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set schedule', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setDeviceName = async (bundle: LimitedExtensionDataBundle, deviceID: string, deviceName: string, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                name: deviceName
            }

            const response = await RestCentral.put(baseDeviceUpdateURL.replace('deviceId', deviceID), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set device name`)
            console.log(e)
            postMessage(new Message(`Failed to set device name for LE ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set LE device name', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const getDeviceIDs = async (bundle: LimitedExtensionDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseDeviceListURL.replace('extensionId', `${bundle.extension.data.id}`), headers)
            console.log('Device response')
            console.log(response.data)
            const deviceIDs = response.data.records.map((record: any) => record.id)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
            return deviceIDs
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get device IDs`)
            console.log(e)
            postMessage(new Message(`Failed to get device IDs for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to get device IDs', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setDeviceERL = async (bundle: LimitedExtensionDataBundle, deviceID: string, originalDevice: Device, companyERLs: ERL[], personalERLs: PERL[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const erl = companyERLs.find((erl) => erl.name === originalDevice.emergency.location?.name && erl.visibility === originalDevice.emergency.visibility)
            const perl = personalERLs.find((erl) => erl.name === originalDevice.emergency.location?.name)
            if (!erl && !perl) {
                postMessage(new Message(`ERL for ${bundle.extension.data.name} was not found. ERL not set`, 'error'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to set device ERL', '']))
                return
            }

            const body = {
                emergency: {
                    location: {
                        id: erl?.id ?? perl?.id
                    }
                }
            }

            const response = await RestCentral.put(baseDeviceAddressURL.replace('deviceId', deviceID), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set device address`)
            console.log(e)
            postMessage(new Message(`Failed to set device address for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set device address', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setCustomGreeting = async (bundle: LimitedExtensionDataBundle, ruleID: string, greeting: Greeting, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "multipart/form-data",
                "Content-Disposition": `attachment; filename="greeting.mp3"`,
                "Authorization": `Bearer ${token}`
            }

            const formData = new FormData()
            const filename = `audio.${greeting.custom?.contentType === 'audio/mpeg' ? 'mp3' : 'wav'}`
            const file = new File([greeting.custom?.data], filename, {
                type: greeting.custom?.contentType === 'audio/mpeg' ? 'audio/mpeg' : 'audio/wav'
            })
            formData.append('type', greeting.type)
            formData.append('answeringRuleId', ruleID)
            formData.append('binary', file, file.name)

            const response = await RestCentral.post(baseCustomGreetingURL.replace('extensionId', `${bundle.extension.data.id}`), headers, formData)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set custom ${greeting.type} greeting`)
            console.log(e)
            postMessage(new Message(`Failed to set custom ${greeting.type} greeting for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set custom greeting', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setDuringHoursGreetings = async (bundle: LimitedExtensionDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const greetings = bundle.extendedData?.businessHoursCallHandling?.greetings
            const nonCustomGreetings = greetings?.filter((greeting) => greeting.preset)
            const customGreetings = greetings?.filter((greeting) => !greeting.preset)

            const body = {
                greetings: nonCustomGreetings
            }

            const response = await RestCentral.put(baseCallHandlingURL.replace('extensionId', `${bundle.extension.data.id}`).replace('ruleId', 'business-hours-rule'), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)

            return customGreetings
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set business hours greetings`)
            console.log(e)
            postMessage(new Message(`Failed to set business hours greetings for ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set business hours greetings', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {createLE}
}

export default useCreateLE