import ExcelFormattable from "../../../../models/ExcelFormattable"

export class ExtensionPresence implements ExcelFormattable {

    constructor(public data: PresenceData) {}

    toExcelRow(): string[] {
        let result = [this.data.extensionName, this.data.extensionNumber, this.data.site, `${this.data.isPresenceStatusVisible}`, `${this.data.isRingingOnMonitoredLines}`, `${this.data.isPickingUpMonitoredLinesOnHold}`, this.data.permittedUsers.join(', ')]

        for (let index = 1; index <= 100; index++) {
            let found = false
            for (const line of this.data.lines) {
                if (line.line === `${index}`) {
                    result.push(`${line.extensionName} Ext. ${line.extensionNumber}`)
                    found = true
                }
            }
            if (!found) result.push('')
        }

        return result
    }
}

export interface PresenceData {
    extensionNumber: string
    extensionName: string
    site: string
    isPresenceStatusVisible: boolean
    isRingingOnMonitoredLines: boolean
    isPickingUpMonitoredLinesOnHold: boolean
    permittedUsers: string[]
    lines: PresenceLineData[]
}

export interface PresenceLineData {
    extensionNumber: string
    extensionName: string
    line: string
}