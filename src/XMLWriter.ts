import IVRMenu from "./IVRMenu"

/**
 * A class for writing portal-compatible XML files
 */
class XMLWriter {

    xmlData = ""

    constructor(menus: IVRMenu[]) {
        this.xmlData = ""
        this.addLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
        this.addLine('<MultilevelIVR>\n')

        for (let i = 0; i < menus.length; i++) {
            this.addMenu(menus[i])
        }

        this.addLine('</MultilevelIVR>\n')
    }

    /**
     * Add an IVRMenu to the XML string
     * @param {IVRMenu} menu An IVRMenu object
     */
    addMenu(menu: IVRMenu) {
        this.addLine('<Menu>\n')

        this.addLine('\t<Extension>' + menu["extensionNumber"] + '</Extension>\n')
        this.addLine('\t<Name>' + menu["name"] + '</Name>\n')
        this.addLine('\t<Language>' + menu["language"] + '</Language>\n')
        this.addLine('\t<Prompt>\n')
        if (menu.textToSpeech()) {
            this.addLine('\t\t<Text>' + menu["prompt"] + '</Text>\n')
            this.addLine('\t\t<TextToSpeech>true</TextToSpeech>\n')
        }
        else {
            this.addLine('\t\t<Name>' + menu["prompt"] + '</Name>\n')
            this.addLine('\t\t<Text>' + menu["prompt"] + '</Text>\n')
            this.addLine('\t\t<TextToSpeech>false</TextToSpeech>\n')
        }
        this.addLine('\t</Prompt>\n')
        this.addLine('<CallHandling>\n')

        // Write 0 - 9 key presses
        for  (let i = 0; i < menu["actions"].length; i++) {
            let action = menu["actions"][i]

            this.addLine('\t<DigitKeyInput>\n')
            this.addLine('\t\t<Key>' + action["key"] + '</Key>\n')
            this.addLine('\t\t<Action>' + action["actionType"] + '</Action>\n')
            if (action["actionType"] != "ConnectToDialByNameDirectory") {
                this.addLine('\t\t<Destination>' + action["destination"] + '</Destination>\n')
            }
            this.addLine('\t</DigitKeyInput>\n')
        }

        // Write # and * key presses
        for (let i = 0; i < menu['specialKeys'].length; i++) {
            let action = menu['specialKeys'][i]
            this.addLine('\t<SpecialKeyInput>\n')
            this.addLine('\t\t<Key>' + action["key"] + '</Key>\n')
            this.addLine('\t\t<Action>' + action["actionType"] + '</Action>\n')
            this.addLine('\t</SpecialKeyInput>\n')
        }

        // The BRD currently doesn't have a column for No Input,
        // Use the default behaviour of disconnecting the call
        if (menu.hasSpecialKeys()) {
            this.addLine('\t<NoInput>\n')
            this.addLine('\t\t<Action>Disconnect</Action>\n')
            this.addLine('\t</NoInput>\n')
        }
        
        this.addLine('</CallHandling>\n')
        this.addLine('</Menu>\n')
    }

    /**
     * Add a line to the XML string
     * @param {String} line A string to be added to the XML string
     */
    addLine(line: string) {
        this.xmlData += line
    }

}

export default XMLWriter