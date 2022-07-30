const exceljs = require('exceljs')

class PrettyAuditWriter {
    auditData = []

    constructor(menus) {
        this.menus = menus
    }

    getData() {
        return new Promise((resolve, reject) => {
            const workbook = new exceljs.Workbook()
            workbook.xlsx.readFile("res/ivrs-brd.xlsx")
            .then (() => {
                workbook.clearThemes()
                console.log("workbook read")
                this.writeMenuData()

                const worksheet = workbook.getWorksheet('IVRs')
                worksheet.insertRows(3, this.auditData, 'i+')

                worksheet.spliceRows(2, 1)

                workbook.xlsx.writeBuffer()
                .then((buffer) => {
                    resolve(buffer)
                })
                //resolve("bruh")
            })
        });
    }

    /**
     * Write the header to the audit data array
     */
     writeHeader() {
        let header = ["Menu Name", "Menu Ext", "Prompt Name/Script"]

        for (let index = 1; index < 10; index++) {
            header.push(`Key ${index} Action`)
            header.push(`Key ${index} Destination`)
        }

        header.push(`Key 0 Action`)
        header.push(`Key 0 Destination`)
        header.push("Key # Press")
        header.push("Key * Press")

        this.auditData.push(header)
    }

    /**
     * Add all menu data to the audit data array
     */
     writeMenuData() {
        for (let index = 0; index < this.menus.length; index++) {
            
            let menuData = [this.menus[index].name, Number(this.menus[index].extensionNumber), "", this.menus[index].prompt, ""]

            // Add keys 1 - 9
            for (let key = 1; key < 10; key++) {
                let found = false
                for (let actionIndex = 0; actionIndex < this.menus[index].actions.length; actionIndex++) {
                    if (this.menus[index].actions[actionIndex].key == key) {
                        const prettyActionType = this.prettyActionType(this.menus[index].actions[actionIndex].actionType)
                        menuData.push(prettyActionType)
                        if (prettyActionType == "Connect To Extension" || prettyActionType == "Transfer to Voicemail of") {
                            menuData.push(Number(this.menus[index].actions[actionIndex].destination))    
                        }
                        else if (prettyActionType == "Connect to Dial-by-Name Directory") {
                            menuData.push("")
                        }
                        else {
                            menuData.push(this.menus[index].actions[actionIndex].destination)
                        }
                        found = true
                    }
                }
                if (!found) {
                    menuData.push("")
                    menuData.push("")
                }
            }

            // Add key 0
            let zeroKeyFound = false
            for (let actionIndex = 0; actionIndex < this.menus[index].actions.length; actionIndex++) {
                if (this.menus[index].actions[actionIndex].key == 0) {
                    menuData.push(this.prettyActionType(this.menus[index].actions[actionIndex].actionType))
                    menuData.push(Number(this.menus[index].actions[actionIndex].destination))
                    zeroKeyFound = true
                }
            }
            if (!zeroKeyFound) {
                menuData.push("")
                menuData.push("")
            }

            // Add # key
            let poundKeyFound = false
            for (let actionIndex = 0; actionIndex < this.menus[index].actions.length; actionIndex++) {
                if (this.menus[index].actions[actionIndex].key == "#") {
                    menuData.push(this.prettyActionType(this.menus[index].actions[actionIndex].actionType))
                    poundKeyFound = true
                }
            }
            if (!poundKeyFound) {
                menuData.push("")
            }

            let starKeyFound = false
            for (let actionIndex = 0; actionIndex < this.menus[index].actions.length; actionIndex++) {
                if (this.menus[index].actions[actionIndex].key == "*") {
                    menuData.push(this.prettyActionType(this.menus[index].actions[actionIndex].actionType))
                    starKeyFound = true
                }
            }
            if (!starKeyFound) {
                menuData.push("")
            }

            this.auditData.push(menuData)
        }
    }

    /**
     * Translate the portal's keywords into easy-to-read action types
     * @param {string} rawActionType 
     * @returns An easy-to-read action type
     */
    prettyActionType(rawActionType) {
        switch (rawActionType) {
            case "ForwardToExtension":
                return "Connect To Extension"
            case "ForwardToVoiceMail":
                return "Transfer to Voicemail of"
            case "ConnectToDialByNameDirectory":
                return "Connect to Dial-by-Name Directory"
            case "ForwardToExternal":
                return "External Transfer"
            case "RepeatMenuGreeting":
                return "Repeat the Menu"
            case "ReturnToPreviousMenu":
                return "Return to the Previous Menu"
            case "ReturnToRootMenu":
                return "Return to the Root Menu"
            default:
                return rawActionType
        }
    }
}

module.exports = PrettyAuditWriter