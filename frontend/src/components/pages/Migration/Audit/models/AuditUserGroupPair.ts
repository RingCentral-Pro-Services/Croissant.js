import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { UserGroupDataBundle } from "../../Users/models/UserGroupDataBundle";

export class AuditUserGroupPair implements ExcelFormattable {
    constructor(private originalGroup: UserGroupDataBundle, private newGroup: UserGroupDataBundle | undefined) {}

    toExcelRow(): string[] {
        return [
            // Padding for unused columns
            '',
            '',
            '',
            '',

            // Name
            this.originalGroup.data.displayName,
            this.newGroup?.data.displayName ?? '',
            this.originalGroup.data.displayName == this.newGroup?.data.displayName ? 'TRUE' : 'FALSE',

            // Description
            this.originalGroup.data.description ?? '',
            this.newGroup?.data.description ?? '',
            this.originalGroup.data.description == this.newGroup?.data.description ? 'TRUE' : 'FALSE',

            // Managers
            this.originalGroup.data.managers.map((m) => m.extensionNumber).sort().join('\n'),
            this.newGroup?.data.managers.map((m) => m.extensionNumber).sort().join('\n') ?? '',
            this.originalGroup.data.managers.map((m) => m.extensionNumber).sort().join('\n') == this.newGroup?.data.managers.map((m) => m.extensionNumber).sort().join('\n') ? 'TRUE' : 'FALSE',

            // Members
            this.originalGroup.data.members?.map((m) => m.extensionNumber).sort().join('\n') ?? '',
            this.newGroup?.data.members?.map((m) => m.extensionNumber).sort().join('\n') ?? '',
            this.originalGroup.data.members?.map((m) => m.extensionNumber).sort().join('\n') == this.newGroup?.data.members?.map((m) => m.extensionNumber).sort().join('\n') ? 'TRUE' : 'FALSE',
        ]
    }
}