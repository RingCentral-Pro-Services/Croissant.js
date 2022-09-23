
/**
 * Isolate extension numbers from raw destination strings
 */
 class ExtensionIsolator {

    extensionRegex = /(x)\d+/g    // Matches x-denoted extension numbers (Ex. x4796)
    extRegex = /(ext)(.?)\s\d+/g  // Matches "ext." followed by numbers (Ex. ext. 4796)

    // Matches a phone number
    phoneNumber = /([+][\d]+[\s])?([\d]-)?[(]?([0-9]+)[)]?[-|.|\s]?([0-9]+)[-|.|\s]?([0-9]+)/g

    constructor() {}

    /**
     * Get the extension number from the destination string
     * @param {string} rawDestination A string containing the raw destination data
     * @returns The isolated extension number as a string
     */
     isolateExtension(rawDestination: string) {
        if (this.containsXDenotedExtension(rawDestination)) {
            // The raw destination contains an 'x' followed by a number (Ex. x4250). This is likely the extension number
            return rawDestination.match(this.extensionRegex)?.toString().replace(/\D/g,'')
        }
        else if (this.containsExt(rawDestination)) {
            //The raw destination contains "ext" followed by a number. This is likely the extension number
            return this.getExtensionNumber(rawDestination)
        }
        else if (rawDestination.includes("-")) {
            // Split the string at the hyphen
            let destinationParts = rawDestination.split("-")

            for (let index = 0; index < destinationParts.length; index++) {
                if (!this.hasLetters(destinationParts[index])) {
                    // This part contains only numbers. This is likely the extension number
                    // It is legal for extension names to contain only numbers, but it's uncommon
                    return destinationParts[index].toString().replace(/\D/g,'')
                }
            }
            
            // Fallback to dumb isolation if extension number couldn't be deduced
            return rawDestination.toString().replace(/\D/g,'')
        }
        else {
            // Fallback to dumb isolation if the raw destination did not contain
            // an x-denoted extension or a hyphen
            return rawDestination.toString().replace(/\D/g,'')
        }
    }

    /**
     * Get the phone number from the destination string
     * @param {string} rawDestination A string containing the raw destination data
     * @returns The isolated phone number as a string
     */
    isolatePhoneNumber(rawDestination: string) {
        return rawDestination.match(this.phoneNumber)?.toString().replace(/\D/g,'')
    }

    /**
     * Check whether or not the input string contains numbers
     * @param {string} input The input string
     * @returns True if the input string contains numbers, false otherwise
     */
     hasNumber(input: string) {
        return /\d/.test(input);
    }

    /**
     * Check whether or not the input string contains letters
     * @param {string} input The input string
     * @returns True if the input string contains letters, false otherwise
     */
    hasLetters(input: string) {
        return /[a-zA-Z]/g.test(input)
    }

    /**
     * Check whether or not the input string contains an x-denoted extension number
     * For example, x4796
     * @param {string} input The input string
     * @returns True if the input string contains an x-denoted extension number
     */
    containsXDenotedExtension(input: string) {
        return /(x)\d+/g.test(input)
    }

    /**
     * Check whether or not the input string contains an number preceded by "ext"
     * @param {string} input The input string
     */
    containsExt(input: string) {
        if (/(ext)(.?)\s\d+/g.test(input.toLowerCase())) {
            return true
        }
        return false
    }

    /**
     * Get the extension number from strings containing ext followed by a number
     * @param {string} input The input string
     */
    getExtensionNumber(input: string) {
        return input.toLowerCase().match(this.extRegex)?.toString().replace(/\D/g,'')
    }

}

export default ExtensionIsolator