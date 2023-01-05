import { useState } from "react"
import ExtensionIsolator from "../../../../helpers/ExtensionIsolator"
import { CallMonitoringGroup } from "../../../../models/CallMonitoringGroup"
import { Extension } from "../../../../models/Extension"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"

const useExcelToMonitoringGroups = (postMessage: (message: Message) => void, postError: (error: SyncError) => void) => {
    const [monitoringGroups, setMonitoringGroups] = useState<CallMonitoringGroup[]>([])
    const [isConvertPending, setIsConvertPending] = useState(true)

    const convert = (data: any, extensionList: Extension[]) => {
        const groups: CallMonitoringGroup[] = []
        const isolator = new ExtensionIsolator()

        for (const item of data) {
            let monitoredRaw = item['Users that can be monitored']
            let monitoringRaw = item['Users that can monitor']

            let prospectiveMonitored: ProspectiveExtension[] = []
            let prospectiveMonitoring: ProspectiveExtension[] = []

            const monitoredSplit = monitoredRaw.split(',').map((ext: string) => ext.trim())
            const monitoringSplit = monitoringRaw.split(',').map((ext: string) => ext.trim())

            for (const ext of monitoredSplit) {
                prospectiveMonitored.push({
                    extensionNumber: isolator.isolateExtension(ext) ?? '',
                    id: idForExtension(isolator.isolateExtension(ext) ?? '', extensionList)
                })
            }

            for (const ext of monitoringSplit) {
                prospectiveMonitoring.push({
                    extensionNumber: isolator.isolateExtension(ext) ?? '',
                    id: idForExtension(isolator.isolateExtension(ext) ?? '', extensionList)
                })
            }

            const monitoredIDs = prospectiveMonitored.filter((ext) => ext.id !== '').map((ext) => ext.id)
            const monitoringIDs = prospectiveMonitoring.filter((ext) => ext.id !== '').map((ext) => ext.id)
            const monitored = prospectiveMonitored.filter((ext) => ext.id !== '').map((ext) => ext.extensionNumber)
            const monitoring = prospectiveMonitoring.filter((ext) => ext.id !== '').map((ext) => ext.extensionNumber)

            const removedMonitored = prospectiveMonitored.filter((ext) => ext.id === '').map((ext) => ext.extensionNumber)
            const removedMonitoring = prospectiveMonitoring.filter((ext) => ext.id === '').map((ext) => ext.extensionNumber)

            console.log('Removed extensions')
            console.log(removedMonitored)
            console.log(removedMonitoring)
            if (removedMonitored.length > 0 || removedMonitoring.length > 0) {
                console.log('Some extensions were removed')
                postMessage(new Message(`The following extensions were removed from group '${item['Group Name']}' because they either don't exist or they are not users: ${[...removedMonitored, ...removedMonitoring].join(', ')}`, 'warning'))
                postError(new SyncError(item['Group Name'], 0, ['Invalid members', [...removedMonitored, ...removedMonitoring].join(', ')]))
            }

            const group = new CallMonitoringGroup({
                name: item['Group Name'],
                monitoredExtensions: monitored,
                monitoringExtensions: monitoring,
            })

            for (const ext of monitoredIDs) {
                group.addMember(ext, 'Monitored')
            }

            for (const ext of monitoringIDs) {
                group.addMember(ext, 'Monitoring')
            }

            groups.push(group)
        }

        setMonitoringGroups(groups)
        setIsConvertPending(false)
    }

    const idForExtension = (extension: string, extensionList: Extension[]) => {
        const ext = extensionList.find((ext) => ext.data.extensionNumber == extension)
        if (ext) {
            return `${ext.data.id}`
        }
        return ''
    }

    return { monitoringGroups, isConvertPending, convert }
}

interface ProspectiveExtension {
    extensionNumber: string
    id: string
}

export default useExcelToMonitoringGroups