import { useState } from "react";
import { Extension } from "../../../../../models/Extension";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { ERL } from "../../../Automatic Location Updates/models/ERL";

const useMigrateERLs = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/emergency-locations'
    const baseWaitingPeriod = 250
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(2)

    const migrateERLs = async (erls: ERL[], extensions: Extension[]) => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const translatedERLs = translateSites(erls, extensions)
        setMaxProgress(translatedERLs.length)

        for (let i = 0; i < translatedERLs.length; i++) {
            await migrateERL(translatedERLs[i], accessToken)
            setProgressValue((prev) => prev + 1)
        }

        return translatedERLs
    }

    const translateSites = (erls: ERL[], extensions: Extension[]) => {
        const translatedERLs: ERL[] = []

        for (let erl of erls) {

            if (!erl.site) {
                translatedERLs.push(erl)
                continue
            }

            if (erl.site.name === 'Main Site') {
                translatedERLs.push(erl)
                continue
            }

            const siteExtension = extensions.find((ext) => ext.prettyType() === 'Site' && ext.data.name === erl.site.name)
            if (!siteExtension) {
                postMessage(new Message(`ERL ${erl.name} cannot be migrated because the site it's assigned to (${erl.site.name}) does not exist`, 'error'))
                postError(new SyncError(erl.name, 0, ['ERL not migrated', '']))
                continue
            }

            erl.site.id = `${siteExtension.data.id}`
            translatedERLs.push(erl)
        }

        return translatedERLs
    }

    const migrateERL = async (erl: ERL, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.post(baseURL, headers, erl)
            erl.id = response.data.id

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to create ERL`)
            console.log(e)
            postMessage(new Message(`Failed to create ERL ${erl.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(erl.name, 0, ['Failed to create ERL', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {migrateERLs, maxProgress, progressValue}
}

export default useMigrateERLs