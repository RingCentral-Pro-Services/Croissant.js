import ExtensionIsolator from "../../../../helpers/ExtensionIsolator";
import { AudioPrompt } from "../../../../models/AudioPrompt";
import { IVRAction, IVRaudioPrompt, IVRDestination, IVRMenu, IVRMenuData, IVRPrompt, Site } from "../../../../models/IVRMenu";
import { Message } from "../../../../models/Message";
import RCExtension from "../../../../models/RCExtension";
import { SyncError } from "../../../../models/SyncError";
import { MessageQueue, Transformer } from "../../../../models/Transformer";

export class IVRTransformer implements Transformer<IVRMenu> {

    // Maps the BRD's keypress actions to Service Web's keywords
    actionMap: {[key: string]: string} = {
        "Connect To IVR": "Connect",
        "Connect To Queue": "Connect",
        "Connect To Extension": "Connect",
        "Transfer to Voicemail of": "Voicemail",
        "Connect to Dial-by-Name Directory": "DialByName",
        "External Transfer": "Transfer",

        "Repeat the Menu": "Repeat",
        "Return to the Previous Menu": "ReturnToPrevious",
        "Return to the Root Menu": "ReturnToRoot",

        "Dial by first name": "DialByName",
        "Transfer to auto-attendant": "Connect",
        "Transfer to extension": "Connect",
    }
    extensionIsolator = new ExtensionIsolator()

    constructor(private extensionList: RCExtension[], private audioPromptList: AudioPrompt[], public messageQueue?: MessageQueue) {}

    transform(data: any[]): IVRMenu[] {
        if (!data || data.length === 0) {
            return []
        }

        let records: IVRMenu[] = []

        for (let index = 0; index < data.length; index++) {
            let currentItem = data[index]
            let actions = this.getActions(data[index], this.extensionList)
            let site = this.getSite(currentItem['Site'], this.extensionList)
            let prompt = this.getPrompt(currentItem['Menu Name'], currentItem['Menu Ext'], currentItem['Prompt Name/Script'], this.audioPromptList)
            const existingID = this.idForExtension(currentItem['Menu Ext'], this.extensionList)
            let menuData: IVRMenuData = {
                uri: "",
                name: currentItem['Menu Name'],
                extensionNumber: currentItem['Menu Ext'],
                prompt: prompt,
                site: site,
                actions: actions,
                id: `${existingID === 0 ? this.randomID() : existingID}`
            }
            let menu = new IVRMenu(menuData)
            if (!menu.data.name || menu.data.name === '' || menu.data.name === 'undefined') {
                this.messageQueue?.postMessage(new Message('Validation: Missing menu name', 'error'))
                continue
            }
            if (!menu.data.extensionNumber) {
                this.messageQueue?.postMessage(new Message('Validation: Missing extension number', 'error'))
                continue
            }
            if (prompt.audio) {
                menu.audioPromptFilename = currentItem['Prompt Name/Script']
            }
            records.push(menu)
        }

        return records
    }

    getSite = (siteName: string, extensionList: RCExtension[]) => {
        let site: Site = {
            name: "Main Site",
            id: "main-site"
        }

        const sites = extensionList.filter((extension) => extension.prettyType[extension.type] === 'Site')

        for (let index = 0; index < sites.length; index++) {
            if (sites[index].name.trim() === siteName.trim()) {
                site.id = `${sites[index].id}`
                site.name = siteName
            }
        }

        return site
    }

    getPrompt = (menuName: string, extensionNumber: string, rawText: string, audioPromptList: AudioPrompt[]) => {
        let prompt: IVRPrompt = {
            mode: "",
            text: ""
        }

        if (rawText.includes('.mp3') || rawText.includes('.wav')) {
            const audio = this.getIVRAudioPrompt(rawText.trim(), audioPromptList)
            if (audio.id === '') {
                prompt.mode = 'TextToSpeech'
                prompt.text = 'Thank you for calling.'
                this.messageQueue?.postMessage(new Message(`Audio prompt '${rawText}' could not be found in the account. Building with text-to-speech prompt instead`, 'warning'))
                this.messageQueue?.postError(new SyncError(menuName, parseInt(extensionNumber), ['Could not find audio prompt', rawText]))
            }
            else {
                prompt.mode = 'Audio'
                prompt.audio = audio
                delete prompt.text
            }
        }
        else {
            prompt.mode = 'TextToSpeech'
            prompt.text = this.sanitizedPrompt(rawText)
        }

        return prompt
    }

    getActions = (data: any, extensionList: RCExtension[]) => {
        let actions: IVRAction[] = []

        for (let keyPressIndex = 0; keyPressIndex < 10; keyPressIndex++) {
            let actionKey = `Key ${keyPressIndex} Action`
            let destinationKey = `Key ${keyPressIndex} Destination`

            if (actionKey in data) {
                const translatedAction = this.actionMap[data[actionKey]]

                if (translatedAction!= undefined && translatedAction !== "") {
                    if (translatedAction !== 'DialByName') {
                        let rawDestination = data[destinationKey]

                        if (!rawDestination || rawDestination === '') {
                            postMessage(new Message(`Key press ${keyPressIndex} was removed from menu ${data['Menu Name']} because it's missing a destination`, 'error'))
                            continue
                        }

                        let destination = ""
                        if (translatedAction !== "Transfer") {
                            if (rawDestination != undefined) {
                                destination = this.extensionIsolator.isolateExtension(rawDestination.toString()) ?? ""
                            }
                        }
                        else {
                            // The destination is a phone number. Use dumb isolation
                            destination = rawDestination.toString().replace(/\D/g,'')
                        }
                        let extension: IVRDestination = {
                            id: destination,
                        }
                        let action: IVRAction = {
                            input: `${keyPressIndex}`,
                            action: translatedAction,
                            extension: extension,
                            phoneNumber: destination
                        }
                        if (action.action === 'DialByName') {
                            delete action.extension
                            delete action.phoneNumber
                        }
                        else if (action.action === 'Transfer') {
                            delete action.extension
                        }
                        else {
                            delete action.phoneNumber
                        }

                        actions.push(action)
                    }
                    else {
                        let action: IVRAction = {
                            input: `${keyPressIndex}`,
                            action: translatedAction
                        }
                        actions.push(action)
                    }
                }
            }
        }

        return actions
    }

    getIVRAudioPrompt = (filename: string, audioPromptList: AudioPrompt[]) => {
        let result: IVRaudioPrompt = {
            uri: "",
            id: ""
        }

        const filenameWithoutExtension = filename.replaceAll('.mp3', '').replaceAll('.wav', '')

        for (const prompt of audioPromptList) {
            if ([filename, filenameWithoutExtension].includes(prompt.filename)) {
                result.id = prompt.id
                result.uri = prompt.uri
            }
        }

        return result
    }

    randomID = () => {
        return Math.floor(Math.random() * 1000000)
    }

    idForExtension = (extension: string, extensionsList: RCExtension[]) => {
        const nonSites = extensionsList.filter((ext) => ext.prettyType[ext.type] != 'Site')

        if (extension === undefined) return 0
        for (let index = 0; index < nonSites.length; index++) {
            if (`${nonSites[index].extensionNumber}` === extension.toString().trim()) {
                return nonSites[index].id
            }
        }
        return 0
    }

    idForSite = (siteName: string, extensionList: RCExtension[]) => {
        if (siteName.toLowerCase() === 'main site') return 'main-site'

        const sites = extensionList.filter((extension) => extension.prettyType[extension.type] === 'Site')

        for (let index = 0; index < sites.length; index++) {
            if (sites[index].name.trim() === siteName.trim()) {
                return sites[index].id
            }
        }
        return 0
    }

    /**
     * Remove any invalid characters from the prompt
     * @param {String} prompt The prompt to be sanitized
     * @returns The sanitized prompt as a string
     */
    sanitizedPrompt = (prompt: any) => {
        if (prompt === undefined) return
        let result = prompt.replaceAll("_", "-")
        result = result.replaceAll("*", "star")
        result = result.replaceAll("#", "pound")
        result = result.replaceAll("@", "at")
        result = result.replaceAll("&", "and")
        result = result.replaceAll("(", "")
        result = result.replaceAll(")", "")
        result = result.replaceAll("%", "")
        result = result.replaceAll("$", "")
        result = result.replaceAll("!", ".")
        result = result.replaceAll("?", ".")
        result = result.replaceAll(":", "")
        result = result.replaceAll(";", "")
        return result
    }

}