import { GridValidRowModel, GridColDef } from "@mui/x-data-grid"
import { DataGridFormattable } from "../../../../models/DataGridFormattable"

export class Site implements DataGridFormattable {

    constructor(public data: SiteData, public tableID?: number, public id?: string) { 
        this.tableID = this.randomId()
     }
    
    toDataGridRow(): any {
        return {
            id: `${this.tableID}`,
            name: this.data.name,
            extensionNumber: this.data.extensionNumber,
            street1: this.data.street1,
            street2: this.data.street2,
            city: this.data.city,
            state: this.data.state,
            zip: this.data.zip,
            country: this.data.country,
            timeFormat: this.data.timeFormat,
            outboundCname: this.data.outboundCnam,
            siteCode: this.data.siteCode,
        }
    }

    toDataGidHeader() {
        return [
            { field: "name", headerName: "Name", width: 200 },
            { field: "extensionNumber", headerName: "Extension Number", width: 200 },
            { field: "street1", headerName: "Street 1", width: 200 },
            { field: "street2", headerName: "Street 2", width: 200 },
            { field: "city", headerName: "City", width: 200 },
            { field: "state", headerName: "State", width: 200 },
            { field: "zip", headerName: "Zip", width: 200 },
            { field: "country", headerName: "Country", width: 200 },
            { field: "timeFormat", headerName: "Time Format", width: 200 },
            { field: "outboundCname", headerName: "Outbound Cnam", width: 200 },
            { field: "siteCode", headerName: "Site Code", width: 200 },
        ]
    }

    property(key: string) {
        return this.data[key as keyof SiteData]
    }

    randomId() {
        return Math.floor(Math.random() * 100000)
    }

    payload() {
        return {
            name: this.data.name,
            ...(this.data.extensionNumber && { extensionNumber: this.data.extensionNumber }),
            callerIdName: this.data.outboundCnam,
            businessAddress: {
                street: `${this.data.street1}${this.data.street2 ? `, ${this.data.street2}` : ''}`,
                city: this.data.city,
                state: this.data.state,
                zip: this.data.zip,
                country: this.data.country,
            },
            regionalSettings: {
                timezone: {
                    id: this.data.timezone,
                },
                language: {
                    id: this.data.userLanguage,
                },
                greetingLanguage: {
                    id: this.data.greetingLanguage,
                },
                formattingLocale: {
                    id: this.data.regionalFormat,
                },
                timeFormat: this.data.timeFormat,
            },
            ...(this.data.siteCode && { siteCode: this.data.siteCode }),
        }
    }

    erlPayload() {
        return {
            name: this.data.erlName ?? this.data.name,
            site: {
                id: this.id
            },
            address: {
                street: this.data.street1,
                street2: this.data.street2,
                city: this.data.city,
                state: this.data.state,
                zip: this.data.zip,
                country: this.data.country,
                customerName: this.data.outboundCnam,
            }
        }
    }
}

export interface SiteData {
    name: string
    extensionNumber: string
    street1: string
    street2: string
    city: string
    state: string
    zip: string
    country: string
    timezone: string
    userLanguage: string
    greetingLanguage: string
    regionalFormat: string
    timeFormat: string
    outboundCnam: string
    siteCode: string
    erlName: string
}