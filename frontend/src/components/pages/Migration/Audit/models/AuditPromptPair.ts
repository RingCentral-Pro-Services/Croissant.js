import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { IVRAudioPrompt } from "../../Users/models/IVRPrompt";

export class AuditPromptPair implements ExcelFormattable {
    constructor(private originalPrompt: IVRAudioPrompt, private newPrompt: IVRAudioPrompt | undefined) {}

    toExcelRow(): string[] {
        return [
            // Padding for unused columns
            '',
            '',
            '',
            '',

            // Name
            this.originalPrompt.filename,
            this.newPrompt?.filename ?? '',
            this.originalPrompt.filename === this.newPrompt?.filename ? 'TRUE' : 'FALSE',
        ]
    }
}