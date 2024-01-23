import { useState } from "react";
import ExtensionIsolator from "../../../../../helpers/ExtensionIsolator";
import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { PhoneNumber } from "../../../../../models/PhoneNumber";
import { SyncError } from "../../../../../models/SyncError";
import { PhoneNumberPayload } from "../models/PhoneNumberPayload";

const useExcelToPhoneNumbers = (postMessage: (message: Message) => void, postError: (error: SyncError) => void) => {
    const [phoneNumberPayloads, setPhoneNumberPayloads] = useState<PhoneNumberPayload[]>([])
    const [isConverPending, setIsConverPending] = useState(true)

    const convert = (extensionList: Extension[], phoneNumbers: PhoneNumber[], excelData: any[] ) => {
        const data: PhoneNumberPayload[] = []
        const isolator = new ExtensionIsolator()

        for (const currentData of excelData) {
            const phoneNumber = currentData['Phone Number']
            const extensionNumber = currentData['Extension']
            const isolatedNumber = isolator.isolatePhoneNumber(`${phoneNumber}`.trim())
            const isolatedExtension = isolator.isolateExtension(`${extensionNumber}`.trim())
            const numberID = getPhoneNumberID(isolatedNumber ?? '', phoneNumbers)
            const extensionID = getExtensionID(isolatedExtension ?? '', extensionList)

            if (numberID === '') {
                console.error(`Could not find phone number ${isolatedNumber}`)
                postMessage(new Message(`Could not find phone number ${isolatedNumber}`, 'error'))
                continue
            }

            if ((!extensionNumber || extensionNumber === '') && !extensionID  || extensionID === '') {
                const number = new PhoneNumberPayload(phoneNumber ?? '', numberID, isolatedExtension ?? '', undefined)
                data.push(number)
                continue
            }

            if (!extensionID  || extensionID === '') {
                console.error(`Could not find extension ${isolatedExtension}`)
                postMessage(new Message(`Could not find extension for number ${isolatedNumber}. Number will be assigned to auto-receptionist`, 'warning'))
                continue
            }

            const number = new PhoneNumberPayload(phoneNumber ?? '', numberID, isolatedExtension ?? '', extensionID)
            data.push(number)
        }
        setPhoneNumberPayloads(data)
        setIsConverPending(false)
    }

    const getPhoneNumberID = (prospectiveNumber: string, phoneNumbers: PhoneNumber[]) => {
        for (const phoneNumber of phoneNumbers) {
            if (phoneNumber.phoneNumber === prospectiveNumber || phoneNumber.phoneNumber === `+1${prospectiveNumber}` || phoneNumber.phoneNumber === `+${prospectiveNumber}`) {
                return phoneNumber.id
            }
        }
        return ""
    }

    const getExtensionID = (prospectiveExtension: string, extensions: Extension[]) => {
        for (const extension of extensions) {
            if (extension.data.extensionNumber === prospectiveExtension) {
                return `${extension.data.id}`
            }
        }
        return ""
    }

    return {convert, phoneNumberPayloads, isConverPending}
}

export default useExcelToPhoneNumbers