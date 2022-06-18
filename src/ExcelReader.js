var reader = require('xlsx')

var IVRMenu = require('./IVRMenu')
var IVRKeyPress = require('./IVRKeyPress')

class ExcelReader {

    //data = []

    constructor(excelFilePath) {
        const file = reader.readFile(excelFilePath)
        this.data = []
        const sheets = file.SheetNames

        for (let i = 0; i < sheets.length; i++) {
            if (file.SheetNames[i] == "IVRs") {
                console.log('Found IVRs sheet')

                const temp = reader.utils.sheet_to_json(
                    file.Sheets[file.SheetNames[i]])
                    temp.forEach((res) => {
                        this.data.push(res)
                })
            }
        }
    }

    getMenus() {

        let menus = []

        for (let i = 0; i < this.data.length; i++) {
            let menuData = this.data[i]
            let menu = new IVRMenu(menuData["Menu Name"], menuData["Menu Ext"], menuData["Prompt Name/Script"])

            for (let keyPressIndex = 0; keyPressIndex < 10; keyPressIndex++) {
                let actionKey = "Key " + keyPressIndex + " Action"
                let destinationKey = "Key " + keyPressIndex + " Destination"

                if (actionKey in menuData) {
                    let translatedAction = this.translateMenuAction(menuData[actionKey])

                    if (translatedAction != "ConnectToDialByNameDirectory") {
                        let rawDestination = menuData[destinationKey]
                        let destination = rawDestination.replace(/\D/g,'')
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
        else if (rawAction == "Connect To Dial-By-Name Directory") {
            return "ConnectToDialByNameDirectory"
        }
        else if (rawAction == "External Transfer") {
            return "ForwardToExternal"
        }
        else {
            return "ForwardToExtension"
        }
    }

}

module.exports = ExcelReader