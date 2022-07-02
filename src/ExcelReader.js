var reader = require('xlsx')
var IVRMenu = require('./IVRMenu')
var IVRKeyPress = require('./IVRKeyPress')
var SpecialKeyPress = require('./SpecialKeyPress')

/**
 * A class for reading the IVRs sheet of the BRD
 */
class ExcelReader {

    extensionRegex = /(x)\d+/g  // Matches x-denoted extension numbers (Ex. x4796)
    extRegex = /(ext)\s\d+/g    // Matches "ext" followed by numbers (Ex. ext 4796)
    extRegex2 = /(ext.)\s\d+/g  // Matches "ext." followed by numbers (Ex. ext. 4796)

    constructor(excelFilePath) {
        const file = reader.readFile(excelFilePath)
        this.data = []
        const sheets = file.SheetNames

        for (let i = 0; i < sheets.length; i++) {
            if (file.SheetNames[i] == "IVRs") {
                const temp = reader.utils.sheet_to_json(
                    file.Sheets[file.SheetNames[i]])
                    temp.forEach((res) => {
                        this.data.push(res)
                })
            }
        }
    }

    /**
     * Get an array of all IVR Menus read by the reader
     * @returns An array of IVRMenu objects
     */
    getMenus() {

        let menus = []

        for (let i = 0; i < this.data.length; i++) {
            let menuData = this.data[i]
            let menu = new IVRMenu(menuData["Menu Name"], menuData["Menu Ext"], menuData["Prompt Name/Script"])

            if (menu.textToSpeech) {
                menu.prompt = this.sanitizedPrompt(menu.prompt)
            }

            for (let keyPressIndex = 0; keyPressIndex < 10; keyPressIndex++) {
                let actionKey = "Key " + keyPressIndex + " Action"
                let destinationKey = "Key " + keyPressIndex + " Destination"

                if (actionKey in menuData) {
                    let translatedAction = this.translateMenuAction(menuData[actionKey])

                    if (translatedAction != "ConnectToDialByNameDirectory") {
                        if (!(destinationKey in menuData)) {
                            console.log('Uh-oh. Destination key not found for key ' + actionKey + 'in ' + menu.name)
                            console.log('Raw Action: ' + menuData[actionKey])
                            console.log('Translated Action: ' + translatedAction)
                        }
                        let rawDestination = menuData[destinationKey]
                        let destination = ""
                        if (translatedAction != "ForwardToExternal") {
                            destination = this.isolateExtension(rawDestination)
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
            
            // Add # Key if present
            if ('Key # Press' in menuData) {
                let actionType = this.translateMenuAction(menuData['Key # Press'])
                let specialKey = new SpecialKeyPress('#', actionType)
                menu.specialKeys.push(specialKey)
            }

            // Add * Key if present
            if ('Key * Press' in menuData) {
                let actionType = this.translateMenuAction(menuData['Key * Press'])
                let specialKey = new SpecialKeyPress('*', actionType)
                menu.specialKeys.push(specialKey)
            }

            menus.push(menu)
        }
        return menus
    }

    /*
    Translate the BRD's keypress actions into the portal's keywords
    */
    translateMenuAction(rawAction) {
        if (rawAction == "Connect To IVR") {
            return "ForwardToExtension"
        }
        else if (rawAction == "Connect To Queue") {
            return "ForwardToExtension"
        }
        else if (rawAction == "Connect To Extension") {
            return "ForwardToExtension"
        }
        else if (rawAction == "Transfer to Voicemail of") {
            return "ForwardToVoiceMail"
        }
        else if (rawAction == "Connect to Dial-by-Name Directory") {
            return "ConnectToDialByNameDirectory"
        }
        else if (rawAction == "External Transfer") {
            return "ForwardToExternal"
        }
        else if (rawAction == "Repeat the Menu") {
            return "RepeatMenuGreeting"
        }
        else if (rawAction == "Return to the Previous Menu") {
            return "ReturnToPreviousMenu"
        }
        else if (rawAction == "Return to the Root Menu") {
            return "ReturnToRootMenu"
        }
        else {
            return "ForwardToExtension"
        }
    }

    /**
     * Remove any invalid characters from the prompt
     * @param {String} prompt The prompt to be sanitized
     * @returns The sanitized prompt as a string
     */
    sanitizedPrompt(prompt) {
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
        return result
    }

    /**
     * Get the extension number from the destination string
     * @param {string} rawDestination A string containing the raw destination data
     * @returns The isolated extension number as a string
     */
    isolateExtension(rawDestination) {
        if (this.containsXDenotedExtension(rawDestination)) {
            // This part contains an 'x' followed by a number (Ex. x4250). This is likely the extension number
            const result = rawDestination.match(this.extensionRegex).toString().replace(/\D/g,'')
            console.log(`Raw Destination contains x[Number] extension format`)
            console.log(`Raw: ${rawDestination}`)
            console.log(`Result: ${result}`)
            console.log("----------------------------")
            return result
        }
        else if (rawDestination.includes("-")) {
            // Split the string at the hyphen
            let destinationParts = rawDestination.split("-")

            for (let index = 0; index < destinationParts.length; index++) {
                if (this.containsExt(destinationParts[index])) {
                    // This part contains "Ext." This is likely the extension number
                    let result = destinationParts[index].toString().replace(/\D/g,'')
                    console.log(`Part contains Ext. Extension likely found. (${result})`)
                    console.log(`Raw: ${rawDestination}`)
                    console.log(`Result: ${result}`)
                    console.log("----------------------------")
                    return result
                }
                else if (!this.hasLetters(destinationParts[index])) {
                    // This part contains only numbers. This is likely the extension number
                    // It is legal for extension names to contain only numbers, but it's uncommon
                    let result = destinationParts[index].toString().replace(/\D/g,'')
                    console.log(`Part contains only numbers. Extension likely found`)
                    console.log(`Raw: ${rawDestination}`)
                    console.log(`Result: ${result}`)
                    console.log("----------------------------")
                    return result
                }
                else if (this.containsXDenotedExtension(destinationParts[index])) {
                    // This part contains an 'x' followed by a number (Ex. x4250). This is likely the extension number
                    const result = destinationParts[index].match(this.extensionRegex).toString().replace(/\D/g,'')
                    console.log(`Part contains x[Number] extension format`)
                    console.log(`Raw: ${rawDestination}`)
                    console.log(`Result: ${result}`)
                    console.log("----------------------------")
                    return result
                }
            }
        }
        else {
            // The raw restination doesn't contain a hyphen, fallback to dumb isolation
            // just removing any characters that aren't numbers
            console.log("Raw destination does not contain a hyphen. Using dumb isolation")
            console.log(`Raw: ${rawDestination}`)
            console.log(`Result: ${rawDestination.toString().replace(/\D/g,'')}`)
            console.log("-------------------------------------")
            return rawDestination.toString().replace(/\D/g,'')
        }
    }

    /**
     * Check whether or not the input string contains numbers
     * @param {string} input The input string
     * @returns True if the input string contains numbers, false otherwise
     */
    hasNumber(input) {
        return /\d/.test(input);
    }

    /**
     * Check whether or not the input string contains letters
     * @param {string} input The input string
     * @returns True if the input string contains letters, false otherwise
     */
    hasLetters(input) {
        return /[a-zA-Z]/g.test(input)
    }

    /**
     * Check whether or not the input string contains an x-denoted extension number
     * For example, x4796
     * @param {string} input The input string
     * @returns True if the input string contains an x-denoted extension number
     */
    containsXDenotedExtension(input) {
        return /(x)\d+/g.test(input)
    }

    /**
     * Check whether or not the input string contains an number preceded by "ext"
     * @param {string} input The input string
     */
    containsExt(input) {
        if (this.extRegex.test(input.toLowerCase())) {
            return true
        }
        else if (this.extRegex2.test(input.toLowerCase())) {
            return true
        }
        return false
    }

}

module.exports = ExcelReader