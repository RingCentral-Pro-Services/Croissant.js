import { useState } from "react";
import { RegionalFormat } from "../../../../models/RegionalFormat";
import { Site, SiteData } from "../models/Site";

const useExcelToSites = (regionalFormats: RegionalFormat[]) => {
    const [sites, setSites] = useState<Site[]>([])
    const [isConvertPending, setIsConvertPending] = useState(true)

    // This may not be the best way to do this, but it works for now
    const timezoneMap = new Map<string, string>([
        ['US/Eastern', '51'],
        ['US/Central', '98'],
        ['US/Mountain', '100'],
        ['US/Pacific', '101'],
        ['GMT', '1'],
    ])

    const convert = (data: any) => {
        const sites: Site[] = []

        for (const item of data) {
            const data: SiteData = {
                name: item['Site Name'],
                street1: item['Address 1'],
                extensionNumber: item['Main Extension Number'],
                street2: item['Address 2'],
                city: item['City'],
                state: item['State'],
                zip: item['Postal Code'],
                country: item['Country'],
                timezone: timezoneMap.get(item['Timezone']) || '51',
                userLanguage: regionalFormats.find(rf => rf.name === item['User Language'])?.id || '',
                greetingLanguage: regionalFormats.find(rf => rf.name === item['Greeting Language'])?.id || '',
                regionalFormat: regionalFormats.find(rf => rf.name === item['Regional Format'])?.id || '',
                timeFormat: item['Time Format'],
                outboundCnam: item['Outbound Cnam'],
                siteCode: item['Site Code'],
            }
            const site = new Site(data)
            sites.push(site)
        }

        setSites(sites)
        setIsConvertPending(false)
    }

    return { sites, isConvertPending, convert }
}

export default useExcelToSites