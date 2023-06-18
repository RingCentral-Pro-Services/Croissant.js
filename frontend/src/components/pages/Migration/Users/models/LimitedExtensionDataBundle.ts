import { Extension } from "../../../../../models/Extension";
import { CallHandling, Device, PERL, PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class LimitedExtensionDataBundle {
    constructor(public extension: Extension, public extendedData?: LEExtendedData, public phoneNumberMap?: Map<string, string>) {}
}

export interface LEExtendedData {
    directNumbers?: PhoneNumber[]
    devices?: Device[]
    businessHoursCallHandling?: CallHandling
    pERLs?: PERL[]
}