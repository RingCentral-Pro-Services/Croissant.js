import { AuditResult } from "../helpers/AuditEngine";

export class AuditDiscrepency {
    constructor(data: {name: string, extensionNumber: string, issue: AuditResult}) {}
}