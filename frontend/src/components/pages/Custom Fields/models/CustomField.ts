export interface CustomFieldData {
    id: string
    category: string
    displayName: string
}

export class CustomField {
    constructor(public data: CustomFieldData) {}
}