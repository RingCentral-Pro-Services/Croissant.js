var IVRKeyPress = require('./IVRKeyPress')

class IVRMenu {

    name = ""
    extensionNumber = ""
    prompt = ""
    language = "English (United States)"
    actions = []

    constructor(name, extensionNumber, prompt) {
        this.name = name
        this.extensionNumber = extensionNumber
        this.prompt = prompt
    }

    textToSpeech() {
        if (this.prompt.includes('.wav')) {
            return false
        }
        else if (this.prompt.includes('.mp3')) {
            return false
        }
        return true
    }
}

module.exports = IVRMenu