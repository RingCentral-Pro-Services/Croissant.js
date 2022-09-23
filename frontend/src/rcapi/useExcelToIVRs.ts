import { useState } from "react"
import { IVRAction, IVRMenu, IVRMenuData, IVRPrompt, Site } from "../models/IVRMenu"
import RCExtension from "../models/RCExtension"

const useExcelToIVRs = () => {
    const [menus, setMenus] = useState<IVRMenu[]>([])
    const [isMenuConvertPending, setPending] = useState(true)

    const converToMenus = (data: any[], extensionList: RCExtension[]) => {
        let records: IVRMenu[] = []

        for (let index = 0; index < data.length; index++) {
            let currentItem = data[index]
            let actions = getActions(data)
            let site = getSite(currentItem['Site'], extensionList)
            let prompt = getPrompt(currentItem['Prompt Name/Script'])
            let menuData: IVRMenuData = {
                uri: "",
                name: currentItem['Menu Name'],
                extensionNumber: currentItem['Menu Ext'],
                prompt: prompt,
                site: site,
                actions: actions
            }
            let menu = new IVRMenu(menuData)
            records.push(menu)
        }
        setMenus(records)
        setPending(false)
    }

    const getSite = (siteName: string, extensionList: RCExtension[]) => {
        let site: Site = {
            name: "",
            id: ""
        }

        for (let index = 0; index < extensionList.length; index++) {
            if (extensionList[index].name === siteName) {
                site.id = `${extensionList[index].id}`
            }
        }

        return site
    }

    const getPrompt = (rawText: string) => {
        let prompt: IVRPrompt = {
            mode: "",
            text: ""
        }

        // TODO: Check to see if the prompt is an audio prompt
        // Then get the URI of the audio prompt

        prompt.mode = 'TextToSpeech'
        prompt.text = rawText

        return prompt
    }

    const getActions = (data: any[]) => {
        let actions: IVRAction[] = []

        // TODO: Read actions from excel data...

        return actions
    }

    return {menus, isMenuConvertPending, converToMenus}
}

export default useExcelToIVRs