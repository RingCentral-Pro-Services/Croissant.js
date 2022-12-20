import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import ExtensionIsolator from '../helpers/ExtensionIsolator'
import { IVRAction, IVRaudioPrompt, IVRMenu, IVRMenuData, IVRPrompt, Site } from '../models/IVRMenu'
import RCExtension from '../models/RCExtension'
import LucidchartFilterPage from '../models/LucidchartFilterPage'
import { AudioPrompt } from '../models/AudioPrompt'
import { Message } from '../models/Message'

const useReadLucidchart = (postMessage: (message: Message) => void) => {
    let [csvData, setCSVData] = useState<any>({})
    let pageMap: {[key: string]: string} = {}
    const extensionRegex = /(x)\d+/gi  // Matches x-denoted extension numbers (Ex. x4796)
    const extRegex = /(ext)(.?)\s\d+/gi  // Matches "ext." followed by numbers (Ex. ext. 4796)
    const extTBD = /(ext[.]?)([\s]?tbd[\s]?[\d]?)/gi
    const [menus, setMenus] = useState<IVRMenu[]>([])
    const [isLucidchartPending, setIsPending] = useState(true)
    const [shouldAddKeyPresses, setShouldAddKeyPresses] = useState(false)
    let extensions: RCExtension[] = []
    const [audioPromptList, setAudioPromptList] = useState<AudioPrompt[]>([])
    const [pages, setPages] = useState<LucidchartFilterPage[]>([])

    const menuShapes = ['IVR', 'IVR Menu', 'Predefined Process']
    const externalTransferShapes = ['External Transfer', 'External Transfer/CCRN', 'Paper Tape']
    const messageOnlyShapes = ['Message Only Extension', 'Message Only', 'Message-Only', 'Data']
    const dialByNameShapes = ['Dial-by-Name', 'Dial by Name DIR', 'Dial-by-Name Directory', 'Merge']

    useEffect(() => {
        addKeyPresses()
    }, [shouldAddKeyPresses])

    const readLucidchart = (file: File, extensionList: RCExtension[], audioPromptList: AudioPrompt[]) => {
        extensions = extensionList
        setAudioPromptList(audioPromptList)
        setShouldAddKeyPresses(false)
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setCSVData(results.data)
                csvData = results.data
                createPageMap()
                createMenus()
            }
        })
    }

    const createPageMap = () => {
        let newPages: LucidchartFilterPage[] = []
        for (let index = 0; index < csvData.length; index++) {
            if (csvData[index]["Name"] === "Page") {
                let name = csvData[index]["Text Area 1"]
                let id = csvData[index]["Id"] as string
                pageMap[id] = name
                newPages.push({label: name, isChecked: true})
            }
        }
        setPages(newPages)
    }

    const createMenus = () => {
        let isolator = new ExtensionIsolator()
        let newMenus: IVRMenu[] = []
        
        for (let index = 0; index < csvData.length; index++) {
            if (menuShapes.includes(csvData[index]["Name"])) {
                let shapeText = csvData[index]["Text Area 1"]

                let extensionNumber = isolator.isolateExtension(shapeText.toString()) ?? ""
                let extensionName = shapeText.replace(extRegex, "")
                extensionName = extensionName.replace(extensionRegex, "")
                extensionName = extensionName.replace(extTBD, "")
                extensionName = extensionName.replace("\n", "")

                let id = csvData[index]["Id"]
                const pageName = pageMap[csvData[index]["Page ID"]]
                const existingID = idForExtension(extensionNumber, extensions)


                let menuData: IVRMenuData = {
                    uri: '',
                    name: extensionName,
                    extensionNumber: parseInt(extensionNumber),
                    prompt: {mode: "TextToSpeech", text: "Thank you for calling."},
                    site: getSite(pageName, extensions),
                    actions: [],
                    id: `${existingID === 0 ? randomID() : existingID}`
                }

                let menu = new IVRMenu(menuData)

                menu.lucidchartID = id
                menu.page = pageName
                
                if (!hasMenu(menu.data.extensionNumber, newMenus)) {
                    // setMenus(prev => [...prev, menu])
                    newMenus.push(menu)
                }
            }
        }
        setMenus(newMenus)
        setShouldAddKeyPresses(true)
    }

    const addKeyPresses = () => {
        if (!shouldAddKeyPresses) return

        let newMenus = menus
        for(let index = 0; index < csvData.length; index++) {
            if (csvData[index]["Name"] === 'Line') {
                let lineSourceID = csvData[index]["Line Source"]
                let lineDestinationID = csvData[index]["Line Destination"]
                let key = csvData[index]["Text Area 1"]

                for (let menuIndex = 0; menuIndex < newMenus.length; menuIndex++) {
                    if (newMenus[menuIndex].lucidchartID === lineSourceID) {
                        let destinationType = getExtensionTypeForID(lineDestinationID)
                        let extensionNumber = getExtensionNumberForID(lineDestinationID)

                        if (externalTransferShapes.includes(destinationType)) {
                            // Create an external transfer action and add it to the menu
                            let externalNumber = getExternalNumberForID(lineDestinationID)
                            let action: IVRAction = {
                                input: key,
                                action: 'Transfer',
                                phoneNumber: externalNumber ?? ""
                            }
                            newMenus[menuIndex].data.actions.push(action)
                        }
                        else if (dialByNameShapes.includes(destinationType)) {
                            // Create a dial-by-name action and add it to the menu
                            let action: IVRAction = {
                                input: key,
                                action: 'DialByName',
                            }
                            newMenus[menuIndex].data.actions.push(action)
                        }
                        else if (messageOnlyShapes.includes(destinationType)) {
                            let action: IVRAction = {
                                input: key,
                                action: 'Voicemail',
                                extension: {id: extensionNumber ?? '', uri: ''}
                            }
                            newMenus[menuIndex].data.actions.push(action)
                        }
                        else if (destinationType === "Prompts") {
                            let rawPrompt = getPromptForID(lineDestinationID)
                            const prompt = getPrompt(rawPrompt, audioPromptList)
                            newMenus[menuIndex].data.prompt = prompt

                            if (newMenus[menuIndex].data.prompt.audio) {
                                newMenus[menuIndex].audioPromptFilename = rawPrompt
                            }
                        }
                        else {
                            let action: IVRAction = {
                                input: key,
                                action: 'Connect',
                                extension: {id: extensionNumber ?? '', uri: ''}
                            }
                            newMenus[menuIndex].data.actions.push(action)
                        }
                    }
                }
            }
        }
        setMenus(newMenus)
        setIsPending(false)
    }

    const getPrompt = (rawText: string, audioPromptList: AudioPrompt[]) => {
        let prompt: IVRPrompt = {
            mode: "",
            text: ""
        }

        // TODO: Check to see if the prompt is an audio prompt
        // Then get the URI of the audio prompt

        if (rawText.includes('.mp3') || rawText.includes('.wav')) {
            const audio = getIVRAudioPrompt(rawText.trim(), audioPromptList)
            if (audio.id === '') {
                prompt.mode = 'TextToSpeech'
                prompt.text = 'Thank you for calling.'
                postMessage(new Message(`Audio prompt '${rawText}' could not be found in the account. Building with text-to-speech prompt instead`, 'warning'))
            }
            else {
                prompt.mode = 'Audio'
                prompt.audio = audio
                delete prompt.text
            }
        }
        else {
            prompt.mode = 'TextToSpeech'
            prompt.text = sanitizedPrompt(rawText)
        }

        return prompt
    }

    const getIVRAudioPrompt = (filename: string, audioPromptList: AudioPrompt[]) => {
        let result: IVRaudioPrompt = {
            uri: "",
            id: ""
        }

        for (const prompt of audioPromptList) {
            if (prompt.filename == filename) {
                result.id = prompt.id
                result.uri = prompt.uri
            }
        }

        return result
    }

    const randomID = () => {
        return Math.floor(Math.random() * 1000000)
    }

    /**
     * Remove any invalid characters from the prompt
     * @param {String} prompt The prompt to be sanitized
     * @returns The sanitized prompt as a string
     */
     const sanitizedPrompt = (prompt: any) => {
        if (prompt === undefined) return
        let result = prompt.replaceAll("_", "-")
        result = result.replaceAll("*", "star")
        result = result.replaceAll("#", "pound")
        result = result.replaceAll("@", "at")
        result = result.replaceAll("&", "and")
        result = result.replaceAll("(", "")
        result = result.replaceAll(")", "")
        result = result.replaceAll("%", "")
        result = result.replaceAll("$", "")
        result = result.replaceAll("!", ".")
        result = result.replaceAll("?", ".")
        result = result.replaceAll(":", "")
        result = result.replaceAll(";", "")
        return result
    }

    const idForExtension = (extension: string, extensionsList: RCExtension[]) => {
        for (let index = 0; index < extensionsList.length; index++) {
            if (`${extensionsList[index].extensionNumber}` == extension.toString().trim()) {
                return extensionsList[index].id
            }
        }
        return 0
    }

    /**
     * Get the extension number associated with a given ID
     * @param {string} id The ID of the shape
     * @returns The extension number that corresponds with the given ID
     */
     const getExtensionNumberForID = (id: string) => {
        let isolator = new ExtensionIsolator()
        for (let index = 0; index < csvData.length; index++) {
            if (csvData[index]["Id"] === id) {
                let rawText = csvData[index]["Text Area 1"]
                let extensionNumber = isolator.isolateExtension(rawText.toString())
                return extensionNumber
            }
        }
    }

    /**
     * Get the extension type associated with a given ID
     * @param {string} id The ID of the entity
     * @returns The extension type that corresponds to the given ID
     */
    const getExtensionTypeForID = (id: string) => {
        for (let index = 0; index < csvData.length; index++) {
            if (csvData[index]["Id"] === id) {
                return csvData[index]["Name"]
            }
        }
    }

    /**
     * Get the external phone number associated with a given ID
     * @param {string} id The ID of the entity
     * @returns The phone number that corresponds to thte given ID
     */
    const getExternalNumberForID = (id: string) => {
        const isolator = new ExtensionIsolator()

        for (let index = 0; index < csvData.length; index++) {
            if (csvData[index]["Id"] === id) {
                return isolator.isolatePhoneNumber(csvData[index]["Text Area 1"])
            }
        }
    }

    /**
     * Get the prompt associated with the given ID
     * @param {string} id The ID of the prompt shape
     * @returns The prompt associated with the give ID, or an empty string if not found
     */
    const getPromptForID = (id: string) => {
        for (let index = 0; index < csvData.length; index++) {
            if (csvData[index]["Id"] === id) {
                return csvData[index]["Text Area 1"].replace("IVR Prompt: \n", "")
            }
        }
        return ""
    }

    const hasMenu = (extensionNumber: number, menuList: IVRMenu[]) => {
        for (let index = 0; index < menuList.length; index++) {
            if (menuList[index].data.extensionNumber === extensionNumber) {
                return true
            }
        }
        return false
    }

    const getSiteID = (pageName: string) => {
        // TODO: Implement logic
        // Look for a site in the extension list with the same name as the Lucidchart page
        // If one exists, return its ID. Else return 'main-site'
        for (let index = 0; index < extensions.length; index++) {
            if (extensions[index].name === pageName) {
                return `${extensions[index].id}`
            }
        }
        return "main-site"
    }

    const getSite = (siteName: string, extensionList: RCExtension[]) => {
        let site: Site = {
            name: "Main Site",
            id: "main-site"
        }

        for (let index = 0; index < extensionList.length; index++) {
            if (extensionList[index].name === siteName) {
                site.id = `${extensionList[index].id}`
                site.name = siteName
            }
        }

        return site
    }

    return {readLucidchart, menus, isLucidchartPending, pages, setPages}
}

export default useReadLucidchart