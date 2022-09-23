import CSVFormattable from "./CSVFormattable"
import ExcelFormattable from "./ExcelFormattable"

export class IVRMenu implements CSVFormattable, ExcelFormattable {
    constructor(public data: IVRMenuData) {}

    toRow(): string {
        return ``
    }

    toExcelRow(): string[] {
        return []
    }
}

export interface IVRMenuData {
    uri: string
    name: string
    extensionNumber: number
    prompt: IVRPrompt
    site: Site
    actions: IVRAction[]
}

export interface IVRPrompt {
    mode: string
    text: string
}

export interface IVRAction {
    input: string
    action: string
}

export interface IVRDestination {
    id: string
    uri: string
}

export interface Site {
    name: string
    id: string
}