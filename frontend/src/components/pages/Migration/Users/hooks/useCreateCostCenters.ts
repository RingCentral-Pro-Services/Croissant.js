import { useState } from "react";
import { wait } from "../../../../../helpers/rcapi";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { CostCenterDataBundle } from "../models/CostCenterDataBundle";

const useCreateCostCenters = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const baseURL = 'https://platform.ringcentral.com/restapi/v2/accounts/~/cost-centers'
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v2/accounts/~/cost-centers/costCenterId'
    const baseWaitingPeriod = 250

    const createCostCenters = async (costCenters: CostCenterDataBundle[], topLevelCostCenter: CostCenterDataBundle) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const originalCostCenters = structuredClone(costCenters)
        setMaxProgress(costCenters.length * 2)

        // Create cost centers
        for(let i = 0; i < costCenters.length; i++) {
            await createCostCenter(costCenters[i], topLevelCostCenter, accessToken)
            setProgressValue((prev) => prev + 1)
        }

        // Update cost center parent IDs
        for (let i = 0; i < costCenters.length; i++) {
            await updateCostCenter(costCenters[i], originalCostCenters, costCenters, accessToken)
            setProgressValue((prev) => prev + 1)
        }
    }

    const createCostCenter = async (costCenter: CostCenterDataBundle, topLevelCostCenter: CostCenterDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const body = {
                name: costCenter.name,
                parentId: topLevelCostCenter.id,
                ...(costCenter.billingcode && {billingCode: costCenter.billingcode}),
            }

            const response = await RestCentral.post(baseURL, headers, body)
            costCenter.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to create cost center`)
            console.log(e)
            postMessage(new Message(`Failed to create cost center ${costCenter.name}. ${e.error ?? ''}`, 'error'))
            postError(new SyncError(costCenter.name, 0, ['Failed to create cost center', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const updateCostCenter = async (costCenter: CostCenterDataBundle, originalCostCenters: CostCenterDataBundle[], targetCostCenters: CostCenterDataBundle[], token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const originalParent = originalCostCenters.find((parent) => `${parent.id}` === `${costCenter.parentId}`)
            if (!originalParent) {
                postMessage(new Message(`Could not find parent cost center for ${costCenter.name}. May need correction`, 'warning'))
                postError(new SyncError(costCenter.name, '', ['Failed to find cost center parent', '']))
                return
            }

            const newParent = targetCostCenters.find((parent) => parent.name === originalParent.name)
            if (!newParent) {
                postMessage(new Message(`Could not find parent cost center for ${costCenter.name}. May need correction`, 'warning'))
                postError(new SyncError(costCenter.name, '', ['Failed to find cost center parent', '']))
                return
            }

            const body = {
                name: costCenter.name,
                parentId: newParent.id
            }

            const response = await RestCentral.patch(baseUpdateURL.replace('costCenterId', costCenter.id!), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to update cost center`)
            console.log(e)
            postMessage(new Message(`Failed to update cost center ${costCenter.name}. ${e.error ?? ''}`, 'error'))
            postError(new SyncError(costCenter.name, 0, ['Failed to update cost center', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {createCostCenters, progressValue, maxProgress}
}

export default useCreateCostCenters