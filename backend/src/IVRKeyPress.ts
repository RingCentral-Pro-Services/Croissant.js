/**
 * Class representing a key press on an IVR Menu
 */
class IVRKeyPress {

    constructor(public key: string, public actionType: string, public destination: string) {}
}

export default IVRKeyPress