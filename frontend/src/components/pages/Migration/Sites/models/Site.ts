interface SiteData {
    id?: string
    uri?: string
    name: string
    extensionNumber: string
    tempExtensionNumber?: string
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
    regionalSettings: {
        timezone?: {
            name: string
        },
        formattingLocale?: {
            name: string
        },
        greetingLanguage?: {
            name: string
        },
        language?: {
            name: string
        },
        homeCountry?: {
            name: string
        },
        timeFormat?: string
    }
    code?: string
}

interface SiteDatWithoutExtension {
    id?: string
    uri?: string
    name: string
    extensionNumber?: string
    tempExtensionNumber?: string
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
    regionalSettings: {
        timezone?: {
            name: string
        }
    }
    code?: string
}