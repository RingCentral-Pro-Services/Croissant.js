import { useState } from "react"
import ExtensionIsolator from "../../../../helpers/ExtensionIsolator"
import { CallMonitoringGroup } from "../../../../models/CallMonitoringGroup"
import { Extension } from "../../../../models/Extension"

const useExcelToMonitoringGroups = () => {
    const [monitoringGroups, setMonitoringGroups] = useState<CallMonitoringGroup[]>([])
    const [isConvertPending, setIsConvertPending] = useState(true)

    const convert = (data: any, extensionList: Extension[]) => {
        const groups: CallMonitoringGroup[] = []
        const isolator = new ExtensionIsolator()

        for (const item of data) {
            let monitoredRaw = item['Users that can be monitored']
            let monitoringRaw = item['Users that can monitor']
            let monitored = monitoredRaw.split(',').map((ext: string) => ext.trim())
            let monitoring = monitoringRaw.split(',').map((ext: string) => ext.trim())
            let monitoredIDs: string[] = Array().fill('', 0, monitored.length)
            let monitoringIDs: string[] = Array().fill('', 0, monitoring.length)

            for (let i = 0; i < monitored.length; i++) {
                monitoredIDs[i] = idForExtension(isolator.isolateExtension(monitored[i]) ?? '', extensionList)
            }

            for (let i = 0; i < monitoring.length; i++) {
                monitoringIDs[i] = idForExtension(isolator.isolateExtension(monitoring[i]) ?? '', extensionList)
            }

            monitoredIDs = monitoredIDs.filter((ext: string) => ext !== '')
            monitoringIDs = monitoringIDs.filter((ext: string) => ext !== '')

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

export default useExcelToMonitoringGroups