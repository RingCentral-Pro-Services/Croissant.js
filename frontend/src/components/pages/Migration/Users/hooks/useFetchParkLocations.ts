import { useState } from "react";
import { wait } from "../../../../../helpers/rcapi";
import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { ParkLocationDataBundle, ParkLocationMember } from "../models/ParkLocationDataBundle";

const useFetchParkLocations = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)
    const baseMembersURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/park-locations/parkLocationId/users'
    const baseWaitingPeriod = 250

    const fetchParkLocations = async (extensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        setProgressValue(0)
        setMaxProgress(extensions.length)
        let bundles: ParkLocationDataBundle[] = []
        for (const extension of extensions) {
            bundles.push(new ParkLocationDataBundle(extension))
        }

        for (let i = 0; i < bundles.length; i++) {
            await fetchMembers(bundles[i], accessToken)
            setProgressValue((prev) => prev + 1)
        }

        return bundles

    }

    const fetchMembers = async (bundle: ParkLocationDataBundle, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(baseMembersURL.replace('parkLocationId', `${bundle.extension.data.id}`), headers)
            const members = response.data.records as ParkLocationMember[]
            bundle.members = members

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to fetch park location members`)
            console.log(e)
            postMessage(new Message(`Failed to fetch members for park location ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, 0, ['Failed to get members', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    return {fetchParkLocations, progressValue, maxProgress}
}

export default useFetchParkLocations