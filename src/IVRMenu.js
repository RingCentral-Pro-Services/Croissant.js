
/**
 * Class representing an IVR Menu
 */
class IVRMenu {

    name = ""
    extensionNumber = ""
    prompt = ""
    id = 0
    language = "English (United States)"
    actions = []
    specialKeys = []

    constructor(name, extensionNumber, prompt) {
        this.name = name
        this.extensionNumber = extensionNumber
        this.prompt = prompt
    }

    /**
     * Check whether or not the menu is using a text-to-speech prompts
     * @returns True if the menu has a text-to-speech prompt, false otherwise
     */
    textToSpeech() {
        if (this.prompt.includes('.wav')) {
            return false
        }
        else if (this.prompt.includes('.mp3')) {
            return false
        }
        return true
    }

    /**
     * Check whether or not the menu has special keys
     * @returns True if the menu has special keys, false otherwise
     */
    hasSpecialKeys() {
        return this.specialKeys.length > 0
    }
}

module.exports = IVRMenu