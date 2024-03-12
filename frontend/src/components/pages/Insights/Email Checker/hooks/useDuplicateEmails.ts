import { Extension } from "../../../../../models/Extension"
import { DuplicateEmail } from "../types/DuplicateEmail"

export const useDuplicateEmails = () => {
    const findDuplicateEmails = (extensions: Extension[]) => {
        const emailMap = new Map<string, Extension[]>()

        for (const extension of extensions) {
            const email = extension.data.contact?.email

            if (!email) continue
            
            if (emailMap.has(email)) {
                emailMap.get(email)?.push(extension)
            } else {
                emailMap.set(email, [extension])
            }
        }

        const duplicates = new Map<string, Extension[]>()
        const duplicateEmails: DuplicateEmail[] = []
        for (const [email, extensions] of emailMap) {
            if (extensions.length > 1) {
                console.log('Duplicate email found')
                duplicateEmails.push(new DuplicateEmail(email, extensions))
                duplicates.set(email, extensions)
            }
        }

        return duplicateEmails
    }

    return { findDuplicateEmails }
}