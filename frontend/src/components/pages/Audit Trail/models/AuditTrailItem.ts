export interface AuditTrailItemData {
    id: number;
    action: string;
    initiator: string;
    tool: string;
    type: string
    createdAt?: string;
    updatedAt?: string;
}

export class AuditTrailItem {
    constructor(public data: AuditTrailItemData) {}

    toDataGridRow(): any {
        return {
            id: this.data.id,
            action: this.data.action,
            initiator: this.data.initiator,
            tool: this.data.tool,
            type: this.data.type,
            timestamp: new Date(this.data.createdAt ?? '').toLocaleString(),
        }
    }

    toDataGidHeader(): any {
        return [
            { field: 'initiator', headerName: 'Initiator', width: 200 },
            { field: 'action', headerName: 'Action', width: 500 },
            { field: 'tool', headerName: 'Tool', width: 200 },
            { field: 'type', headerName: 'Type', width: 75 },
            { field: 'timestamp', headerName: 'Date', width: 200 },
        ]
    }

    property(key: string): any {
        return this.data[key as keyof AuditTrailItemData]
    }
}