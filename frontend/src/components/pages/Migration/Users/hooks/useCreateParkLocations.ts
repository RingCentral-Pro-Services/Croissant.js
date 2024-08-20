import { useState } from "react";
import { wait } from "../../../../../helpers/rcapi";
import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { ParkLocationDataBundle, ParkLocationMember } from "../models/ParkLocationDataBundle";

const useCreateParkLocations = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const baseCreateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/extension'
    const baseMembersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/park-locations/parkLocationId/bulk-assign'
    const baseWaitingPeriod = 250

    const createParkLocations = async (bundles: ParkLocationDataBundle[], originalExtensions: Extension[], targetExtensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setMaxProgress(bundles.length)
        const createdExtensions: Extension[] = []

        for (let i = 0; i < bundles.length; i++) {

            await createParkLocation(bundles[i], accessToken)
            await setMembers(bundles[i], originalExtensions, targetExtensions, accessToken)
            createdExtensions.push(bundles[i].extension)
            setProgressValue((prev) => prev + 1)
        }

        return createdExtensions
    }

    const createParkLocation = async (bundle: ParkLocationDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const body = {
                contact: {
                    firstName: bundle.extension.data.name,
                    ... (bundle.extension.data.contact.email && {email: bundle.extension.data.contact.email})
                },
                type: 'ParkLocation',
                status: "Enabled"
            }
            const response = await RestCentral.post(baseCreateURL, headers, body)
            bundle.extension.data.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to create park location`)
            console.log(e)
            postMessage(new Message(`Failed to create park location ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to create park location', bundle.extension.data.name], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setMembers = async (bundle: ParkLocationDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        if (!bundle.members || bundle.members.length === 0) return

        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const goodMembers: string[] = []
            const badMembers: ParkLocationMember[] = []
            for (const member of bundle.members) {
                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === `${member.id}`)
                if (!originalExtension) {
                    // postMessage(new Message(`Failed to add ${member.name} ext. ${member.extensionNumber} to park location ${bundle.extension.data.name}. Old ID not found`, 'warning'))
                    // postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to add park location member. Old ID not found', `${member.extensionNumber}`]))
                    badMembers.push(member)
                    continue
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension.data.name && ext.prettyType() === originalExtension.prettyType())
                if (!newExtension) {
                    // postMessage(new Message(`Failed to add ${member.name} ext. ${member.extensionNumber} to park location ${bundle.extension.data.name}. New ID not found`, 'warning'))
                    // postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to add park location member. New ID not found', `${member.extensionNumber}`]))
                    badMembers.push(member)
                    continue
                }

                goodMembers.push(`${newExtension.data.id}`)
            }

            if (badMembers.length !== 0) {
                postMessage(new Message(`${badMembers.length} members could not be added to park location ${bundle.extension.data.name} because they could not be found`, 'warning'))
                postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to add park location members', badMembers.map((member) => member.name).join(', ')]))
            }

            if (goodMembers.length === 0) return

            const response = await RestCentral.post(baseMembersURL.replace('parkLocationId', `${bundle.extension.data.id}`), headers, {addedUserIds: goodMembers})

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to add group members`)
            console.log(e)
            postMessage(new Message(`Failed to add members to park location ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, '', ['Failed to add cpark location members', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {createParkLocations, progressValue, maxProgress}
}

export default useCreateParkLocations