var IVRKeyPress = require('./IVRKeyPress')
var IVRMenu = require('./IVRMenu')

/**
 * A class for converting IVRMenu objects to CSVs
 */
class AuditWriter {
    constructor(menus) {
        this.csvData = 'Menu Name,Menu Ext,Prompt Name/Script,'
        for (let i = 1; i < 10; i++) {
            this.csvData += 'Key ' + i + ' Action,Key ' + i + ' Destination,'
        }
        this.csvData += 'Key 0 Action,Key 0 Destination,Key # Action,Key * Action\n'
        this.generateAudit(menus)
    }

    /**
     * Generate a CSV of the passed IVRMenus
     * @param {IVRMenu[]} menus An array of IVRMenu objects
     */
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
            let zeroKeyFound = false
            menu.actions.forEach(element => {
                let found = false
                if (element.key == 0) {
                    this.csvData += element.actionType + ',' + element.destination + ','
                    zeroKeyFound = true
                }
            });

            if (!zeroKeyFound) {
                this.csvData += ",,"
            }
            
            // Write the keypress data for # if present
            let poundKeyFound = false
            menu.actions.forEach(element => {
                if (element.key == '#') {
                    this.csvData += element.actionType + ','
                    poundKeyFound = true
                }
            });

            if (!poundKeyFound) {
                this.csvData += ','
            }

            // Write the keypress data for * if present
            menu.actions.forEach(element => {
                if (element.key == '*') {
                    this.csvData += element.actionType + ','
                }
            });

            this.csvData += '\n'
        }
    }
}

module.exports = AuditWriter