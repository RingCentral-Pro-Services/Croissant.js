import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { ERL } from "../../../Automatic Location Updates/models/ERL";
import { UserDataBundle } from "../../User Data Download/models/UserDataBundle";
import { Role } from "../models/Role";
import useConfigureUser from "./useConfigureUser";

const useConfigureUsers = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const {configureUser} = useConfigureUser(postMessage, postTimedMessage, postError)

    const configureUsers = async (bundles: UserDataBundle[], companyERLs: ERL[], originalExtensions: Extension[], targetExtensions: Extension[], roles: Role[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        for (const bundle of bundles) {
            await configureUser(bundle, companyERLs, originalExtensions, targetExtensions, roles)
        }
    }
    
    return {configureUsers}
}

export default useConfigureUsers