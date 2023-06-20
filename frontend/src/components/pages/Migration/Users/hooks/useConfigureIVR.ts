import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import { RestCentral } from "../../../../../rcapi/RestCentral"
import { IVRDataBundle, IVRKey, IVRPrompt } from "../models/IVRDataBundle"
import { IVRAudioPrompt } from "../models/IVRPrompt"

const useConfigureIVR = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const baseUpdateURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/ivr-menus/ivrMenuId'
    const baseWaitingPeriod = 250

    const configureIVR = async (bundle: IVRDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], originalPrompts: IVRAudioPrompt[], targetPrompts: IVRAudioPrompt[]) => {
        if (bundle.hasEncounteredFatalError) return
        
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        await setKeyPresses(bundle, originalExtensions, targetExtensions, accessToken)
        const prompt = adjustPrompt(bundle, bundle.extendedData?.ivrData!.prompt!, originalPrompts, targetPrompts)
        await setPrompt(bundle, prompt, accessToken)
    }

    const setKeyPresses = async (bundle: IVRDataBundle, originalExtensions: Extension[], targetExtensions: Extension[], token: string) => {
        if (!bundle.extendedData?.ivrData?.actions) return
        
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const goodKeyPresses: IVRKey[] = []
            for (const key of bundle.extendedData?.ivrData?.actions) {
                if (key.action !== 'Connect' && key.action !== 'Voicemail') {
                    // This key press does not route to an extension. Add it to the array and continue
                    if (key.extension) {
                        delete key.extension
                    }
                    goodKeyPresses.push(key)
                    continue
                }

                const originalExtension = originalExtensions.find((ext) => `${ext.data.id}` === key.extension?.id)
                if (!originalExtension) {
                    postMessage(new Message(`Key press ${key.input} cannot be added to menu ${bundle.extension.data.name} because the original ID could not be found`, 'warning'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to add key press', `Key ${key.input}`]))
                    continue
                }

                const newExtension = targetExtensions.find((ext) => ext.data.name === originalExtension?.data.name && ext.prettyType() === originalExtension.prettyType())
                if (!newExtension) {
                    postMessage(new Message(`Key press ${key.input} cannot be added to menu ${bundle.extension.data.name} because the new ID could not be found`, 'warning'))
                    postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Failed to add key press', `Key ${key.input}`]))
                    continue
                }

                key.extension!.id = `${newExtension.data.id}`
                delete key.extension!.name
                delete key.extension!.uri
                goodKeyPresses.push(key)
            }

            if (goodKeyPresses.length === 0) return

            const body = {
                actions: goodKeyPresses
            }

            const response = await RestCentral.put(baseUpdateURL.replace('ivrMenuId', `${bundle.extension.data.id}`), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set key presses`)
            console.log(e)
            postMessage(new Message(`Failed to set key presses ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError(bundle.extension.data.name, parseInt(bundle.extension.data.extensionNumber), ['Failed to set key presses', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const setPrompt = async (bundle: IVRDataBundle, prompt: IVRPrompt, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                prompt: prompt
            }

            const response = await RestCentral.put(baseUpdateURL.replace('ivrMenuId', `${bundle.extension.data.id}`), headers, body)

            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to set IVR prompt`)
            console.log(e)
            postMessage(new Message(`Failed to set IVR prompt ${bundle.extension.data.name} ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to IVR prompt', bundle.extension.data.name], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const adjustPrompt = (bundle: IVRDataBundle, prompt: IVRPrompt, originalPromptsList: IVRAudioPrompt[], targetPromptsList: IVRAudioPrompt[]) => {
        if (!prompt) {
            const newPrompt: IVRPrompt = {
                mode: 'TextToSpeech',
                text: 'Thank you for calling'
            }
            return newPrompt
        }

        if (prompt.mode !== 'Audio') {
            if (prompt.audio) delete prompt.audio
            return prompt
        }

        const originalPrompt = originalPromptsList.find((currentPrompt) => `${currentPrompt.id}` === prompt.audio?.id)
        if (!originalPrompt) {
            postMessage(new Message(`Audio prompt for ${bundle.extension.data.name} was not found in old account. Using text-to-speech instead`, 'warning'))
            postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Audio prompt not found', '']))
            prompt.text = 'Thank you for calling.'
            prompt.mode = 'TextToSpeech'
            delete prompt.audio
            return prompt
        }

        const newPrompt = targetPromptsList.find((currentPrompt) => currentPrompt.filename === originalPrompt?.filename)
        if (!newPrompt) {
            postMessage(new Message(`Audio prompt for ${bundle.extension.data.name} was not found in target account. Using text-to-speech instead`, 'warning'))
            postError(new SyncError(bundle.extension.data.name, bundle.extension.data.extensionNumber, ['Audio prompt not found', '']))
            prompt.text = 'Thank you for calling.'
            prompt.mode = 'TextToSpeech'
            delete prompt.audio
            return prompt
        }

        prompt.audio!.id = newPrompt?.id
        if (prompt.text) delete prompt.text
        return prompt
    }

    const wait = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return {configureIVR}
}

export default useConfigureIVR