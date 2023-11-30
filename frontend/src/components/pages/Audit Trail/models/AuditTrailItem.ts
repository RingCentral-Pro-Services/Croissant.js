import { DataGridFormattable } from "../../../../models/DataGridFormattable";
import ExcelFormattable from "../../../../models/ExcelFormattable";

export interface AuditTrailItemData {
    id: number;
    action: string;
    initiator: string;
    tool: string;
    type: string
    uid: string
    createdAt?: string;
    updatedAt?: string;
}

export class AuditTrailItem implements DataGridFormattable, ExcelFormattable {
    constructor(public data: AuditTrailItemData) {}
    
    toExcelRow() {
        return [
            this.data.initiator,
            this.data.action,
            this.data.uid,
            this.data.tool,
            this.data.type,
            new Date(this.data.createdAt ?? '').toLocaleString()
        ]
    }

    toDataGridRow(): any {
        return {
            id: this.data.id,
            action: this.data.action,
            initiator: this.data.initiator,
            tool: this.data.tool,
            type: this.data.type,
            uid: this.data.uid,
            timestamp: new Date(this.data.createdAt ?? '').toLocaleString(),
        }
    }

    toDataGidHeader(): any {
        return [
            { field: 'initiator', headerName: 'Initiator', width: 200 },
            { field: 'action', headerName: 'Action', width: 500 },
            { field: 'uid', headerName: 'Account ID', width: 150 },
            { field: 'tool', headerName: 'Tool', width: 200 },
            { field: 'type', headerName: 'Type', width: 75 },
            { field: 'timestamp', headerName: 'Date', width: 200 },
        ]
    }

    property(key: string): any {
        return this.data[key as keyof AuditTrailItemData]
    }
}