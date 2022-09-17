import CSVFormattable from "./CSVFormattable"

class RCExtension implements CSVFormattable {
    constructor(public id: number, public extensionNumber: number, public name: string, public type: string, public status: string, public hidden: boolean , public uri: string) {}

    toRow() {
        return `${this.name},${this.extensionNumber},${this.type},${this.status},${this.hidden}`
    }
}

export default RCExtension