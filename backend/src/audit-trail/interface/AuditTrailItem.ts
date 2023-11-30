export interface AuditTrailItem {
    id?: number;
    action: string;
    initiator: string;
    tool: string;
    type: string
    uid: string
    createdAt?: Date;
    updatedAt?: Date;
}