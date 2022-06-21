var IVRMenu = require('./IVRMenu')

class XMLWriter {

    constructor(menus) {
        this.xmlData = ""
        this.addLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
        this.addLine('<MultilevelIVR>\n')

        for (let i = 0; i < menus.length; i++) {
            this.addMenu(menus[i])
        }

        this.addLine('</MultilevelIVR>\n')

    }

    addMenu(menu) {
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

        this.addLine('</CallHandling>\n')
        this.addLine('</Menu>\n')
    }

    addLine(line) {
        this.xmlData += line
    }

}

module.exports = XMLWriter