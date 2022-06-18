class IVRKeyPress {
    key = ""
    actionType = ""
    destination = ""

    constructor(key, actionType, destination) {
        this.key = key
        this.actionType = actionType
        this.destination = destination
    }
}

module.exports = IVRKeyPress