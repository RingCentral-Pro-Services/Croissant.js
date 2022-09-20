import RCExtension from "./RCExtension";

class CallQueue {
    constructor(public extension: RCExtension, members: string[]) {}
}

export default CallQueue