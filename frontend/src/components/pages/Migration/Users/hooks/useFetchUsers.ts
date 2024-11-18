import { useState } from "react"
import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import useFetchUserData from "../../User Data Download/hooks/useFetchUserData"
import { UserDataBundle } from "../../User Data Download/models/UserDataBundle"

const useFetchUsers = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {

    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {fetchUserData} = useFetchUserData(postMessage, postTimedMessage, postError, () => console.log('fetching next user'))

    const fetchUsers = async (users: Extension[], extensions: Extension[]) => {
        const dataBundles: UserDataBundle[] = []

        setProgressValue(0)
        setMaxProgress(users.length)
        for (const extenson of users) {
            const bundle = new UserDataBundle(extenson, undefined)
            dataBundles.push(bundle)
        }

        for (const bundle of dataBundles) {
            try {
                await fetchUserData(bundle, extensions, false)
            }
            catch (e: any) {
                postMessage(new Message(`Something went wrong fetching user ${bundle.extension.data.name}`, 'error'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Unexepected error fetching user', e.message], undefined, bundle))
            }
            setProgressValue((prev) => prev + 1)
        }

        return dataBundles
    }

    return {fetchUsers, progressValue, maxProgress}

}

export default useFetchUsers