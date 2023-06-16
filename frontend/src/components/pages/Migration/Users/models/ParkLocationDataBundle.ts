import { Extension } from "../../../../../models/Extension";

export class ParkLocationDataBundle {
    constructor(public extension: Extension, public members?: ParkLocationMember[]) {}
}

export interface ParkLocationMember {
    id: string
    uri?: string
    name?: string
    extensionNumber: string
    partnerId?: string
}