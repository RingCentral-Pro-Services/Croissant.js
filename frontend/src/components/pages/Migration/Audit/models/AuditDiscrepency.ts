import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { AuditResult } from "../helpers/AuditEngine";

export class AuditDiscrepency implements ExcelFormattable {
    constructor(private data: {name: string, extensionNumber: string, objectType: string, issue: AuditResult}) {}

    toExcelRow(): string[] {
        return [this.data.name, this.data.extensionNumber, this.data.objectType, this.data.issue.path, this.data.issue.expectedValue, this.data.issue.foundValue]
    }
}