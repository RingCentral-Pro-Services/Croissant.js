import { useState } from "react"
import { Extension } from "../../../../models/Extension"
import { ExtensionData } from "../../../../models/ExtensionData"
import RCExtension from "../../../../models/RCExtension"

const useExcelToExtensions = () => {
    const [extensions, setExtensions] = useState<Extension[]>([])
    const [isExtensionConverPending, setIsExtensionConverPending] = useState(true)

    const convertExcelToExtensions = (excelData: any[], extensionList: RCExtension[]) => {
        let extensions: Extension[] = []
        for (let index = 0; index < excelData.length; index++) {
            const currentItem = excelData[index]
            let firstName = currentItem['First Name']
            let lastName = currentItem['Last Name']
            const type = currentItem['User Type']

            if ((type === 'User' || type === 'VirtualUser') && (!lastName || lastName === '')) {
                const result = evenlySplit(firstName)
                firstName = result[0]
                lastName = result[1]
            }


            let data: ExtensionData = {
                id: randomNumberBetween(111111111, 999999999),
                contact: {
                    firstName: firstName,
                    lastName: lastName,
                    email: currentItem['Email'],
                    department: currentItem['Dept']
                },
                extensionNumber: currentItem['Extension'],
                name: `${currentItem['First Name']} ${currentItem['Last Name'] ? ` ${currentItem['Last Name']}` : ''}`,
                type: translateType(currentItem['User Type']),
                site: {
                    id: idForSite(currentItem['Site Name'], extensionList),
                    name: currentItem['Site Name']
                },
                status: 'NotActivated',
                hidden: false,
                ivrPin: currentItem['Pin'],
                password: currentItem['Password']
            }
            let extension = new Extension(data)
            extensions.push(extension)
        }
        setExtensions(extensions)
        setIsExtensionConverPending(false)
    }

    /*
    * Sometimes customers don't follow instructions and put the entire name in the first name column.
    * This function splits the name into first and last name if it contains a space.
    * If it doesn't contain a space, it returns the raw input as the first name and 'Extension' as the last name.
    */
    const evenlySplit = (raw: string) => {
        if (raw.includes(' ')) {
            var middle = Math.floor(raw.length / 2)
            var before = raw.lastIndexOf(' ', middle)
            var after = raw.indexOf(' ', middle + 1)

            if (middle - before < after - middle) {
                middle = before
            } else {
                middle = after
            }

            var s1 = raw.substring(0, middle)
            var s2 = raw.substring(middle + 1)
            return [s1, s2]
        }
        else {
            return [raw, 'Extension']
        }
    }

    const translateType = (rawType: string) => {
        switch (rawType) {
            case 'User':
                return 'User'
            case 'Virtual User':
                return 'User'
            case 'LimitedExtension':
                return 'Limited'
            case 'Message Only':
                return 'Voicemail'
            case 'Announcement Only':
                return 'Announcement'
            default:
                return rawType
        }
    }

    function randomNumberBetween(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    const idForSite = (siteName: string, siteList: RCExtension[]) => {
        let site = siteList.find(site => site.name === siteName)
        if (site) {
            return `${site.id}`
        }
        return 'main-site'
    }

    return { extensions, isExtensionConverPending, convertExcelToExtensions }
}

export default useExcelToExtensions