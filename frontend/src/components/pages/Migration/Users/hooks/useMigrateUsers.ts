import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { UserDataBundle } from "../../User Data Download/models/UserDataBundle";
import useMigrateUser from "./useMigrateUser";

const useMigrateUsers = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const {migrateUser} = useMigrateUser(postMessage, postTimedMessage, postError)

    const migrateUsers = async (dataBundles: UserDataBundle[], unassignedExtensions: Extension[], extensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        for (let i = 0; i < dataBundles.length; i++) {
            let bundle = dataBundles[i]
            const site = extensions.find((ext) => ext.prettyType() === 'Site' && ext.data.name === bundle.extension.data.site?.name)
            
            if (!site) {
                postMessage(new Message(`${bundle.extension.data.name} can't be migrated because the site it's assigned to (${bundle.extension.data.site?.name}) does not exist`, 'error'))
                continue
            }

            bundle.extension.data.site!.id = `${site!.data.id}`
            bundle.extension.data.contact.email = `${bundle.extension.data.contact.email}.ps.ringcentral.com`
            bundle.extension.data.status = 'NotActivated'

            if (bundle.extendedData?.devices.length != 0) {
                const deviceCount = bundle.extendedData!.devices.length
                let unassignedIDs: string[] = []
                for (let i = 0; i < deviceCount; i++) {
                    if (unassignedExtensions.length === 0) {
                        postMessage(new Message('Ran out of unassigned extensions', 'error'))
                        continue
                    }
                    unassignedIDs.push(`${unassignedExtensions.pop()?.data.id}`)
                }

                await migrateUser(bundle, unassignedIDs)
            }
        }
        await wait(15000)
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {migrateUsers}
}

export default useMigrateUsers