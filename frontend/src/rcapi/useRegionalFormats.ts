import { useEffect, useState } from "react"
import { RegionalFormat } from "../models/RegionalFormat"
import { RestCentral } from "./RestCentral"

const useRegionalFormats = () => {
    const [regionalFormats, setRegionalFormats] = useState<RegionalFormat[]>([])
    const [shouldFetch, setShouldFetch] = useState(false)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [isRegionalFormatListPenging, setIsRegionalFormatListPenging] = useState(true)
    const url = 'https://platform.ringcentral.com/restapi/v1.0/dictionary/language'

    const fetchRegionalFormats = () => {
        setShouldFetch(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!shouldFetch || !accessToken) return

        setTimeout(async () => {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                const response = await RestCentral.get(url, headers)
                const formats = response.data.records as RegionalFormat[]
                formats.sort((a, b) => {
                    if (a.name < b.name) return -1
                    else return 1
                })
                setRegionalFormats(formats)
                setIsRegionalFormatListPenging(false)
            }
            catch (e: any) {
                console.log('Something went wrong fetching regional formats')
                console.log(e)
            }
        }, rateLimitInterval)
    }, [shouldFetch, rateLimitInterval, url])

    return {fetchRegionalFormats, regionalFormats, isRegionalFormatListPenging}
}

export default useRegionalFormats