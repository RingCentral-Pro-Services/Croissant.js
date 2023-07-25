import { useEffect, useState } from "react";
import { Message } from "../../../../../models/Message";
import { SyncError } from "../../../../../models/SyncError";
import { RestCentral } from "../../../../../rcapi/RestCentral";
import { PhoneNumber } from "../../User Data Download/models/UserDataBundle";

const usePhoneNumberList = () => {
    const [phoneNumberMap, setPhoneNumberMap] = useState<Map<string, PhoneNumber[]>>(new Map())
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([])
    const [isPhoneNumberMapPending, setIsPhoneNumberMapPending] = useState(true)
    const [isDoneFetching, setIsDoneFetching] = useState(false)
    const [shouldFetch, setShouldFetch] = useState(false)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const baseURL = 'https://platform.ringcentral.com/restapi/v2/accounts/~/phone-numbers'
    const [page, setPage] = useState(1)

    const getPhoneNumberMap = () => {
        setShouldFetch(true)
    }

    useEffect(() => {
        const accessToken = localStorage.getItem("cs_access_token")
        if (!accessToken || !shouldFetch) {
            return
        }

        setTimeout(async () => {
            const url = `${baseURL}?page=${page}&perPage=1000`
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

            try {
                const response = await RestCentral.get(url, headers)
                console.log(response)

                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }

                const numbers = response.data.records as PhoneNumber[]
                const newPhoneNumbers = [...phoneNumbers, ...numbers]
                setPhoneNumbers(newPhoneNumbers)

                if (page < response.data.paging.totalPages) {
                    setPage(page + 1)
                }
                else {
                    setShouldFetch(false)
                    setRateLimitInterval(0)
                    setPage(1)
                    setIsDoneFetching(true)
                }
            }
            catch (e: any) {
                console.log(`Failed to fetch phone numbers. Page: ${page}`)
                console.log(e)
            }
        }, rateLimitInterval)
    }, [shouldFetch, page, rateLimitInterval, baseURL])

    useEffect(() => {
        if (!isDoneFetching) return

        const newPhoneNumberMap = new Map<string, PhoneNumber[]>()
        for (const number of phoneNumbers) {
            const id = number.extension?.id || 'main-site'
            if (newPhoneNumberMap.has(`${id}`)) {
                const existingNumbers = newPhoneNumberMap.get(`${id}`) || []
                existingNumbers.push(number)
                newPhoneNumberMap.set(`${id}`, existingNumbers)
            }
            else {
                newPhoneNumberMap.set(`${id}`, [number])
            }
        }

        setPhoneNumberMap(newPhoneNumberMap)
        setIsPhoneNumberMapPending(false)
    }, [isDoneFetching])

    return { phoneNumberMap, phoneNumbers, isPhoneNumberMapPending, getPhoneNumberMap }
}

export default usePhoneNumberList