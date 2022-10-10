import { useEffect, useState } from "react"
import { IVRMenu, IVRMenuData } from "../models/IVRMenu"
import RCExtension from "../models/RCExtension"
import { RestCentral } from "./RestCentral"
import { IVRPrompt } from "../models/IVRMenu"

const useFetchIVRs = () => {
    const [isIVRsListPending, setIsIVRsListPending] = useState(true)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [ivrsList, setIvrsList] = useState<IVRMenu[]>([])
    const [ivrExtensions, setIvrExtensions] = useState<RCExtension[]>([])
    let [shouldFetch, setShouldFetch] = useState(false)
    let [rateLimitInterval, setRateLimitInterval] = useState(0)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/ivr-menus/ivrMenuId'
    const accessToken = localStorage.getItem('cs_access_token')

    const fetchIVRs = (extensionList: RCExtension[]) => {
        const ivrs = extensionList.filter((extension) => {
            return extension.type === 'IvrMenu'
        })
        setIvrExtensions(ivrs)
        setIsIVRsListPending(true)
        setCurrentExtensionIndex(0)
        setRateLimitInterval(0)
        setShouldFetch(true)
    }

    useEffect(() => {
        if (!shouldFetch) return
        if (currentExtensionIndex >= ivrExtensions.length) {
            console.log('Done fetching IVRs')
            console.log(ivrsList)
            setIsIVRsListPending(false)
            setShouldFetch(false)
            return
        }

        let ivrURL = baseURL.replace('ivrMenuId', `${ivrExtensions[currentExtensionIndex].id}`)

        setTimeout(async () => {
            try {
                const headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
                let response = await RestCentral.get(ivrURL, headers)
                console.log(response)
                const menuData: IVRMenuData = response.data
                if (menuData.prompt === undefined) {
                    const prompt: IVRPrompt = {
                        mode: "TextToSpeech",
                        text: 'Thank you for calling'
                    }
                    menuData.prompt = prompt
                }
                if (menuData.actions === undefined) {
                    menuData.actions = []
                }
                const menu = new IVRMenu(menuData)
                setIvrsList(prev => [...prev, menu])
                // setRateLimitInterval(response.rateLimitInterval)
                if (currentExtensionIndex != ivrExtensions.length) {
                    setRateLimitInterval(response.rateLimitInterval)
                    setCurrentExtensionIndex(currentExtensionIndex + 1)
                }
                else {
                    setIsIVRsListPending(false)
                    setShouldFetch(false)
                    setRateLimitInterval(0)
                    setCurrentExtensionIndex(0)
                }

            }
            catch (e) {
                console.log('Something went wrong fetching IVRs')
                console.log(e)                
            }
        }, rateLimitInterval)
    }, [currentExtensionIndex, rateLimitInterval, shouldFetch])

    return {ivrsList, isIVRsListPending, fetchIVRs}
}

export default useFetchIVRs