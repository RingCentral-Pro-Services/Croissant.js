import { useState } from "react";
import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { PhoneNumber } from "../../User Data Download/models/UserDataBundle";
import { MessageOnlyDataBundle } from "../models/MessageOnlyDataBundle";
import useCreateMO from "./useCreateMO";

const useCreateMOs = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void, emailSuffix: string) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {createMO} = useCreateMO(postMessage, postTimedMessage, postError)

    const createMOs = async (bundles: MessageOnlyDataBundle[], targetExtensions: Extension[], availablePhoneNumbers: PhoneNumber[], availableTollFreeNumbers: PhoneNumber[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setMaxProgress(bundles.length)
        const createdMOs: Extension[] = []

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
            bundle.extension.data.status = 'NotActivated'

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

            await createMO(bundle, numbers)
            createdMOs.push(bundle.extension)
            setProgressValue((prev) => prev + 1)
        }

        return createdMOs
    }

    return {createMOs, progressValue, maxProgress}
}

export default useCreateMOs