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
            let data: ExtensionData = {
                id: randomNumberBetween(111111111, 999999999),
                contact: {
                    firstName: currentItem['First Name'],
                    lastName: currentItem['Last Name'],
                    email: currentItem['Email'],
                    department: currentItem['Dept']
                },
                extensionNumber: currentItem['Extension'],
                name: `${currentItem['First Name']} ${currentItem['Last Name'] ? ` ${currentItem['Last Name']}` : ''}`,
                type: type(currentItem['User Type']),
                site: {
                    id: idForSite(currentItem['Site Name'], extensionList),
                    name: currentItem['Site Name']
                },
                status: 'NotActivated',
                hidden: false,
            }
            let extension = new Extension(data)
            extensions.push(extension)
        }
        setExtensions(extensions)
        setIsExtensionConverPending(false)
    }

    const type = (rawType: string) => {
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