export interface CostCenterDataBundle {
    id?: string
    name: string
    parentId: string
    billingcode?: string
    taxLocation?: {
        id: string
        name: string
        type: string
        externalLocationId: string
        effectiveDate: string
        address: {}
    }
}