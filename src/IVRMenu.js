var IVRKeyPress = require('./IVRKeyPress')

class IVRMenu {

    name = ""
    extensionNumber = ""
    prompt = ""
    language = "English (United States)"
    actions = []
    specialKeys = []

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

    hasSpecialKeys() {
        return this.specialKeys.length > 0
    }
}

module.exports = IVRMenu