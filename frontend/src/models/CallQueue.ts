import CSVFormattable from "./CSVFormattable";
import RCExtension from "./RCExtension";

class CallQueue implements CSVFormattable{
    constructor(public extension: RCExtension, public members: string[]) {}

    toRow(): string {
        return `${this.extension.name},${this.extension.extensionNumber},${this.extension.site},${this.extension.status},"${this.members}"`
    }
}

export default CallQueue