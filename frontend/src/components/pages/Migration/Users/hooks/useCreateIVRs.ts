import { useState } from "react";
import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { PhoneNumber } from "../../User Data Download/models/UserDataBundle";
import { IVRDataBundle } from "../models/IVRDataBundle";
import { MessageOnlyDataBundle } from "../models/MessageOnlyDataBundle";
import useCreateIVR from "./useCreateIVR";

const useCreateIVRs = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {createIVR} = useCreateIVR(postMessage, postTimedMessage, postError)

    const createIVRs = async (bundles: IVRDataBundle[], targetExtensions: Extension[], availablePhoneNumbers: PhoneNumber[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setMaxProgress(bundles.length)
        const createdIVRs: Extension[] = []

        for (let i = 0; i < bundles.length; i++) {
            let bundle = bundles[i]

            if (bundle.extension.data.site && bundle.extension.data.site.name !== 'Main Site') {
                const site = targetExtensions.find((ext) => ext.prettyType() === 'Site' && ext.data.name === bundle.extension.data.site?.name)
                if (!site) {
                    postMessage(new Message(`${bundle.extension.data.name} can't be migrated because the site it's assigned to (${bundle.extension.data.site?.name}) does not exist`, 'error'))
                    continue
                }

                bundle.extension.data.site!.id = `${site!.data.id}`
            }

            if (bundle.extension.data.contact.email) {
                bundle.extension.data.contact.email = `${bundle.extension.data.contact.email}.ps.ringcentral.com`
            }
            else {
                bundle.extension.data.contact.email = `noreply-${bundle.extension.data.extensionNumber}@ps.ringcentral.com`
            }
            bundle.extension.data.status = 'Enabled'

            const numbers: PhoneNumber[] = []
            for (const number of bundle.extendedData!.directNumbers!) {
                if (availablePhoneNumbers.length > 0) {
                    numbers.push(availablePhoneNumbers.pop()!)
                }
            }

            await createIVR(bundle, numbers)
            createdIVRs.push(bundle.extension)
            setProgressValue((prev) => prev + 1)
        }

        return createdIVRs
    }

    return {createIVRs, progressValue, maxProgress}
}

export default useCreateIVRs