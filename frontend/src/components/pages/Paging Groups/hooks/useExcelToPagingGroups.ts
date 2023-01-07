import { useState } from "react"
import ExtensionIsolator from "../../../../helpers/ExtensionIsolator"
import { Message } from "../../../../models/Message"
import { PagingGroup, PagingGroupData } from "../../../../models/PagingGroup"
import { ProspectiveExtension } from "../../../../models/ProspectiveExtension"
import RCExtension from "../../../../models/RCExtension"
import { SyncError } from "../../../../models/SyncError"

const useExcelToPagingGroups = (postMessage: (message: Message) => void, postError: (error: SyncError) => void) => {
    const [pagingGroups, setPagingGroups] = useState<PagingGroup[]>([])
    const [isConvertPending, setIsConvertPending] = useState(true)

    const convert = (data: any[], extensions: RCExtension[]) => {
        const groups: PagingGroup[] = []
        const isolator = new ExtensionIsolator()

        for (const item of data) {
            const usersAllowedRaw = item['Users Allowed to Page This Group']
            const devicesToReceiveRaw = item['Devices to Receive Page (up to 25 devices)']

            let prospectiveUsers: ProspectiveExtension[] = []
            let prospectiveDevices: ProspectiveExtension[] = []

            const usersAllowedSplit = usersAllowedRaw.split(',').map((ext: string) => ext.trim())
            const devicesToReceiveSplit = devicesToReceiveRaw.split(',').map((ext: string) => ext.trim())

            for (const ext of usersAllowedSplit) {
                prospectiveUsers.push({
                    extensionNumber: isolator.isolateExtension(ext) ?? '',
                    id: idForExtension(isolator.isolateExtension(ext) ?? '', extensions)
                })
            }

            for (const ext of devicesToReceiveSplit) {
                prospectiveDevices.push({
                    extensionNumber: isolator.isolateExtension(ext) ?? '',
                    id: idForExtension(isolator.isolateExtension(ext) ?? '', extensions)
                })
            }

            const validUsers = prospectiveUsers.filter((user) => user.id !== '')
            const validDevices = prospectiveDevices.filter((device) => device.id !== '')

            const invalidUsers = prospectiveUsers.filter((user) => user.id === '')
            const invalidDevices = prospectiveDevices.filter((device) => device.id === '')

            if (invalidUsers.length > 0) {
                postMessage(new Message(`The following users were removed from the group ${item['Group Name']} because they are not valid users: ${invalidUsers.map((user) => user.extensionNumber).join(', ')}`, 'error'))
                postError(new SyncError(item['Group Name'], item['Extension'], ['Invalid users', invalidUsers.map((user) => user.extensionNumber).join(', ')]))
            }

            if (invalidDevices.length > 0) {
                postMessage(new Message(`The following devices were removed from the group ${item['Group Name']} because they are not valid devices: ${invalidDevices.map((device) => device.extensionNumber).join(', ')}`, 'error'))
                postError(new SyncError(item['Group Name'], item['Extension'], ['Invalid devices', invalidDevices.map((device) => device.extensionNumber).join(', ')]))
            }

            const groupData: PagingGroupData = {
                name: item['Group Name'],
                extensionNumber: isolator.isolateExtension(`${item['Extension']}`) ?? '',
                usersAlowedToPage: validUsers,
                devicesToReceivePage: validDevices
            }

            const group = new PagingGroup(groupData)
            groups.push(group)
        }

        setPagingGroups(groups)
        setIsConvertPending(false)
    }

    const idForExtension = (extension: string, extensionList: RCExtension[]) => {
        const ext = extensionList.find((ext) => `${ext.extensionNumber}` === extension)
        if (ext) {
            return `${ext.id}`
        }
        return ''
    }

    return {convert, pagingGroups, isConvertPending}
}

export default useExcelToPagingGroups