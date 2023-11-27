export interface AuditTrailItem {
    id?: number;
    action: string;
    initiator: string;
    tool: string;
    type: string
    createdAt?: Date;
    updatedAt?: Date;
}