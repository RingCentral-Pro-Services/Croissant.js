import { useEffect, useState } from "react"
import { CallHandlingRules } from "../models/CallHandlingRules"
import CallQueue from "../models/CallQueue"
import { Greeting } from "../models/Greetings"
import { Message } from "../models/Message"
import RCExtension from "../models/RCExtension"
import { SyncError } from "../models/SyncError"
import { RestCentral } from "./RestCentral"

const useGetCallQueueSettings = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [queues, setQueues] = useState<CallQueue[]>([])
    const [isCallQueueSettingsPending, setIsPending] = useState(true)
    const [shouldFetch, setShouldFetch] = useState(false)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [extensionList, setExtensionList] = useState<RCExtension[]>([])
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/extensionId/answering-rule'

    const fetchCallQueueSettings = (callQueues: CallQueue[], extensionList: RCExtension[]) => {
        setQueues(callQueues)
        setIsPending(true)
        setRateLimitInterval(0)
        setShouldFetch(true)
        setExtensionList(extensionList)
        setCurrentExtensionIndex(0)
    }

    useEffect(() => {
        if (!shouldFetch) return
        if (currentExtensionIndex >= queues.length) {
            setIsPending(false)
            setShouldFetch(false)
            return
        }

        const accessToken = localStorage.getItem('cs_access_token')
        let url = baseURL.replace('extensionId', `${queues[currentExtensionIndex].extension.id}`)
        url += '?view=Detailed&enabledOnly=false'
        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }

        setTimeout(async () => {
            try {
                let response = await RestCentral.get(url, headers)
                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                    postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }

                const records = response.data.records as Array<any>

                const afterHoursData = records.filter((record) => {
                    return record.id === "after-hours-rule"
                })
                const businessHoursData = records.filter((record) => {
                    return record.id === "business-hours-rule"
                })

                if (businessHoursData.length > 0) {
                    const callHandling: CallHandlingRules = businessHoursData[0].queue
                    const greetings: Greeting[] = businessHoursData[0].greetings
                    queues[currentExtensionIndex].handlingRules = callHandling
                    queues[currentExtensionIndex].greetings = greetings
                }

                if (afterHoursData.length > 0) {
                    const action = afterHoursData[0].callHandlingAction
                    if (action === 'TransferToExtension') {
                        const extensionID = afterHoursData[0].transfer.extension.id
                        const extension = extensionList.find((extension) => {
                            return extension.id == extensionID
                        })
                        queues[currentExtensionIndex].afterHoursDestination = `${extension?.extensionNumber ?? extensionID}`
                    }
                    else if (action === 'UnconditionalForwarding') {
                        const phoneNumber = afterHoursData[0].unconditionalForwarding.phoneNumber
                        queues[currentExtensionIndex].afterHoursDestination = phoneNumber
                    }
                    queues[currentExtensionIndex].afterHoursAction = action
                    
                }

                setCurrentExtensionIndex(currentExtensionIndex + 1)
                setProgressValue(queues.length + currentExtensionIndex)
            }
            catch(error: any) {
                console.log(`Oh no! Something went wrong fetching settings for ${queues[currentExtensionIndex].extension.name} - Ext. ${queues[currentExtensionIndex].extension.extensionNumber}`)
                console.log(error)
                if (error.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                setRateLimitInterval(error.rateLimitInterval)
                postError(new SyncError(queues[currentExtensionIndex].extension.name, queues[currentExtensionIndex].extension.extensionNumber, ['Failed to get settings', '']))
                setProgressValue(queues.length + currentExtensionIndex)
            }
        }, rateLimitInterval)

    }, [currentExtensionIndex, rateLimitInterval, queues, shouldFetch, baseURL])

    return {fetchCallQueueSettings, queues, isCallQueueSettingsPending}
}

export default useGetCallQueueSettings