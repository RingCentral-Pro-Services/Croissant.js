import { DataGridFormattable } from "../../../../models/DataGridFormattable"

export class NetworkLocation implements DataGridFormattable {
    constructor(public data: NetworkLocationData, public internalID?: string) {
        this.internalID = this.randomId().toString()
    }

    toDataGridRow(): any {
        return {
            id: this.internalID,
            nickname: this.data.nickname,
            site: this.data.site.name,
            type: this.data.type,
            chassisID: this.data.id,
            erl: this.data.erl.name,
            street: this.data.address.street,
            street2: this.data.address.street2,
            city: this.data.address.city,
            state: this.data.address.state,
            country: this.data.address.country,
            postalCode: this.data.address.zip,
        }
    }

    toDataGidHeader(): any {
        return [
            { field: "nickname", headerName: "Nickname", width: 200 },
            { field: "site", headerName: "Site", width: 200 },
            { field: "type", headerName: "Type", width: 200 },
            { field: "chassisID", headerName: "Chassis ID / BSSID", width: 200 },
            { field: "erl", headerName: "ERL", width: 200 },
            { field: "street", headerName: "Street", width: 200 },
            { field: "street2", headerName: "Street 2", width: 200 },
            { field: "city", headerName: "City", width: 200 },
            { field: "state", headerName: "State", width: 200 },
            { field: "country", headerName: "Country", width: 200 },
            { field: "postalCode", headerName: "Postal Code", width: 200 },
        ]
    }

    property(key: string) {
        return this.data[key as keyof NetworkLocationData]
    }

    randomId() {
        return Math.floor(Math.random() * 100000)
    }

    payload() {
        return {
            name: this.data.nickname,
            ...(this.data.type === 'Switch' && { chassisId: this.data.id }),
            ...(this.data.type === 'Wireless Access Point' && { bssid: this.data.id }),
            site: {
                id: this.data.site.id
            },
            ...(this.data.erl.name && this.data.erl.name != '' && { emergencyLocation: { id: this.data.erl.id } }),
            ...((!this.data.erl.name || this.data.erl.name === '') && { emergencyAddress: this.data.address  }),
            ...((!this.data.erl.name || this.data.erl.name === '') && { emergencyLocation: {name: 'NEW'}  }),
        }
    }
}

export interface NetworkLocationData {
    nickname: string
    site: {
        name: string
        id: string
    }
    type: string
    id: string
    erl: {
        name: string
        id: string
    }
    address: {
        street: string
        street2: string
        city: string
        state: string
        country: string
        zip: string
        customerName: string
    }
}