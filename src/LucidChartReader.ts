import IVRMenu from "./IVRMenu";
import ExtensionIsolator from "./ExtensionIsolator";
import IVRKeyPress from "./IVRKeyPress";

const parser = require('csv-parser')
const fs = require('fs');

export default class LucidChartReader {

    rowData: any = []
    menus: IVRMenu[] = []
    done = false
    pageMap: {[key: string]: string} = {}
    filepath: string
    extensionRegex = /(x)\d+/gi  // Matches x-denoted extension numbers (Ex. x4796)
    extRegex = /(ext)(.?)\s\d+/gi  // Matches "ext." followed by numbers (Ex. ext. 4796)
    extTBD = /(ext[.]?)([\s]?tbd[\s]?[\d]?)/gi


    constructor(filepath: string) {
        this.filepath = filepath
        this.rowData = []
    }

    /**
     * Get all menus in the LucidChart CSV
     * @returns An array of IVRMenus
     */
    getMenus() {
        return new Promise((resolve, reject) => {
            const _menus = [];
            fs.createReadStream(this.filepath)
                .pipe(parser({}))
                .on('data', (data: any) => this.rowData.push(data))
                .on('end', () => {
                    this.createPageMap()
                    this.createMenus()
                    this.addKeyPresses()
                    resolve(this.menus);
                });
        });
    }

    createPageMap() {
        for (let index = 0; index < this.rowData.length; index++) {
            if (this.rowData[index]["Name"] == "Page") {
                let name = this.rowData[index]["Text Area 1"]
                let id = this.rowData[index]["Id"] as string
                this.pageMap[id] = name
            }
        }
    }

    /**
     * Loop through row data and create IVR menus
     */
    createMenus() {
        let isolator = new ExtensionIsolator()
        for (let index = 0; index < this.rowData.length; index++) {
            if (this.rowData[index]["Name"] == "IVR") {
                let shapeText = this.rowData[index]["Text Area 1"]

                let extensionNumber = isolator.isolateExtension(shapeText.toString()) ?? ""
                let extensionName = shapeText.replace(this.extRegex, "")
                extensionName = extensionName.replace(this.extensionRegex, "")
                extensionName = extensionName.replace(this.extTBD, "")
                extensionName = extensionName.replace("\n", "")

                let id = this.rowData[index]["Id"]
                const pageName = this.pageMap[this.rowData[index]["Page ID"]]

                let menu = new IVRMenu(extensionName, extensionNumber, "Thank you for calling.")
                menu.id = id
                menu.page = pageName
                
                if (!this.hasMenu(menu.extensionNumber)) {
                    this.menus.push(menu)
                }
            }
        }
    }

    /**
     * Loop through the row data and add key presses to menus
     */
    addKeyPresses() {
        for(let index = 0; index < this.rowData.length; index++) {
            if (this.rowData[index]["Name"] == "Line") {
                let lineSourceID = this.rowData[index]["Line Source"]
                let lineDestinationID = this.rowData[index]["Line Destination"]
                let key = this.rowData[index]["Text Area 1"]

                for (let menuIndex = 0; menuIndex < this.menus.length; menuIndex++) {
                    if (this.menus[menuIndex]["id"] == lineSourceID) {
                        let destinationType = this.getExtensionTypeForID(lineDestinationID)
                        let extensionNumber = this.getExtensionNumberForID(lineDestinationID)

                        if (destinationType == "External Transfer") {
                            // Create an external transfer action and add it to the menu
                            let externalNumber = this.getExternalNumberForID(lineDestinationID)
                            let action = new IVRKeyPress(key, "ForwardToExternal", externalNumber ?? "")
                            this.menus[menuIndex].actions.push(action)
                        }
                        else if (destinationType == "Dial-by-Name") {
                            // Create a dial-by-name action and add it to the menu
                            let action = new IVRKeyPress(key, "ConnectToDialByNameDirectory", "")
                            this.menus[menuIndex].actions.push(action)
                        }
                        else if (destinationType == "Message Only Extension") {
                            let action = new IVRKeyPress(key, "ForwardToVoiceMail", extensionNumber ?? "")
                            this.menus[menuIndex].actions.push(action)
                        }
                        else if (destinationType == "Prompts") {
                            this.menus[menuIndex].prompt = this.getPromptForID(lineDestinationID)
                        }
                        else {
                            let action = new IVRKeyPress(key, "ForwardToExtension", extensionNumber ?? "")
                            this.menus[menuIndex].actions.push(action)
                        }
                    }
                }
            }
        }
    }

    /**
     * Get the extension number associated with a given ID
     * @param {string} id The ID of the shape
     * @returns The extension number that corresponds with the given ID
     */
    getExtensionNumberForID(id: string) {
        let isolator = new ExtensionIsolator()
        for (let index = 0; index < this.rowData.length; index++) {
            if (this.rowData[index]["Id"] == id) {
                let rawText = this.rowData[index]["Text Area 1"]
                let extensionNumber = isolator.isolateExtension(rawText.toString())
                return extensionNumber
            }
        }
    }

    /**
     * Get the extension name assiciated with a given ID
     * @param {string} id The ID of the entiry
     * @returns The extension name that corresponds with the given ID
     */
    getExtensionNameforID(id: string) {
        for (let index = 0; index < this.rowData.length; index++) {
            if (this.rowData[index]["Id"] == id) {
                let rawText = this.rowData[index]["Text Area 1"]
                let extensionName = rawText.replace(this.extRegex, "")
                extensionName = extensionName.replace(this.extensionRegex, "")
                extensionName = extensionName.replace("\n", "")
                return extensionName
            }
        }
    }

    /**
     * Get the extension type associated with a given ID
     * @param {string} id The ID of the entity
     * @returns The extension type that corresponds to the given ID
     */
    getExtensionTypeForID(id: string) {
        for (let index = 0; index < this.rowData.length; index++) {
            if (this.rowData[index]["Id"] == id) {
                return this.rowData[index]["Name"]
            }
        }
    }

    /**
     * Get the external phone number associated with a given ID
     * @param {string} id The ID of the entity
     * @returns The phone number that corresponds to thte given ID
     */
    getExternalNumberForID(id: string) {
        const isolator = new ExtensionIsolator()

        for (let index = 0; index < this.rowData.length; index++) {
            if (this.rowData[index]["Id"] == id) {
                return isolator.isolatePhoneNumber(this.rowData[index]["Text Area 1"])
            }
        }
    }

    /**
     * Get the extension number 
     * @param {string} name The name of the menu
     * @returns The extension number associated with the given menu name or -1
     * if not found
     */
    getExtensionforMenuName(name: string) {
        for (let index = 0; index < this.menus.length; index++) {
            if (this.menus[index].name == name) {
                return this.menus[index].extensionNumber
            }
        }
        console.log(`No extension for: ${name}|`)
        return -1
    }

    /**
     * Get the prompt associated with the given ID
     * @param {string} id The ID of the prompt shape
     * @returns The prompt associated with the give ID, or an empty string if not found
     */
    getPromptForID(id: string) {
        for (let index = 0; index < this.rowData.length; index++) {
            if (this.rowData[index]["Id"] == id) {
                return this.rowData[index]["Text Area 1"].replace("IVR Prompt: \n", "")
            }
        }
        return ""
    }

    /**
     * Check whether or now a menu with the same extension
     * already exists in the array.
     * @param {string} extensionNumber The extension number of the menu
     * @returns True if a menu with the same extension already exists in the array
     */
    hasMenu(extensionNumber: string) {
        for (let index = 0; index < this.menus.length; index++) {
            if (this.menus[index]["extensionNumber"] == extensionNumber) {
                return true
            }
        }
        return false
    }

    /**
     * Generate a random extension number
     * @param length The length of the generated extension number
     * @returns The generated extension number 
     */
    generateRandomExtension(length: number) {
        const floor = this.generateFloor(length)
        const ceiling = this.generateCeiling(length)
        return Math.floor(Math.random() * parseInt(ceiling)) + parseInt(floor);
    }

    /**
     * Generate the minumum bound of the generated extension number
     * @param length The length of the generated extension number
     * @returns The minimum bound of the generated extension number
     */
    generateFloor(length: number) {
        let floor = "1"

        for (let count = 1; count < length; count++) {
            // Append a 1 to the floor
            floor += "1"
        }
        return floor
    }

    /**
     * Generate the maximum bound of the generated extension number
     * @param length The length of the generated extension number
     * @returns The maximum bound of the generated extension number
     */
    generateCeiling(length: number) {
        let ceiling = "9"

        for (let count = 1; count < length; count++) {
            // Append a 1 to the floor
            ceiling += "9"
        }
        return ceiling
    }
}