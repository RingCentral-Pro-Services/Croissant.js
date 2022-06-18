var IVRKeyPress = require('./IVRKeyPress')

class IVRMenu {

    name = ""
    extensionNumber = ""
    prompt = ""
    language = "English (US)"
    actions = []

    constructor(name, extensionNumber, prompt) {
        this.name = name
        this.extensionNumber = extensionNumber
        this.prompt = prompt
    }

    textToSpeech() {
        return this.prompt.includes('.wav') || this.prompt.includes('.mp3')
    }
}

module.exports = IVRMenu