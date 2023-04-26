import { useState } from "react"
import ExtensionIsolator from "../helpers/ExtensionIsolator"
import { AudioPrompt } from "../models/AudioPrompt"
import { IVRAction, IVRaudioPrompt, IVRDestination, IVRMenu, IVRMenuData, IVRPrompt, Site } from "../models/IVRMenu"
import { Message } from "../models/Message"
import RCExtension from "../models/RCExtension"
import { SyncError } from "../models/SyncError"

const useExcelToIVRs = (postMessage: (message: Message) => void, postError: (error: SyncError) => void) => {
    const [menus, setMenus] = useState<IVRMenu[]>([])
    const [isMenuConvertPending, setPending] = useState(true)
    const extensionIsolator = new ExtensionIsolator()

    // Maps the BRD's keypress actions to Service Web's keywords
    const actionMap: {[key: string]: string} = {
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

    const converToMenus = (data: any[], extensionList: RCExtension[], audioPromptList: AudioPrompt[]) => {
        let records: IVRMenu[] = []

        for (let index = 0; index < data.length; index++) {
            let currentItem = data[index]
            let actions = getActions(data[index], extensionList)
            let site = getSite(currentItem['Site'], extensionList)
            let prompt = getPrompt(currentItem['Menu Name'], currentItem['Menu Ext'], currentItem['Prompt Name/Script'], audioPromptList)
            const existingID = idForExtension(currentItem['Menu Ext'], extensionList)
            let menuData: IVRMenuData = {
                uri: "",
                name: currentItem['Menu Name'],
                extensionNumber: currentItem['Menu Ext'],
                prompt: prompt,
                site: site,
                actions: actions,
                id: `${existingID === 0 ? randomID() : existingID}`
            }
            let menu = new IVRMenu(menuData)
            if (prompt.audio) {
                menu.audioPromptFilename = currentItem['Prompt Name/Script']
            }
            records.push(menu)
        }
        setMenus(records)
        setPending(false)
    }

    const getSite = (siteName: string, extensionList: RCExtension[]) => {
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

    const getPrompt = (menuName: string, extensionNumber: string, rawText: string, audioPromptList: AudioPrompt[]) => {
        let prompt: IVRPrompt = {
            mode: "",
            text: ""
        }

        // TODO: Check to see if the prompt is an audio prompt
        // Then get the URI of the audio prompt

        if (rawText.includes('.mp3') || rawText.includes('.wav')) {
            const audio = getIVRAudioPrompt(rawText.trim(), audioPromptList)
            if (audio.id === '') {
                prompt.mode = 'TextToSpeech'
                prompt.text = 'Thank you for calling.'
                postMessage(new Message(`Audio prompt '${rawText}' could not be found in the account. Building with text-to-speech prompt instead`, 'warning'))
                postError(new SyncError(menuName, parseInt(extensionNumber), ['Could not find audio prompt', rawText]))
            }
            else {
                prompt.mode = 'Audio'
                prompt.audio = audio
                delete prompt.text
            }
        }
        else {
            prompt.mode = 'TextToSpeech'
            prompt.text = sanitizedPrompt(rawText)
        }

        return prompt
    }

    const getActions = (data: any, extensionList: RCExtension[]) => {
        let actions: IVRAction[] = []

        for (let keyPressIndex = 0; keyPressIndex < 10; keyPressIndex++) {
            let actionKey = `Key ${keyPressIndex} Action`
            let destinationKey = `Key ${keyPressIndex} Destination`

            if (actionKey in data) {
                const translatedAction = actionMap[data[actionKey]]

                if (translatedAction!= undefined && translatedAction !== "") {
                    if (translatedAction !== 'DialByName') {
                        let rawDestination = data[destinationKey]
                        let destination = ""
                        if (translatedAction !== "Transfer") {
                            if (rawDestination != undefined) {
                                destination = extensionIsolator.isolateExtension(rawDestination.toString()) ?? ""
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

    const getIVRAudioPrompt = (filename: string, audioPromptList: AudioPrompt[]) => {
        let result: IVRaudioPrompt = {
            uri: "",
            id: ""
        }

        for (const prompt of audioPromptList) {
            if (prompt.filename === filename) {
                result.id = prompt.id
                result.uri = prompt.uri
            }
        }

        return result
    }

    const randomID = () => {
        return Math.floor(Math.random() * 1000000)
    }

    const idForExtension = (extension: string, extensionsList: RCExtension[]) => {
        if (extension === undefined) return 0
        for (let index = 0; index < extensionsList.length; index++) {
            if (`${extensionsList[index].extensionNumber}` === extension.toString().trim()) {
                return extensionsList[index].id
            }
        }
        return 0
    }

    const idForSite = (siteName: string, extensionList: RCExtension[]) => {
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
     const sanitizedPrompt = (prompt: any) => {
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

    return {menus, isMenuConvertPending, converToMenus}
}

export default useExcelToIVRs