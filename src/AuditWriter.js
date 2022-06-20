var IVRKeyPress = require('./IVRKeyPress')
var IVRMenu = require('./IVRMenu')

class AuditWriter {
    constructor(menus) {
        this.csvData = 'Menu Name,Menu Ext,Prompt Name/Script,'
        for (let i = 1; i < 10; i++) {
            this.csvData += 'Key ' + i + ' Action,Key ' + i + ' Destination,'
        }
        this.csvData += 'Key 0 Action,Key 0 Destination,\n'
        this.generateAudit(menus)
    }

    generateAudit(menus) {
        for (let i = 0; i < menus.length; i++) {
            let menu = menus[i]

            this.csvData += '\"' + menu.name + '\",' + menu.extensionNumber + ',\"' + menu.prompt + '\",'

            // There's probably a more efficient way to do this
            // Loop through keys 1 - 9 and write the keypress data if present
            for (let keyIndex = 1; keyIndex < 10; keyIndex++) {
                let found = false
                menu.actions.forEach(element => {
                    if (element.key == keyIndex) {
                        this.csvData += element.actionType + ',' + element.destination + ','
                        found = true
                    }
                });

                if (!found) {
                    this.csvData += ',,'
                }
            }

            // Write the keypress data for 0 if present
            menu.actions.forEach(element => {
                if (element.key == 0) {
                    this.csvData += element.actionType + ',' + element.destination + ','
                }
            });

            this.csvData += '\n'
        }
    }
}

module.exports = AuditWriter