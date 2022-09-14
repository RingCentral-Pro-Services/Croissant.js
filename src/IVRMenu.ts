import IVRKeyPress from "./IVRKeyPress"

/**
 * Class representing an IVR Menu
 */
export default class IVRMenu {

    id = 0
    language = "English (United States)"
    actions: IVRKeyPress[] = []
    specialKeys = []
    page = ""

    // constructor(name, extensionNumber, prompt) {
    //     this.name = name
    //     this.extensionNumber = extensionNumber
    //     this.prompt = prompt
    // }

    constructor(public name: string, public extensionNumber: string, public prompt: string) {}

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