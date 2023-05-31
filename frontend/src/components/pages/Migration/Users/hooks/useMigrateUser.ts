import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { UserDataBundle } from "../../User Data Download/models/UserDataBundle";

const useMigrateUser = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId'
    const baseWaitingPeriod = 250

    const migrateUser = async (dataBundle: UserDataBundle, extensionID?: string) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        console.log('user')
        console.log(dataBundle.extension)
        console.log('user payload')
        console.log(dataBundle.extension.payload(true))

        if (!extensionID) {
            // This is a virtual user
        }
        
        else {
            // This is a licensed users
            createLicensedUser(dataBundle, extensionID, accessToken)
        }
    }

    const createUnlicensedUser = () => {

    }

    const createLicensedUser = async (bundle: UserDataBundle, id: string, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.put(baseUpdateURL.replace('extensionId', id), headers, bundle.extension.payload(true))

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to create user`)
            console.log(e)
            postMessage(new Message(`Failed to create user ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to create user', bundle.extension.data.name], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {migrateUser}
}

export default useMigrateUser