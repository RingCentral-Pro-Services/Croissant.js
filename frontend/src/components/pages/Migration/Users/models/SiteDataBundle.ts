import { Extension } from "../../../../../models/Extension";
import { BusinessHours, CallHandling, PhoneNumber } from "../../User Data Download/models/UserDataBundle";

export class SiteDataBundle {
    constructor(public extension: SiteData, public extendedData?: ExtendedSiteData, public phoneNumberMap?: Map<string, string>) {}
}

export interface ExtendedSiteData {
    businessHours: BusinessHours
    businessHoursCallHandling?: CallHandling
    afterHoursCallHandling?: CallHandling
    directNumbers?: PhoneNumber[]
}