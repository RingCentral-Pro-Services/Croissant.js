import { wait } from "../../../../helpers/rcapi"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { SecretQuestion } from "../models/SecretQuestion"

const useSecretQuestions = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const fetchSecretQuestions = async () => {
        const token = localStorage.getItem('cs_access_token')

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const res = await RestCentral.get('https://platform.ringcentral.com/restapi/v1.0/dictionary/secret-question', headers)
            console.log(res)
            res.rateLimitInterval > 0 ? await wait(res.rateLimitInterval) : await wait(250)

            return res.data.records as SecretQuestion[]
        }
        catch (e) {
            postMessage(new Message(`Failed to fetch secret questions`, 'error'))
            postError(new SyncError('', '', ['Failed to fetch secret questions', ''], ''))
            return []
        }
    }

    return { fetchSecretQuestions }
}

export default useSecretQuestions