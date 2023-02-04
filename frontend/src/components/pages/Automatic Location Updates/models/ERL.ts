export interface ERL {
    id: string
    address: {
        country: string
        countryId: string
        countryIsoCode: string
        countryName: string
        state: string
        stateId: string
        stateIsoCode: string
        stateName: string
        city: string
        street: string
        street2: string
        zip: string
        customerName: string
    }
    name: string
    site: {
        id: string
        name: string
    },
    addressStatus: string
    usageStatus: string
    syncStatus: string
    addressType: string
    visibility: string
}