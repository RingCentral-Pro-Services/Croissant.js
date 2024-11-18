import { useState } from "react";
import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { ERL } from "../../../Automatic Location Updates/models/ERL";
import { PhoneNumber, UserDataBundle } from "../../User Data Download/models/UserDataBundle";
import { Role } from "../models/Role";
import useConfigureUser from "./useConfigureUser";

const useConfigureUsers = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const {configureUser} = useConfigureUser(postMessage, postTimedMessage, postError)

    const configureUsers = async (bundles: UserDataBundle[], companyERLs: ERL[], originalExtensions: Extension[], targetExtensions: Extension[], roles: Role[], globalSiteNumberMap: Map<string, PhoneNumber>, emailSuffix: string) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setMaxProgress(bundles.length)
        for (const bundle of bundles) {
            try {
                await configureUser(bundle, companyERLs, originalExtensions, targetExtensions, roles, globalSiteNumberMap, emailSuffix)
            }
            catch (e: any) {
                postMessage(new Message(`Something went wrong configuring User ${bundle.extension.data.name}`, 'error'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Unexepected error configuring User', e.message], undefined, bundle))
            }
            setProgressValue((prev) => prev + 1)
        }
    }
    
    return {configureUsers, progressValue, maxProgress}
}

export default useConfigureUsers