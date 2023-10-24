import { useEffect, useState } from "react";
import { wait } from "../../../../helpers/rcapi";
import { RestCentral } from "../../../../rcapi/RestCentral";
import { ERL } from "../models/ERL";

interface ErlResponse {
    erls: ERL[],
    hasNextPage: boolean
}

const useFetchERLs = () => {
    const [erls, setERLs] = useState<ERL[]>([])
    const [isERLListPending, setisERLListPending] = useState(true)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/emergency-locations'
    const baseWaitingPeriod = 250

    const fetchERLs = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const erls: ERL[] = []
        let page = 1
        let isFetching = true
        while (isFetching) {
            const res = await fetchPage(accessToken, page)
            erls.push(...res.erls)
            page += 1
            if (!res.hasNextPage) {
                isFetching = false
            }
        }

        // This is to maintain compatiblity with older code expecting ERLs to be returned this way
        setERLs(erls)
        setisERLListPending(false)

        return erls

    }

    const fetchPage = async (token: string, page: number) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            const response = await RestCentral.get(`${baseURL}?page=${page}`, headers)
            const records = response.data.records as ERL[]

            const res: ErlResponse = {
                erls: records,
                hasNextPage: false
            }

            if (response.data.navigation.nextPage) {
                res.hasNextPage = true
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
            
            return res
        }
        catch (e: any) {
            console.log(`Failed to get ERLs (page ${page})`)
            console.log(e)
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return {
                erls: [],
                hasNextPage: false
            }
        }
    }

    // useEffect(() => {
    //     const accessToken = localStorage.getItem('cs_access_token')
    //     if (!accessToken || !shouldFetch) return

    //     setTimeout(async () => {
    //         try {
    //             const url = `${baseURL}?page=${page}&perPage=1000`
    //             const headers = {
    //                 "Accept": "application/json",
    //                 "Content-Type": "application/json",
    //                 "Authorization": `Bearer ${accessToken}`
    //             }
    //             const response = await RestCentral.get(url, headers)
    //             const records = response.data.records
    //             const newRecords = [...erls, ...records]
    //             setERLs(newRecords)

    //             if (response.data.navigation.nextPage) {
    //                 setRateLimitInterval(response.rateLimitInterval)
    //                 setPage(page + 1)
    //             }
    //             else {
    //                 setisERLListPending(false)
    //                 setShouldFetch(false)
    //                 setRateLimitInterval(0)
    //                 setPage(1)
    //             }
    //         }
    //         catch {
    //             console.log('Something went wrong when fetching ELRs')
    //         }
    //     }, rateLimitInterval)
    // }, [page, shouldFetch, rateLimitInterval, baseURL])

    return { erls, isERLListPending, fetchERLs }
}

export default useFetchERLs