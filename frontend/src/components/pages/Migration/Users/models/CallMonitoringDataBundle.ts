export class CallMonitoringDataBundle {
    constructor(public data: CallMonitoringData) {}
}
export interface CallMonitoringData {
    name: string
    id?: string
    members: CallMonitoringMember[]
}

export interface CallMonitoringMember {
    uri?: string
    id: string
    extensionNumber?: string
    permissions: string[]
}