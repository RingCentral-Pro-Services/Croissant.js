import { useEffect, useState } from "react"
import { RegionalFormat } from "../models/RegionalFormat"
import { RegionalSettings } from "../models/RegionalSettings"
import { Timezone } from "../models/Timezone"

const useBuildRegionalSettings = (regionalFormatMap: Map<string, RegionalFormat>, timezoneMap: Map<string, Timezone>) => {
    const [regionalFormat, setRegionalFormat] = useState('')
    const [timezone, setTimezone] = useState('')
    const [timeFormat, setTimeFormat] = useState('')
    const [userLanguage, setUserLanguage] = useState('')
    const [greetingsLanguage, setGreetingsLanguage] = useState('')
    const [regionalSettings, setRegionalSettings] = useState<RegionalSettings>({homeCountry: {id: ''}, timezone: {id: ''}, language: {id: ''}, greetingLanguage: {id: ''}, formattingLocale: {id: ''}, timeFormat: ''})
    const [payload, setPayload] = useState({})

    useEffect(() => {
        if (timeFormat === '' || !timeFormat) {
            let newRegionalSettings = {...regionalSettings}
            newRegionalSettings.timeFormat = ''
            setRegionalSettings(newRegionalSettings)
        }
        else {
            let newRegionalSettings = {...regionalSettings}
            newRegionalSettings.timeFormat = timeFormat
            setRegionalSettings(newRegionalSettings)
        }
    }, [timeFormat])

    useEffect(() => {
        if (regionalFormat === '' || !regionalFormat) {
            let newRegionalSettings = {...regionalSettings}
            newRegionalSettings.formattingLocale.id = ''
            setRegionalSettings(newRegionalSettings)
        }
        else {
            const id = regionalFormatMap.get(regionalFormat)?.id
            if (!id) return
            let newRegionalSettings = {...regionalSettings}
            newRegionalSettings.formattingLocale!.id = id
            setRegionalSettings(newRegionalSettings)
        }
    }, [regionalFormat])

    useEffect(() => {
        if (userLanguage === '' || !userLanguage) {
            let newRegionalSettings = {...regionalSettings}
            newRegionalSettings.language.id = ''
            setRegionalSettings(newRegionalSettings)
        }
        else {
            let newRegionalSettings = {...regionalSettings}
            newRegionalSettings.language.id = regionalFormatMap.get(userLanguage)!.id
            setRegionalSettings(newRegionalSettings)
        }
    }, [userLanguage])

    useEffect(() => {
        if (greetingsLanguage === '' || !greetingsLanguage) {
            let newRegionalSettings = {...regionalSettings}
            newRegionalSettings.greetingLanguage.id = ''
            setRegionalSettings(newRegionalSettings)
        }
        else {
            let newRegionalSettings = {...regionalSettings}
            newRegionalSettings.greetingLanguage.id = regionalFormatMap.get(greetingsLanguage)!.id
            setRegionalSettings(newRegionalSettings)
        }
    }, [greetingsLanguage])

    useEffect(() => {
        if (timezone === '' || !timezone) {
            let newRegionalSettings = {...regionalSettings}
            newRegionalSettings.timezone.id = ''
            setRegionalSettings(newRegionalSettings)
        }
        else {
            let newRegionalSettings = {...regionalSettings}
            newRegionalSettings.timezone.id = timezoneMap.get(timezone)!.id
            setRegionalSettings(newRegionalSettings)
        }
    }, [timezone])

    useEffect(() => {
        const newPayload = {
            ...(regionalSettings.formattingLocale.id != '' && {formattingLocale: regionalSettings.formattingLocale}),
            ...(regionalSettings.greetingLanguage.id != '' && {greetingLanguage: regionalSettings.greetingLanguage}),
            ...(regionalSettings.language.id != '' && {language: regionalSettings.language}),
            ...(regionalSettings.timeFormat != '' && {timeFormat: regionalSettings.timeFormat}),
            ...(regionalSettings.timezone.id != '' && {timezone: regionalSettings.timezone})
        }
        setPayload(newPayload)
    }, [regionalSettings])

    return {setRegionalFormat, setTimezone, setTimeFormat, setUserLanguage, setGreetingsLanguage, payload}
}

export default useBuildRegionalSettings