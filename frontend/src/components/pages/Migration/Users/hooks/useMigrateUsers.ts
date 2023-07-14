import { useState } from "react";
import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { Device, PhoneNumber, UserDataBundle } from "../../User Data Download/models/UserDataBundle";
import useMigrateUser from "./useMigrateUser";

const useMigrateUsers = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {migrateUser} = useMigrateUser(postMessage, postTimedMessage, postError)

    const migrateUsers = async (phoneNumbers: PhoneNumber[], dataBundles: UserDataBundle[], unassignedExtensions: Extension[], extensions: Extension[], emailSuffix: string) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setMaxProgress(dataBundles.length)
        for (let i = 0; i < dataBundles.length; i++) {
            let bundle = dataBundles[i]

            if (bundle.extension.data.site && bundle.extension.data.site.name !== 'Main Site') {
                const site = extensions.find((ext) => ext.prettyType() === 'Site' && ext.data.name === bundle.extension.data.site?.name)
                if (!site) {
                    postMessage(new Message(`${bundle.extension.data.name} can't be migrated because the site it's assigned to (${bundle.extension.data.site?.name}) does not exist`, 'error'))
                    continue
                }

                bundle.extension.data.site!.id = `${site!.data.id}`
            }
            bundle.extension.data.contact.email = `${bundle.extension.data.contact.email}${emailSuffix}`
            bundle.extension.data.status = 'NotActivated'
            

            const phoneNumberBundle: PhoneNumber[] = []
            bundle.phoneNumberMap = new Map<string, PhoneNumber>()

            if (bundle.extendedData?.directNumbers) {
                for (let i = 0; i < bundle.extendedData!.directNumbers!.length; i++) {
                    if (phoneNumbers.length !== 0) {
                        const tempNumber = phoneNumbers.pop()!
                        const originalNumber = bundle.extendedData.directNumbers[i]
                        bundle.phoneNumberMap.set(originalNumber.phoneNumber, tempNumber)
                        phoneNumberBundle.push(tempNumber)
                    }
                }
            }

            if (bundle.extendedData?.devices.length != 0) {
                const deviceCount = bundle.extendedData!.devices.length
                let actualDevices: Device[] = []
                actualDevices = bundle.extendedData!.devices.filter((device) => device.phoneLines && device.phoneLines.length !== 0)
                let unassignedIDs: string[] = []
                for (let i = 0; i < actualDevices.length; i++) {
                    if (unassignedExtensions.length === 0) {
                        postMessage(new Message('Ran out of unassigned extensions', 'error'))
                        continue
                    }
                    const unassignedExt = unassignedExtensions.pop()!
                    bundle.phoneNumberMap.set(bundle.extendedData!.devices[i].phoneLines[0].phoneInfo.phoneNumber, unassignedExt.data!.phoneNumbers![0])
                    unassignedIDs.push(`${unassignedExt.data.id}`)
                }

                if (unassignedIDs.length !== 0) {
                    await migrateUser(bundle, phoneNumberBundle, unassignedIDs)
                }
                else {
                    await migrateUser(bundle, phoneNumberBundle)    
                }

            }
            else {
                await migrateUser(bundle, phoneNumberBundle)
            }
            setProgressValue((prev) => prev + 1)
        }
        if (dataBundles.length !== 0) {
            await wait(10000)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {migrateUsers, progressValue, maxProgress}
}

export default useMigrateUsers