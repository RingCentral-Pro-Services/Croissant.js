import { useState } from "react"
import ExtensionIsolator from "../../../../helpers/ExtensionIsolator"
import { Extension } from "../../../../models/Extension"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { UserGroup, UserGroupMember } from "../models/UserGroup"

const useReadUserGroups = (postMessage: (message: Message) => void, postError: (error: SyncError) => void) => {
    const [groups, setGroups] = useState<UserGroup[]>([])
    const [isGroupReadPending, setIsGroupReadPending] = useState(true)

    const readGroups = (data: any, extensions: Extension[]) => {
        const workingGroups: UserGroup[] = []

        for (const item of data) {
            workingGroups.push(new UserGroup({
                id: item['ID'],
                displayName: item['Display Name'],
                description: item['Description'],
                users: getUsers(item['Members'], item['Display Name'], extensions),
                managers: [getManager(`${item['Manager']}`, extensions) ?? {id: '', name: '', extensionNumber: ''}]
            }))
        }
        setIsGroupReadPending(false)
        setGroups(workingGroups)
    }

    const getUsers = (rawUsers: string, groupName: string, extensions: Extension[]) => {
        const isolator = new ExtensionIsolator()
        const userExtensions = rawUsers.split(', ')
        const existingUsers = userExtensions.filter(extension => doesExtensionExist(extension, extensions)).map(extension => isolator.isolateExtension(extension))
        const missingUsers = userExtensions.filter(extension => !doesExtensionExist(extension, extensions)).map(extension => isolator.isolateExtension(extension))
        const users: UserGroupMember[] = []

        if (missingUsers.length > 0) {
            postMessage(new Message(`The following members were removed from group '${groupName}' because the don't exist: ${missingUsers.join(', ')}`, 'warning'))
            postError(new SyncError(groupName, 0, ['Missing members', '']))
        }

        for (const extension of extensions) {
            if (existingUsers.includes(extension.data.extensionNumber)) {
                users.push({
                    id: `${extension.data.id}`,
                    name: extension.data.name,
                    extensionNumber: extension.data.extensionNumber
                })
            }
        }
        return users
    }

    // There is only one manager per group. 
    const getManager = (rawManager: string, extensions: Extension[]) => {
        const isolator = new ExtensionIsolator()
        const managerExtension = isolator.isolateExtension(rawManager)

        for (const extension of extensions) {
            if (extension.data.extensionNumber === managerExtension) {
                return {
                    id: `${extension.data.id}`,
                    name: extension.data.name,
                    extensionNumber: extension.data.extensionNumber
                }
            }
        }
        return undefined
    }

    const doesExtensionExist = (extensionNumber: string, extensions: Extension[]) => {
        for (const extension of extensions) {
            if (extension.data.extensionNumber === extensionNumber) {
                return true
            }
        }
        return false
    }

    return {readGroups, groups, isGroupReadPending}
}

export default useReadUserGroups