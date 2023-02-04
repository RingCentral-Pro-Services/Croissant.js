import { useEffect, useState } from "react";
import { RestCentral } from "../../../../rcapi/RestCentral";
import { ERL } from "../models/ERL";

const useFetchERLs = () => {
    const [erls, setERLs] = useState<ERL[]>([])
    const [isERLListPending, setisERLListPending] = useState(true)
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(false)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/emergency-locations'

    const fetchERLs = () => {
        setERLs([])
        setShouldFetch(true)
        setisERLListPending(true)
        setPage(1)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken || !shouldFetch) return

        setTimeout(async () => {
            try {
                const url = `${baseURL}?page=${page}&perPage=1000`
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
                const response = await RestCentral.get(url, headers)
                const records = response.data.records
                const newRecords = [...erls, ...records]
                setERLs(newRecords)

                if (response.data.navigation.nextPage) {
                    setRateLimitInterval(response.rateLimitInterval)
                    setPage(page + 1)
                }
                else {
                    setisERLListPending(false)
                    setShouldFetch(false)
                    setRateLimitInterval(0)
                    setPage(1)
                }
            }
            catch {
                console.log('Something went wrong when fetching ELRs')
            }
        }, rateLimitInterval)
    }, [page, shouldFetch, rateLimitInterval, baseURL])

    return { erls, isERLListPending, fetchERLs }
}

export default useFetchERLs