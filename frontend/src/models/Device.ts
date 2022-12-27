export interface Device {
    id: string
    uri: string
    sku: string
    type: string
    name: string
    serial: string
    status: string
    computerName: string
    model: {
        id: string
        name: string
        addons: string[]
        deviceClass: string
        features: string[]
        lineCount: number
    }
    site: {
        id: string
        name: string
    }
    linePooling: string
}