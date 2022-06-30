/**
 * Class representing a special key press on an IVR Menu
 * Special keys include # and *
 */
class SpecialKeyPress {
    key = ""
    actionType = ""

    constructor(key, actionType) {
        this.key = key
        this.actionType = actionType
    }
}

module.exports = SpecialKeyPress