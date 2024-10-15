import { PhoneNumber } from "./PhoneNumber"

export interface ExtensionData {
    id: number | string
    creationTime?: string
    uri?: string
    account?: {
        id: string
        uri: string
    }
    contact: {
        firstName: string
        lastName?: string
        company?: string
        jobTitle?: string
        email: string
        businessPhone?: string
        mobilePhone?: string
        businessAddress?: {
            country: string
            state: string
            city: string
            street: string
            zip: string
        }
        emailAsLoginName?: boolean
        pronouncedName?: {
            type: string
            text: string

        }
        department?: string
    }
    customFields?: CustomField[]
    extensionNumber: string
    name: string
    roles?: Role[]
    regionalSettings?: {
        homeCountry: {
            id: string
            uri: string
            name: string
            isoCode: string
            callingCode: string
        }
        timezone: {
            id: string
            uri: string
            name: string
            description: string
            bias: string
        }
        language: {
            id: string
            localeCode: string
            name: string
        }
        greetingLanguage: {
            id: string
            localeCode: string
            name: string
        }
        formattingLocale: {
            id: string
            localeCode: string
            name: string
        }
        timeFormat: string
    }
    setupWizardState?: string
    status?: string
    type: string
    subType?: string
    hidden?: boolean
    site?: {
        id: string
        uri?: string
        name: string
        code?: string
    },
    ivrPin?: string,
    password?: string,
    phoneNumbers?: PhoneNumber[],
    costCenter?: {
        id: string
        name: string
    }
    device?: {
        id: string,
        macAddress: string
    }
}

export interface CustomField {
    id: string
    value: string
    displayName: string
}

export interface Role {
    uri: string
    id: string
    autoAssigned: boolean
    displayName: string
    siteCompatible: boolean
    siteRestricted: boolean
}