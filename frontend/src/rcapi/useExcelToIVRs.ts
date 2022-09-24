import { useState } from "react"
import ExtensionIsolator from "../helpers/ExtensionIsolator"
import { IVRAction, IVRDestination, IVRMenu, IVRMenuData, IVRPrompt, Site } from "../models/IVRMenu"
import RCExtension from "../models/RCExtension"

const useExcelToIVRs = () => {
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
        "Repeat the Menu": "RepeatMenuGreeting",
        "Return to the Previous Menu": "ReturnToPreviousMenu",
        "Return to the Root Menu": "ReturnToRootMenu",
        "Dial by first name": "DialByName",
        "Transfer to auto-attendant": "Connect",
        "Transfer to extension": "Connect",
    }

    const converToMenus = (data: any[], extensionList: RCExtension[]) => {
        let records: IVRMenu[] = []

        for (let index = 0; index < data.length; index++) {
            let currentItem = data[index]
            let actions = getActions(data[index], extensionList)
            let site = getSite(currentItem['Site'], extensionList)
            let prompt = getPrompt(currentItem['Prompt Name/Script'])
            let menuData: IVRMenuData = {
                uri: "",
                name: currentItem['Menu Name'],
                extensionNumber: currentItem['Menu Ext'],
                prompt: prompt,
                site: site,
                actions: actions,
                id: `${idForExtension(currentItem['Menu Ext'], extensionList)}`
            }
            let menu = new IVRMenu(menuData)
            records.push(menu)
        }
        setMenus(records)
        setPending(false)
    }

    const getSite = (siteName: string, extensionList: RCExtension[]) => {
        let site: Site = {
            name: "",
            id: ""
        }

        for (let index = 0; index < extensionList.length; index++) {
            if (extensionList[index].name === siteName) {
                site.id = `${extensionList[index].id}`
            }
        }

        return site
    }

    const getPrompt = (rawText: string) => {
        let prompt: IVRPrompt = {
            mode: "",
            text: ""
        }

        // TODO: Check to see if the prompt is an audio prompt
        // Then get the URI of the audio prompt

        prompt.mode = 'TextToSpeech'
        prompt.text = sanitizedPrompt(rawText)

        return prompt
    }

    const getActions = (data: any, extensionList: RCExtension[]) => {
        let actions: IVRAction[] = []

        // TODO: Read actions from excel data...
        for (let keyPressIndex = 0; keyPressIndex < 10; keyPressIndex++) {
            let actionKey = `Key ${keyPressIndex} Action`
            let destinationKey = `Key ${keyPressIndex} Destination`

            if (actionKey in data) {
                const translatedAction = actionMap[data[actionKey]]

                if (translatedAction != "") {
                    if (translatedAction != 'DialByName') {
                        let rawDestination = data[destinationKey]
                        let destination = ""
                        if (translatedAction != "Transfer") {
                            destination = extensionIsolator.isolateExtension(rawDestination.toString()) ?? ""
                        }
                        else {
                            // The destination is a phone number. Use dumb isolation
                            destination = rawDestination.toString().replace(/\D/g,'')
                        }
                        let extension: IVRDestination = {
                            id: `${idForExtension(destination, extensionList)}`,
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

                        // Only add the keypress if the destination extension exists
                        // TODO: Present an error to the user
                        if (action.extension?.id !== `0`) {
                            actions.push(action)
                        }
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

    const idForExtension = (extension: string, extensionsList: RCExtension[]) => {
        for (let index = 0; index < extensionsList.length; index++) {
            if (`${extensionsList[index].extensionNumber}` === extension.toString().trim()) {
                return extensionsList[index].id
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