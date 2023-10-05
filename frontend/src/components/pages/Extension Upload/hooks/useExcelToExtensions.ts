import { useState } from "react"
import { Extension } from "../../../../models/Extension"
import { ExtensionData, Role } from "../../../../models/ExtensionData"
import { Message } from "../../../../models/Message"
import RCExtension from "../../../../models/RCExtension"
import { SyncError } from "../../../../models/SyncError"
import { Device } from "../../Migration/User Data Download/models/UserDataBundle"

const useExcelToExtensions = (shouldAlterEmails: boolean, postMessage: (message: Message) => void, postError: (error: SyncError) => void, shouldFailIfSiteNotFound: boolean = true) => {
    const [extensions, setExtensions] = useState<Extension[]>([])
    const [isExtensionConverPending, setIsExtensionConverPending] = useState(true)

    const convertExcelToExtensions = async (excelData: any[], extensionList: RCExtension[], roles: Role[], deviceDictionary: Device[]) => {
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

            const deviceType = currentItem['Existing Device Type'] ?? ''
            const deviceMac = currentItem['MAC Address']
            const deviceData = deviceDictionary.find((deviceModel) => deviceModel.model.name === deviceType || deviceModel.model.name.replaceAll(' ', '').includes(deviceType.replaceAll(' ', '')))


            let data: ExtensionData = {
                id: randomNumberBetween(111111111, 999999999),
                contact: {
                    firstName: firstName,
                    lastName: lastName,
                    email: shouldAlterEmails ? `${currentItem['Email']}.ps.ringcentral.com` : currentItem['Email'],
                    department: currentItem['Dept'] ?? currentItem['Department'] ?? ''
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
                password: currentItem['Password'],
                roles: findRole(currentItem['Role'], roles),
                ...(deviceData && {device: {id: deviceData.model.id, macAddress: deviceMac}})
            }

            if (shouldFailIfSiteNotFound && data.site?.id === '') {
                postMessage(new Message(`Extension ${data.name} - Ext. ${data.extensionNumber} cannot be created because the site it's assigned to (${currentItem['Site Name']}) does not exist`, 'error'))
                postError(new SyncError(data.name, parseInt(data.extensionNumber), ['Site not found', currentItem['Site Name']], '', data))
                continue
            }

            let extension = new Extension(data)
            extensions.push(extension)
        }
        setExtensions(extensions)
        setIsExtensionConverPending(false)
        return extensions
    }

    const findRole = (name: string, roles: Role[]) => {
        const role = roles.find(role => role.displayName === name)
        if (role) {
            return [role]
        }
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
            case 'MS Teams User →':
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
        if (siteName === 'Main Site') return 'main-site'

        let site = siteList.filter((ext) => ext.prettyType[ext.type] === 'Site').find(site => site.name === siteName)
        if (site) {
            return `${site.id}`
        }
        return ''
    }

    return { extensions, isExtensionConverPending, convertExcelToExtensions }
}

export default useExcelToExtensions