import { useState } from "react";
import { RegionalFormat } from "../../../../models/RegionalFormat";
import { Site, SiteData } from "../models/Site";

const useExcelToSites = (regionalFormats: RegionalFormat[]) => {
    const [sites, setSites] = useState<Site[]>([])
    const [isConvertPending, setIsConvertPending] = useState(true)

    // This may not be the best way to do this, but it works for now
    const timezoneMap = new Map<string, string>([
        ['US/Eastern', '96'],
        ['US/Central', '98'],
        ['US/Mountain', '100'],
        ['US/Pacific', '101'],
        ['GMT', '1'],
        ['Europe/Lisbon', '2'],
        ['Europe/Paris', '3'],
        ['Europe/Warsaw', '4'],
        ['Europe/Belgrade', '5'],
        ['Europe/Berlin', '6'],
        ['Europe/Athens', '7'],
        ['Europe/Minsk', '92'],
        ['Africa/Cairo', '9'],
        ['Africa/Tripoli', '10'],
        ['Europe/Sofia', '11'],
        ['Asia/Jerusalem', '12'],
        ['Asia/Kuwait', '13'],
        ['Europe/Moscow', '14'],
        ['Africa/Nairobi', '15'],
        ['Asia/Tehran', '16'],
        ['Asia/Dubai', '17'],
        ['Asia/Yereban', '18'],
        ['Asia/Kabul', '19'],
        ['Asia/Yekaterinburg', '20'],
        ['Asia/Tashkent', '21'],
        ['Asia/Calcutta', '22'],
        ['Asia/Bishkek', '23'],
        ['Asia/Colombo', '24'],
        ['Asia/Bangkok', '25'],
        ['Asia/Shanghai', '26'],
        ['Australia/Perth', '27'],
        ['Asia/Singapore', '28'],
        ['Asia/Taipei', '29'],
        ['Asia/Tokyo', '30'],
        ['Asia/Seoul', '31'],
        ['Australia/Adelaide', '33'],
        ['Australia/Darwin', '34'],
        ['Australia/Brisbane', '35'],
        ['Australia/Sydney', '36'],
        ['Pacific/Guam', '37'],
        ['Australia/Hobart', '38'],
        ['Asia/Vladivostock', '39'],
        ['Pacific/Noumea', '40'],
        ['Pacific/Auckland', '41'],
        ['Pacific/Fiji', '42'],
        ['Atlantic/Azores', '43'],
        ['America/Noronha', '44'],
        ['America/Sao_Paulo', '45'],
        ['America/Fortazela', '46'],
        ['America/St_Johns', '47'],
        ['Canada/Atlantic', '48'],
        ['America/La_Paz', '49'],
        ['America/Bogota', '50'],
        ['America/Indianapolis', '52'],
        ['America/Mexico_City', '54'],
        ['Canada/Saskatchewan', '55'],
        ['America/Phoenix', '56'],
        ['America/Anchorage', '59'],
        ['Pacific/Honolulu', '60'],
        ['America/Pago_Pago', '61'],
        ['Etc/GMT+12', '62'],
        ['America/Tijuana', '63'],
        ['America/Chihuahua', '64'],
        ['America/Regina', '65'],
        ['America/Caracas', '66'],
        ['America/Cuiaba', '67'],
        ['America/Santiago', '68'],
        ['America/Argentina/Buenos_Aires', '69'],
        ['America/Godthab', '70'],
        ['America/Montevideo', '71'],
        ['Atlantic/Cape_Verde', '72'],
        ['Africa/Algiers', '73'],
        ['Asia/Amman', '74'],
        ['Asia/Beirut', '75'],
        ['Asian/Madagan', '76'],
        ['Asia/Kamchatka', '77'],
        ['Africa/Windhoek', '78'],
        ['Asia/Baghdad', '79'],
        ['Asia/Tbilisi', '80'],
        ['Asia/Baku', '81'],
        ['Asia/Kathmandu', '82'],
        ['Asia/Omsk', '83'],
        ['Asia/Rangoon', '84'],
        ['Asia/Krasnoyarsk', '85'],
        ['Asia/Irtutsk', '86'],
        ['Asia/Tongatapu', '87'],
        ['Asia/Damascus', '88'],
        ['Asia/Gaza', '89'],
        ['Asia/Ulaanbaatar', '90'],
        ['Asia/Pyongyang', '93'],
    ])

    const convertRegionName = (rawName: string) => {
        switch (rawName) {
            case 'English (U.S.)':
                return 'English (United States)'
            case 'English (U.K.)':
                return 'English (United Kingdom)'
            case 'German':
                return 'German (Standard)'
            case 'Spanish':
                return 'Spanish (Spain, Modern Sort)'
            case 'Spanish (Latin America)':
                return 'Spanish (Latin America)'
            case 'French':
                return 'French (Standard)'
            case 'French (Canada)':
                return 'French (Canadian)'
            case 'Italian':
                return 'Italian (Standard)'
            case 'Dutch (Netherlands)':
                return 'Dutch (Netherlands)'
            case 'Portuguese (Portugal)':
                return 'Portuguese (Portugal)'
            case 'Portuguese (Brazil)':
                return 'Portuguese (Brazil)'
            case 'Finnish':
                return 'Finnish'
            case 'Korean (South Korea)':
                return 'Korean'
            default:
                return
        }
    }

    const convert = async (data: any) => {
        const sites: Site[] = []

        for (const item of data) {
            const data: SiteData = {
                name: item['Site Name'],
                street1: item['Address 1'] ?? item['Address'],
                extensionNumber: item['Main Extension Number'] ?? item['Site Extension Number'],
                street2: item['Address 2'],
                city: item['City'] ?? item['Suburb'],
                state: item['State'],
                zip: item['Postal Code'],
                country: getCountry(item['Country']),
                timezone: timezoneMap.get(item['Timezone']) || '51',
                userLanguage: regionalFormats.find(rf => rf.name === convertRegionName(item['User Language']))?.id || item['User Language'],
                greetingLanguage: regionalFormats.find(rf => rf.name === convertRegionName(item['Greeting Language']))?.id || item['Greeting Language'],
                regionalFormat: regionalFormats.find(rf => rf.name === convertRegionName(item['User Language']))?.id || item['Regional Format'],
                timeFormat: getTimeFormat(`${item['Time Format']}`),
                outboundCnam: item['Outbound Caller ID NAME (15 Character Max Limit)'] ?? item['Outbound Cnam'] ?? item['Site Name'],
                siteCode: item['Site Code - 1 Digit (up to 9 Sites)'] ?? item['Site code - 2 Digits (up to 90 Sites)'] ?? item['Site Code - 3 Digits (up to 900 Sites)'] ?? item['Site Code - 4 Digits (up to 9,000 Sites)'] ?? item['Site Code - 5 Digits (up to 90,000 Sites)'] ?? item['Site Code'],
                erlName: item['Emergency Response Location Nickname'],
            }
            const site = new Site(data)
            sites.push(site)
        }

        setSites(sites)
        setIsConvertPending(false)
        return sites
    }

    const getCountry = (rawCountry: string) => {
        if (['usa', 'united states'].includes(rawCountry.toLowerCase())) {
            return 'US'
        }
        else if (['australia'].includes(rawCountry.toLowerCase())) { 
            return 'AU'
        }
        return rawCountry
    }

    const getTimeFormat = (rawFormat: string) => {
        if (rawFormat.includes('12')) {
            return '12h'
        }
        return '24h'
    }

    return { sites, isConvertPending, convert }
}

export default useExcelToSites