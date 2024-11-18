import { useState } from "react";
import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { ERL } from "../../../Automatic Location Updates/models/ERL";
import { PhoneNumber } from "../../User Data Download/models/UserDataBundle";
import { LimitedExtensionDataBundle } from "../models/LimitedExtensionDataBundle";
import useCreateLE from "./useCreateLE";
import useCreateMO from "./useCreateMO";

const useCreateLEs = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, emailSuffix: string, isCrossRegion: boolean) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {createLE} = useCreateLE(postMessage, postTimedMessage, postError, isCrossRegion)

    const createLEs = async (bundles: LimitedExtensionDataBundle[], unassignedExtensions: Extension[], erls: ERL[], targetExtensions: Extension[], availablePhoneNumbers: PhoneNumber[], availableTollFreeNumbers: PhoneNumber[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setMaxProgress(bundles.length)
        const createdLEs: Extension[] = []
        if (unassignedExtensions.length < bundles.length) {
            postMessage(new Message(`Cannot migrate Limited Extensions because the target account doesn't have enough unassigned extensions. ${unassignedExtensions.length} vs ${bundles.length}`, 'error'))
            postError(new SyncError('', '', ['Not enough unassigned LEs', ``]))
            return []
        }

        for (let i = 0; i < bundles.length; i++) {
            let bundle = bundles[i]
            bundle.phoneNumberMap = new Map<string, PhoneNumber>()
            
            if (bundle.extension.data.site && bundle.extension.data.site.name !== 'Main Site') {
                const site = targetExtensions.find((ext) => ext.prettyType() === 'Site' && ext.data.name === bundle.extension.data.site?.name)
                if (!site) {
                    postMessage(new Message(`${bundle.extension.data.name} can't be migrated because the site it's assigned to (${bundle.extension.data.site?.name}) does not exist`, 'error'))
                    continue
                }

                bundle.extension.data.site!.id = `${site!.data.id}`
            }

            bundle.extension.data.contact.email = `${bundle.extension.data.contact.email}${emailSuffix}`
            bundle.extension.data.status = 'Activated'

            const numbers: PhoneNumber[] = []
            for (const number of bundle.extendedData!.directNumbers!) {
                if ((number.tollType === 'Toll' || number.paymentType === 'Local') && availablePhoneNumbers.length === 0) {
                    postMessage(new Message(`Ran out of phone numbers`, 'error'))
                    continue
                }
    
                if ((number.tollType === 'TollFree' || number.paymentType === 'TollFree') && availableTollFreeNumbers.length === 0) {
                    postMessage(new Message(`Ran out of toll free numbers`, 'error'))
                    continue
                }
    
                let tempNumber: PhoneNumber
    
                if ((number.tollType === 'Toll') || (number.paymentType === 'Local')) {
                    tempNumber = availablePhoneNumbers.pop()!
                }
                else {
                    tempNumber = availableTollFreeNumbers.pop()!
                }
    
                // const tempNumber = availablePhoneNumbers.pop()!
                bundle.phoneNumberMap.set(number.phoneNumber, tempNumber)
                numbers.push(tempNumber)
            }

            const unassignedExt = unassignedExtensions.pop()!
            bundle.phoneNumberMap.set(bundle.extendedData!.devices![0].phoneLines[0].phoneInfo.phoneNumber, unassignedExt.data.phoneNumbers![0])

            try {
                await createLE(bundle, erls, unassignedExt, numbers)
                createdLEs.push(bundle.extension)
            }
            catch (e: any) {
                postMessage(new Message(`Something went wrong creating LE ${bundle.extension.data.name}`, 'error'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Unexepected error configuring LE', e.message], undefined, bundle))
            }
            setProgressValue((prev) => prev + 1)
        }

        return createdLEs
    }

    return {createLEs, progressValue, maxProgress}
}

export default useCreateLEs