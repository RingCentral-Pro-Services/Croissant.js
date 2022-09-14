/**
 * Class representing a special key press on an IVR Menu
 * Special keys include # and *
 */
class SpecialKeyPress {

    constructor(public key: string, public actionType: string) {}
}

export default SpecialKeyPress