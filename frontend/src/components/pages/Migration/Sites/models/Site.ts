interface SiteData {
    id?: string
    uri?: string
    name: string
    extensionNumber: string
    callerIdName: string
    email: string
    businessAddress: {
        country: string
        state: string
        city: string
        street: string
        zip: string
    },
    operator: {
        id?: string
        uri?: string
        extensionNumber: string
        name?: string 
    },
    regionalSettings: {}
    code?: string
}