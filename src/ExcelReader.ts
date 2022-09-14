import ExtensionIsolator from './ExtensionIsolator'
import IVRMenu from './IVRMenu'
import IVRKeyPress from './IVRKeyPress'
import SpecialKeyPress from './SpecialKeyPress'

var reader = require('xlsx')


/**
 * A class for reading the IVRs sheet of the BRD
 */
class ExcelReader {

    data: any[] = []

    // Maps the BRD's keypress actions to Service Web's keywords
    actionMap = {
        "Connect To IVR": "ForwardToExtension",
        "Connect To Queue": "ForwardToExtension",
        "Connect To Extension": "ForwardToExtension",
        "Transfer to Voicemail of": "ForwardToVoiceMail",
        "Connect to Dial-by-Name Directory": "ConnectToDialByNameDirectory",
        "External Transfer": "ForwardToExternal",
        "Repeat the Menu": "RepeatMenuGreeting",
        "Return to the Previous Menu": "ReturnToPreviousMenu",
        "Return to the Root Menu": "ReturnToRootMenu",
        "Dial by first name": "ConnectToDialByNameDirectory",
        "Transfer to auto-attendant": "ForwardToExtension",
        "Transfer to extension": "ForwardToExtension",
    }

    constructor(excelFilePath: string) {
        const file = reader.readFile(excelFilePath)
        this.data = []
        const sheets = file.SheetNames

        if (sheets.length == 1) {
            // This excel file only has one sheet. Assume it's the IVRs sheet
            const temp = reader.utils.sheet_to_json(
                file.Sheets[file.SheetNames[0]])
                temp.forEach((res: any) => {
                    this.data.push(res)
            })
        }
        else {
            // Search for the IVRs sheet
            for (let i = 0; i < sheets.length; i++) {
                if (file.SheetNames[i] == "IVRs") {
                    const temp = reader.utils.sheet_to_json(
                        file.Sheets[file.SheetNames[i]])
                        temp.forEach((res: any) => {
                            this.data.push(res)
                    })
                }
            }
        }
    }

    /**
     * Get an array of all IVR Menus read by the reader
     * @returns An array of IVRMenu objects
     */
    getMenus() {

        let menus = []
        const extensionIsolator = new ExtensionIsolator()

        for (let i = 0; i < this.data.length; i++) {
            let menuData = this.data[i]
            const menuName: string = menuData["Menu Name"]
            const prompt: string = menuData["Prompt Name/Script"]
            const extensionNumber = menuData["Menu Ext"]
            let menu = new IVRMenu(menuName, extensionNumber, prompt)
            // let menu = new IVRMenu(menuData["Menu Name"] as string, menuData["Menu Ext"] as string, menuData["Prompt Name/Script"] as string)

            if (menu.prompt == undefined) {
                menu.prompt = "Thank you for calling"
            }

            if (menu.textToSpeech()) {
                menu.prompt = this.sanitizedPrompt(menu.prompt)
            }

            for (let keyPressIndex = 0; keyPressIndex < 10; keyPressIndex++) {
                let actionKey = "Key " + keyPressIndex + " Action"
                let destinationKey = "Key " + keyPressIndex + " Destination"

                if (actionKey in menuData) {
                    const translatedAction = this.actionMap[menuData[actionKey]]

                    // Only add the key press if the cell is not empty
                    // Regular expressions are probably a better solution here
                    if (translatedAction != "") {
                        if (translatedAction != "ConnectToDialByNameDirectory") {
                            if (!(destinationKey in menuData)) {
                                console.log('Uh-oh. Destination key not found for key ' + actionKey + 'in ' + menu.name)
                                console.log('Raw Action: ' + menuData[actionKey])
                                console.log('Translated Action: ' + translatedAction)
                            }
                            let rawDestination = menuData[destinationKey]
                            let destination = ""
                            if (translatedAction != "ForwardToExternal") {
                                destination = extensionIsolator.isolateExtension(rawDestination.toString()) ?? ""
                            }
                            else {
                                // The destination is a phone number. Use dumb isolation
                                destination = rawDestination.toString().replace(/\D/g,'')
                            }
                            let action = new IVRKeyPress(keyPressIndex, translatedAction, destination)
                            menu.actions.push(action)
                        }
                        else {
                            let destination = ""
                            let action = new IVRKeyPress(keyPressIndex, translatedAction, destination)
                            menu.actions.push(action)
                        }
                    }
                }
            }
            
            // Add # Key if present
            if ('Key # Press' in menuData) {
                let actionType = this.actionMap[(menuData['Key # Press'])]
                // Only add the key press if the cell is not empty
                // Regular expressions are probably a better solution here
                if (actionType != "") {
                    let specialKey = new SpecialKeyPress('#', actionType)
                    menu.specialKeys.push(specialKey)
                }
            }

            // Add * Key if present
            if ('Key * Press' in menuData) {
                let actionType = this.actionMap[(menuData['Key * Press'])]
                // Only add the key press if the cell is not empty
                // Regular expressions are probably a better solution here
                if (actionType != "") {
                    let specialKey = new SpecialKeyPress('*', actionType)
                    menu.specialKeys.push(specialKey)
                }
            }

            menus.push(menu)
        }
        return menus
    }

    /**
     * Remove any invalid characters from the prompt
     * @param {String} prompt The prompt to be sanitized
     * @returns The sanitized prompt as a string
     */
    sanitizedPrompt(prompt: any) {
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

export default ExcelReader