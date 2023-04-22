import { useState } from "react"
import { Extension } from "../../../../models/Extension"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { PTTChannel, PTTChannelMember } from "../models/PTTChannel"

const useReadPTTChannels = (postMessage: (message: Message) => void, postError: (error: SyncError) => void) => {
    const [channels, setChannels] = useState<PTTChannel[]>([])
    const [isReadPending, setIsReadPending] = useState(true)

    const readChannels = (data: any, extensions: Extension[]) => {
        const workingChannels: PTTChannel[] = []

        for (const item of data) {
            workingChannels.push(new PTTChannel({
                id: item['ID'],
                name: item['Name'],
                members: getMembers(item['Name'], item['Members'], extensions)
            }))
        }
        setIsReadPending(false)
        setChannels(workingChannels)
    }

    const getMembers = (channelName: string, rawMembers: string, extensions: Extension[]) => {
        const members: PTTChannelMember[] = []
        const memberExtensions = new Set(rawMembers.split(',').map((ext) => ext.trim()))

        for (const member of memberExtensions) {
            const user = extensions.find((ext) => `${ext.data.extensionNumber}` === `${member}`)
            members.push({
                extensionId: `${user?.data.id}` ?? '',
                extensionNumber: member
            })
        }

        const invalidMembers = members.filter((member) => member.extensionNumber === '')
        if (invalidMembers.length > 0) {
            postMessage(new Message(`The following members were removed from ${channelName} because they don't exist: ${invalidMembers.map((member) => member.extensionNumber).join(', ')}`, 'warning'))
            postError(new SyncError(channelName, 0, ['Invalid members', invalidMembers.map((member) => member.extensionNumber).join(', ')]))
        }

        return members.filter((member) => member.extensionId != '')
    }

    return {readChannels, channels, isReadPending}
}

export default useReadPTTChannels