import { Extension } from "../../../../../models/Extension";
import { BusinessHours, CallHandling } from "../../User Data Download/models/UserDataBundle";

export class SiteDataBundle {
    constructor(public extension: SiteData, public extendedData?: ExtendedSiteData) {}
}

export interface ExtendedSiteData {
    businessHours: BusinessHours
    businessHoursCallHandling?: CallHandling
    afterHoursCallHandling?: CallHandling
}