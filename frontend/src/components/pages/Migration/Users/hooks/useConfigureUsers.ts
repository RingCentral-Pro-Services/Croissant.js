import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { UserDataBundle } from "../../User Data Download/models/UserDataBundle";
import useConfigureUser from "./useConfigureUser";

const useConfigureUsers = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const {configureUser} = useConfigureUser(postMessage, postTimedMessage, postError)

    const configureUsers = async (bundles: UserDataBundle[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        for (const bundle of bundles) {
            await configureUser(bundle)
        }
    }
    
    return {configureUsers}
}

export default useConfigureUsers