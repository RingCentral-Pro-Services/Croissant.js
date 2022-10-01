import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import ExtensionIsolator from '../helpers/ExtensionIsolator'
import { IVRAction, IVRMenu, IVRMenuData } from '../models/IVRMenu'
import RCExtension from '../models/RCExtension'
import LucidchartFilterPage from '../models/LucidchartFilterPage'

const useReadLucidchart = () => {
    let [csvData, setCSVData] = useState<any>({})
    let pageMap: {[key: string]: string} = {}
    const extensionRegex = /(x)\d+/gi  // Matches x-denoted extension numbers (Ex. x4796)
    const extRegex = /(ext)(.?)\s\d+/gi  // Matches "ext." followed by numbers (Ex. ext. 4796)
    const extTBD = /(ext[.]?)([\s]?tbd[\s]?[\d]?)/gi
    const [menus, setMenus] = useState<IVRMenu[]>([])
    const [isLucidchartPending, setIsPending] = useState(true)
    const [shouldAddKeyPresses, setShouldAddKeyPresses] = useState(false)
    let extensions: RCExtension[] = []
    const [pages, setPages] = useState<LucidchartFilterPage[]>([])

    useEffect(() => {
        console.log(menus)
        addKeyPresses()
    }, [shouldAddKeyPresses])

    const readLucidchart = (file: File, extensionList: RCExtension[]) => {
        extensions = extensionList
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
        console.log(csvData)
        let newPages: LucidchartFilterPage[] = []
        for (let index = 0; index < csvData.length; index++) {
            if (csvData[index]["Name"] == "Page") {
                let name = csvData[index]["Text Area 1"]
                let id = csvData[index]["Id"] as string
                pageMap[id] = name
                newPages.push({text: name, isChecked: true})
            }
        }
        setPages(newPages)
    }

    const createMenus = () => {
        let isolator = new ExtensionIsolator()
        let newMenus: IVRMenu[] = []
        console.log(`Extensions: ${extensions.length}`)
        
        for (let index = 0; index < csvData.length; index++) {
            if (csvData[index]["Name"] == "IVR") {
                let shapeText = csvData[index]["Text Area 1"]

                let extensionNumber = isolator.isolateExtension(shapeText.toString()) ?? ""
                let extensionName = shapeText.replace(extRegex, "")
                extensionName = extensionName.replace(extensionRegex, "")
                extensionName = extensionName.replace(extTBD, "")
                extensionName = extensionName.replace("\n", "")

                let id = csvData[index]["Id"]
                const pageName = pageMap[csvData[index]["Page ID"]]

                let menuData: IVRMenuData = {
                    uri: '',
                    name: extensionName,
                    extensionNumber: parseInt(extensionNumber),
                    prompt: {mode: "TextToSpeech", text: "Thank you for calling."},
                    site: {id: getSiteID(pageName), name: ""},
                    actions: [],
                    id: `${idForExtension(extensionNumber, extensions)}`
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
            if (csvData[index]["Name"] == 'Line') {
                let lineSourceID = csvData[index]["Line Source"]
                let lineDestinationID = csvData[index]["Line Destination"]
                let key = csvData[index]["Text Area 1"]

                for (let menuIndex = 0; menuIndex < newMenus.length; menuIndex++) {
                    if (newMenus[menuIndex].lucidchartID == lineSourceID) {
                        let destinationType = getExtensionTypeForID(lineDestinationID)
                        let extensionNumber = getExtensionNumberForID(lineDestinationID)

                        if (destinationType == "External Transfer") {
                            // Create an external transfer action and add it to the menu
                            let externalNumber = getExternalNumberForID(lineDestinationID)
                            let action: IVRAction = {
                                input: key,
                                action: 'Transfer',
                                phoneNumber: externalNumber ?? ""
                            }
                            newMenus[menuIndex].data.actions.push(action)
                        }
                        else if (destinationType == "Dial-by-Name") {
                            // Create a dial-by-name action and add it to the menu
                            let action: IVRAction = {
                                input: key,
                                action: 'DialByName',
                            }
                            newMenus[menuIndex].data.actions.push(action)
                        }
                        else if (destinationType == "Message Only Extension") {
                            let action: IVRAction = {
                                input: key,
                                action: 'Voicemail',
                                extension: {id: extensionNumber ?? '', uri: ''}
                            }
                            newMenus[menuIndex].data.actions.push(action)
                        }
                        else if (destinationType == "Prompts") {
                            newMenus[menuIndex].data.prompt = getPromptForID(lineDestinationID)
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
            if (csvData[index]["Id"] == id) {
                let rawText = csvData[index]["Text Area 1"]
                let extensionNumber = isolator.isolateExtension(rawText.toString())
                return extensionNumber
            }
        }
    }

    /**
     * Get the extension name assiciated with a given ID
     * @param {string} id The ID of the entiry
     * @returns The extension name that corresponds with the given ID
     */
    const getExtensionNameforID = (id: string) => {
        for (let index = 0; index < csvData.length; index++) {
            if (csvData[index]["Id"] == id) {
                let rawText = csvData[index]["Text Area 1"]
                let extensionName = rawText.replace(extRegex, "")
                extensionName = extensionName.replace(extensionRegex, "")
                extensionName = extensionName.replace("\n", "")
                return extensionName
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
            if (csvData[index]["Id"] == id) {
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
            if (csvData[index]["Id"] == id) {
                return isolator.isolatePhoneNumber(csvData[index]["Text Area 1"])
            }
        }
    }

    /**
     * Get the extension number 
     * @param {string} name The name of the menu
     * @returns The extension number associated with the given menu name or -1
     * if not found
     */
    const getExtensionforMenuName = (name: string) => {
        for (let index = 0; index < menus.length; index++) {
            if (menus[index].data.name == name) {
                return menus[index].data.extensionNumber
            }
        }
        return -1
    }

    /**
     * Get the prompt associated with the given ID
     * @param {string} id The ID of the prompt shape
     * @returns The prompt associated with the give ID, or an empty string if not found
     */
    const getPromptForID = (id: string) => {
        for (let index = 0; index < csvData.length; index++) {
            if (csvData[index]["Id"] == id) {
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

    return {readLucidchart, menus, isLucidchartPending, pages, setPages}
}

export default useReadLucidchart