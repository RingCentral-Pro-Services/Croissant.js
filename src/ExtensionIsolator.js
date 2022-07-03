
/**
 * Isolate extension numbers from raw destination strings
 */
class ExtensionIsolator {

    extensionRegex = /(x)\d+/g  // Matches x-denoted extension numbers (Ex. x4796)
    extRegex = /(ext)\s\d+/g    // Matches "ext" followed by numbers (Ex. ext 4796)
    extRegex2 = /(ext.)\s\d+/g  // Matches "ext." followed by numbers (Ex. ext. 4796)

    constructor() {}

    /**
     * Get the extension number from the destination string
     * @param {string} rawDestination A string containing the raw destination data
     * @returns The isolated extension number as a string
     */
     isolateExtension(rawDestination) {
        if (this.containsXDenotedExtension(rawDestination)) {
            // This part contains an 'x' followed by a number (Ex. x4250). This is likely the extension number
            return rawDestination.match(this.extensionRegex).toString().replace(/\D/g,'')
        }
        else if (rawDestination.includes("-")) {
            // Split the string at the hyphen
            let destinationParts = rawDestination.split("-")

            for (let index = 0; index < destinationParts.length; index++) {
                if (this.containsExt(destinationParts[index])) {
                    // This part contains "Ext." This is likely the extension number
                    return destinationParts[index].toString().replace(/\D/g,'')
                }
                else if (!this.hasLetters(destinationParts[index])) {
                    // This part contains only numbers. This is likely the extension number
                    // It is legal for extension names to contain only numbers, but it's uncommon
                    return destinationParts[index].toString().replace(/\D/g,'')
                }
                else if (this.containsXDenotedExtension(destinationParts[index])) {
                    // This part contains an 'x' followed by a number (Ex. x4250). This is likely the extension number
                    return destinationParts[index].match(this.extensionRegex).toString().replace(/\D/g,'')
                }
            }
        }
        else {
            // The raw restination doesn't contain a hyphen, fallback to dumb isolation
            // just removing any characters that aren't numbers
            return rawDestination.toString().replace(/\D/g,'')
        }
    }

    /**
     * Check whether or not the input string contains numbers
     * @param {string} input The input string
     * @returns True if the input string contains numbers, false otherwise
     */
     hasNumber(input) {
        return /\d/.test(input);
    }

    /**
     * Check whether or not the input string contains letters
     * @param {string} input The input string
     * @returns True if the input string contains letters, false otherwise
     */
    hasLetters(input) {
        return /[a-zA-Z]/g.test(input)
    }

    /**
     * Check whether or not the input string contains an x-denoted extension number
     * For example, x4796
     * @param {string} input The input string
     * @returns True if the input string contains an x-denoted extension number
     */
    containsXDenotedExtension(input) {
        return /(x)\d+/g.test(input)
    }

    /**
     * Check whether or not the input string contains an number preceded by "ext"
     * @param {string} input The input string
     */
    containsExt(input) {
        if (this.extRegex.test(input.toLowerCase())) {
            return true
        }
        else if (this.extRegex2.test(input.toLowerCase())) {
            return true
        }
        return false
    }

}

module.exports = ExtensionIsolator