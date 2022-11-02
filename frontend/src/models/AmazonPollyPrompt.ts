import { DataTableFormattable } from "./DataTableFormattable";
import ExcelFormattable from "./ExcelFormattable";

class AmazonPollyPrompt implements DataTableFormattable, ExcelFormattable {
    constructor(public name: string, public text: string, public data?: Blob) {}

    toDataTableRow(): string[] {
        return [this.name, this.text]
    }

    toExcelRow(): string[] {
        return this.toDataTableRow()
    }
}

export default AmazonPollyPrompt