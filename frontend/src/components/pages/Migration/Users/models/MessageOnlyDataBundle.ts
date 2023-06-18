import { Extension } from "../../../../../models/Extension";
import { Greeting } from "../../../../../models/Greetings";
import { Notifications, PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class MessageOnlyDataBundle {
    constructor(public extension: Extension, public extendedData?: ExtendedMOData, public phoneNumberMap?: Map<string, string>) {}
}

interface ExtendedMOData {
    notifications?: Notifications
    directNumbers?: PhoneNumber[]
    vmRecipientID?: string
    greeting?: Greeting
}