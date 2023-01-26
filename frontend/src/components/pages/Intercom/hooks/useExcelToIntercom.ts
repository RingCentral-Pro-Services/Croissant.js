import { useState } from "react";
import { Extension } from "../../../../models/Extension";
import { IntercomStatus, IntercomUser } from "../../../../models/IntercomStatus";
import RCExtension from "../../../../models/RCExtension";

const useExcelToIntercom = () => {
    const [intercomData, setIntercomData] = useState<IntercomStatus[]>([])
    const [isConvertPending, setIsConvertPending] = useState(true)

    const convert = (excelData: any[], extensions: RCExtension[]) => {
        const data: IntercomStatus[] = []

        for (const currentData of excelData) {
            const rawMembers = `${currentData['Users Allowed'] ? currentData['Users Allowed'] : ''}`
            const members = rawMembers.split(',').map(member => member.trim())

            const prospectiveUsers: ProspectiveUser[] = []
            for (const member of members) {
                const prospective = idForExtension(member, extensions)
                prospectiveUsers.push(prospective)
            }

            const validUsers = prospectiveUsers.filter(user => user.id !== '')
            const invalidUsers = prospectiveUsers.filter(user => user.id === '')

            const users: IntercomUser[] = validUsers.map(user => {
                return {
                    id: user.id,
                    name: '',
                    extensionNumber: user.extensionNumber
                }
            })

            const intercom = new IntercomStatus(currentData['ID'], currentData['Extension Name'], currentData['Extension Number'], currentData['Intercom Status'], currentData['Device Name'] ?? '', '', users)
            data.push(intercom)
        }
        setIntercomData(data)
        setIsConvertPending(false)
    }

    const idForExtension = (extensionNumber: string, extensions: RCExtension[]) => {
        const extension = extensions.find(extension => `${extension.extensionNumber}` === extensionNumber)
        const prospective: ProspectiveUser = {
            extensionNumber: extensionNumber,
            id: `${extension?.id ?? ''}` ?? '',
        }
        return prospective
    }

    return {convert, intercomData, isConvertPending}
}

interface ProspectiveUser {
    extensionNumber: string
    id: string
}

export default useExcelToIntercom;