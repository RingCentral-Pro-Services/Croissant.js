import { useState } from "react";
import { Extension } from "../../../../models/Extension";
import { ERL } from "../models/ERL";
import { NetworkLocation, NetworkLocationData } from "../models/NetworkLocation";

const useExcelToNetworkLocations = () => {
    const [networkLocations, setNetworkLocations] = useState<NetworkLocation[]>([])
    const [isConvertPending, setIsConvertPending] = useState(true)

    const convert = (excelData: any[], erls: ERL[], extensions: Extension[]) => {
        const locations: NetworkLocation[] = []

        for (const item of excelData) {
            const data: NetworkLocationData = {
                nickname: item["Nickname"],
                site: {
                    name: item["Site"],
                    id: idForSite(item['Site'], extensions.filter((ext) => ext.prettyType() === 'Site'))
                },
                type: item['Type'],
                id: item['Chassis ID / BSSID'],
                erl: {
                    name: item['ERL'],
                    id: idForERL(item['ERL'], erls)
                },
                address: {
                    street: item['Street'],
                    street2: item['Street 2'],
                    city: item['City'],
                    state: item['State'],
                    country: item['Country'],
                    zip: item['Postal Code'],
                    customerName: item['Customer Name']
                }
            }
            const location = new NetworkLocation(data)
            locations.push(location)
        }

        setNetworkLocations(locations)
        setIsConvertPending(false)
    }

    const idForERL = (erlName: string, erls: ERL[]) => {
        for (const erl of erls) {
            if (erl.name === erlName) {
                return erl.id
            }
        }
        return ""
    }

    const idForSite = (siteName: string, sites: Extension[]) => {
        for (const site of sites) {
            if (site.data.name === siteName) {
                return `${site.data.id}`
            }
        }
        return ""
    }

    return {convert, networkLocations, isConvertPending}
}

export default useExcelToNetworkLocations