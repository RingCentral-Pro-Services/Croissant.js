import { useEffect, useState } from "react"
import { Timezone } from "../models/Timezone"
import { RestCentral } from "./RestCentral"

const useTimezoneList = () => {
    const [timezones, setTimezones] = useState<Timezone[]>([])
    const [timezoneMap, setTimezoneMap] = useState<Map<string, Timezone>>(new Map())
    const [shouldFetch, setShouldFetch] = useState(false)
    const [rateLimitInterval, setRateLimitInterval] = useState(250)
    const [isTimezonListPending, setIsTimezonListPending] = useState(true)
    const [page, setPage] = useState(1)

    const url = 'https://platform.ringcentral.com/restapi/v1.0/dictionary/timezone?page=1&perPage=1000'

    const fetchTimezones = () => {
        setShouldFetch(true)
        setPage(1)
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
                const response = await RestCentral.getAsync(url, headers)
                const workingTimezones = response.data.records as Timezone[]
                let result: Timezone[] = []
                for (let timezone of workingTimezones) {
                    timezone.prettyName = getPrettyName(timezone.bias, timezone.description)
                    result.push(timezone)
                }
                result.sort((a, b) => {
                    if (parseInt(a.bias) < parseInt(b.bias)) return 1
                    else return -1
                })
                createMap(result)
                setTimezones(result)
                setIsTimezonListPending(false)
            }
            catch (e: any) {
                console.log('Something went wrong fetching timezones')
                console.log(e)
            }

        }, rateLimitInterval)
    }, [page, shouldFetch])

    const getPrettyName = (bias: string, description: string) => {
        const sign = bias.includes('-') ? '-' : '+'
        const biasNumber = parseInt(bias.replace('-', ''))
        const hours = `${biasNumber / 60}`
        const rawMinutes = hours.substring(hours.indexOf('.') + 1)
        const h = hours.substring(0, hours.includes('.') ? hours.indexOf('.') : hours.length)
        let m = hours.includes('.') ? `${parseInt(rawMinutes) * .6}` : '00'
        m.length === 1 ? m = `${m}0` : m = m
        let minutes = hours.substring(1).replace('.', '')
        minutes.length === 0 ? minutes = '00' : minutes = minutes
        const offset = `${h}:${m}`
        const result = `(GMT ${sign}${offset}) ${description}`
        return result
    }

    const createMap = (zones: Timezone[]) => {
        let map = new Map<string, Timezone>()
        for (const zone of zones) {
            map.set(zone.prettyName, zone)
        }
        setTimezoneMap(map)
    }

    return {fetchTimezones, timezones, isTimezonListPending, timezoneMap}
}

export default useTimezoneList