const parser = require('csv-parser')
const fs = require('fs');
const ExtensionIsolator = require('./ExtensionIsolator')
const IVRMenu = require('./IVRMenu')
const IVRKeyPress = require('./IVRKeyPress')

class LucidChartReader {

    rowData = []
    menus = []
    done = false
    extensionRegex = /(x)\d+/gi  // Matches x-denoted extension numbers (Ex. x4796)
    extRegex = /(ext)(.?)\s\d+/gi  // Matches "ext." followed by numbers (Ex. ext. 4796)


    constructor(filepath) {
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
                .on('data', (data) => this.rowData.push(data))
                .on('end', () => {
                    this.createMenus()
                    this.addKeyPresses()
                    resolve(this.menus);
                });
        });
    }

    /**
     * Loop through row data and create IVR menus
     */
    createMenus() {
        let isolator = new ExtensionIsolator()
        for (let index = 0; index < this.rowData.length; index++) {
            if (this.rowData[index]["Name"] == "IVR") {
                let shapeText = this.rowData[index]["Text Area 1"]
                let extensionNumber = isolator.isolateExtension(shapeText.toString())
                let extensionName = shapeText.replace(this.extRegex, "")
                extensionName = extensionName.replace(this.extensionRegex, "")
                extensionName = extensionName.replace("\n", "")

                let id = this.rowData[index]["Id"]

                let menu = new IVRMenu(extensionName, extensionNumber, "Thank you for calling.")
                menu.id = id
                
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
                            let action = new IVRKeyPress(key, "ForwardToExternal", externalNumber)
                            this.menus[menuIndex].actions.push(action)
                        }
                        else if (destinationType == "Dial-by-Name") {
                            // Create a dial-by-name action and add it to the menu
                            let action = new IVRKeyPress(key, "ConnectToDialByNameDirectory", "")
                            this.menus[menuIndex].actions.push(action)
                        }
                        else if (destinationType == "Message Only Extension") {
                            let action = new IVRKeyPress(key, "ForwardToVoiceMail", extensionNumber)
                            this.menus[menuIndex].actions.push(action)
                        }
                        else {
                            // Create a forward to extension action and add it to the menu
                            let action = new IVRKeyPress(key, "ForwardToExtension", extensionNumber)
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
    getExtensionNumberForID(id) {
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
    getExtensionNameforID(id) {
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
    getExtensionTypeForID(id) {
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
    getExternalNumberForID(id) {
        const isolator = new ExtensionIsolator()

        for (let index = 0; index < this.rowData.length; index++) {
            if (this.rowData[index]["Id"] == id) {
                return isolator.isolatePhoneNumber(this.rowData[index]["Text Area 1"])
            }
        }
    }

    /**
     * Check whether or now a menu with thet same extension
     * already exists in the array.
     * @param {string} extensionNumber The extension number of the menu
     * @returns True if a menu with the same extension already exists in the array
     */
    hasMenu(extensionNumber) {
        for (let index = 0; index < this.menus.length; index++) {
            if (this.menus[index]["extensionNumber"] == extensionNumber) {
                return true
            }
        }
        return false
    }
}

module.exports = LucidChartReader