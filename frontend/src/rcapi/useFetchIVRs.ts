import { useEffect, useState } from "react"
import { IVRMenu, IVRMenuData } from "../models/IVRMenu"
import RCExtension from "../models/RCExtension"
import { RestCentral } from "./RestCentral"
import { IVRPrompt } from "../models/IVRMenu"
import { Message } from "../models/Message"
import { SyncError } from "../models/SyncError"

const useFetchIVRs = (setProgressValue: (value: (any)) => void, setMaxProgressValue: (value: any) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [isIVRsListPending, setIsIVRsListPending] = useState(true)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [ivrsList, setIvrsList] = useState<IVRMenu[]>([])
    const [ivrExtensions, setIvrExtensions] = useState<RCExtension[]>([])
    let [shouldFetch, setShouldFetch] = useState(false)
    let [rateLimitInterval, setRateLimitInterval] = useState(250)
    const baseURL = 'https://platform.ringcentral.com/restapi/v1.0/account/~/ivr-menus/ivrMenuId'
    const accessToken = localStorage.getItem('cs_access_token')

    const fetchIVRs = (extensionList: RCExtension[]) => {
        const ivrs = extensionList.filter((extension) => {
            return extension.type === 'IvrMenu'
        })
        setMaxProgressValue(ivrs.length)
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
            setProgressValue(ivrExtensions.length)
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

                if (response.rateLimitInterval > 0) postTimedMessage(new Message(`Rate limit reached. Resuming in 60 seconds`, 'info'), 60000)
                if (response.rateLimitInterval > 0) {
                    setRateLimitInterval(response.rateLimitInterval)
                }
                else {
                    setRateLimitInterval(250)
                }

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
                if ("site" in menuData && menuData.site.name === undefined) {
                    menuData.site.name = "Main Site"
                }
                const menu = new IVRMenu(menuData)
                setIvrsList(prev => [...prev, menu])
                
                if (currentExtensionIndex != ivrExtensions.length) {
                    increaseProgress()
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

    const increaseProgress = () => {
        setProgressValue((prev: any) => prev + 1)
    }

    return {ivrsList, isIVRsListPending, fetchIVRs}
}

export default useFetchIVRs