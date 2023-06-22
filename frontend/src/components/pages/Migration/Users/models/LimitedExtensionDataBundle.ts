import { Extension } from "../../../../../models/Extension";
import { CallHandling, Device, PERL, PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class LimitedExtensionDataBundle {
    public hasEncounteredFatalError = false
    
    constructor(public extension: Extension, public extendedData?: LEExtendedData, public phoneNumberMap?: Map<string, PhoneNumber>) {}
}

export interface LEExtendedData {
    directNumbers?: PhoneNumber[]
    devices?: Device[]
    businessHoursCallHandling?: CallHandling
    pERLs?: PERL[]
}