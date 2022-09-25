import { useEffect, useState } from "react"
import { IVRMenu } from "../models/IVRMenu"
import RCExtension from "../models/RCExtension"
import rateLimit from "../helpers/rateLimit";
import ExtensionContact from "../models/ExtensionContact";
const axios = require('axios').default;

interface response {
    rateLimit: number
    id: string
}

const useCreateIVRs = () => {
    let [rateLimitInterval, setRateLimitInterval] = useState(0)
    const [workingMenus, setMenus] = useState<IVRMenu[]>([])
    let [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [shouldCreateMenus, setShoudCreateMenus] = useState(false)
    const [shouldUpdateMenus, setShouldUpdateMenus] = useState(false)
    const accessToken = localStorage.getItem('cs_access_token')
    const url = 'https://platform.devtest.ringcentral.com/restapi/v1.0/account/~/ivr-menus'
    const [exts, setExtensionList] = useState<RCExtension[]>([])

    const createMenus = (menus: IVRMenu[], extensionList: RCExtension[]) => {
        setShoudCreateMenus(true)
        setRateLimitInterval(0)
        setShouldUpdateMenus(false)
        setMenus(menus)
        setExtensionList(extensionList)
    }

    // Create menus
    useEffect(() => {
        if (!shouldCreateMenus) return
        if (currentExtensionIndex === workingMenus.length) {
            validateKeyPresses()
            setShouldUpdateMenus(true)
            setShoudCreateMenus(false)
            setCurrentExtensionIndex(0)
            return
        }

        console.log('Creating')
        setTimeout(() => {
            if (extensionExists(workingMenus[currentExtensionIndex].data.extensionNumber, exts)) {
                setCurrentExtensionIndex(currentExtensionIndex + 1)
            }
            else {
                createMenu(workingMenus[currentExtensionIndex])
                .then((response: any) => {
                    console.log(`Menu '${workingMenus[currentExtensionIndex].data.name}' created successfully`)
                    setRateLimitInterval(response.rateLimit)
                    let newMenus = workingMenus
                    newMenus[currentExtensionIndex].data.id = response.id
                    // addToExtensionList(workingMenus[currentExtensionIndex])
                    setCurrentExtensionIndex(currentExtensionIndex + 1)
                    setMenus(newMenus)
                    if (currentExtensionIndex === workingMenus.length - 1) {
                        validateKeyPresses()
                        setShouldUpdateMenus(true)
                        setShoudCreateMenus(false)
                        setCurrentExtensionIndex(0)
                    }
                })
                .catch((error: Error) => {
                    console.log(`Failed to create menu '${workingMenus[currentExtensionIndex]}'`)
                })
            }
        }, rateLimitInterval)
        
    }, [shouldCreateMenus, rateLimitInterval, currentExtensionIndex])

    // Update menus
    useEffect(() => {
        if (!shouldUpdateMenus) return
        if (currentExtensionIndex === workingMenus.length) return

        setTimeout(() => {
            updateMenu(workingMenus[currentExtensionIndex])
            .then((response: any) => {
                console.log(`Menu '${workingMenus[currentExtensionIndex].data.name}' updated successfully`)
                setRateLimitInterval(response.rateLimit)
                setCurrentExtensionIndex(currentExtensionIndex + 1)
                if (currentExtensionIndex === workingMenus.length - 1) {
                    setShouldUpdateMenus(false)
                    setShoudCreateMenus(false)
                    setCurrentExtensionIndex(0)
                    console.log('Done')
                }
            })
            .catch((error: Error) => {
                console.log(`Failed to update menu '${workingMenus[currentExtensionIndex]}'`)
            })
        }, rateLimitInterval)

        console.log('Updating')

    }, [shouldUpdateMenus, currentExtensionIndex])

    const createMenu = (menu: IVRMenu) => {
        let promise = new Promise((resolve, reject) => {
            axios({
                method: "POST",
                url: url,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                data: {
                    name: menu.data.name,
                    extensionNumber: menu.data.extensionNumber,
                    site: menu.data.site,
                    prompt: menu.data.prompt
                },
              })
              .then((res: any) => {
                console.log(res)
                let interval = rateLimit(res.headers)
                let id = res.data.id
                menu.data.id = id
                addToExtensionList(menu)
                let response: response = {
                    rateLimit: interval,
                    id: id
                }
                resolve(response)
              })
              .catch((error: Error) => {
                console.log('Something bad happened')
                console.log(error)
                reject(error)
              })
        })
        return promise
    }

    const updateMenu = (menu: IVRMenu) => {
        let promise = new Promise((resolve, reject) => {
            axios({
                method: "PUT",
                url: `${url}/${menu.data.id}`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                data: {
                    name: menu.data.name,
                    site: menu.data.site,
                    prompt: menu.data.prompt,
                    actions: menu.data.actions
                },
                })
                .then((res: any) => {
                console.log(res)
                let interval = rateLimit(res.headers)
                let id = res.data.id
                let response: response = {
                    rateLimit: interval,
                    id: id
                }
                resolve(response)
                })
                .catch((error: Error) => {
                console.log('Something bad happened')
                console.log(error)
                reject(error)
            })
        })
        return promise
    }

    const addToExtensionList = (menu: IVRMenu) => {
        console.log(`Adding menu ${menu.data.extensionNumber} to extension list`)
        let newExtensionList = [...exts]
        let contact: ExtensionContact = {
            firstName: menu.data.name,
            lastName: "",
            email: ""
        }
        let id = parseInt(menu.data.id!)
        console.log(id)
        let newExtension = new RCExtension(id, menu.data.extensionNumber, menu.data.name, contact, menu.data.site.id, 'IvrMenu', 'Enabled', false, '')
        newExtensionList.push(newExtension)
        exts.push(newExtension)
        // setExtensionList(newExtensionList)
    }

    const validateKeyPresses = () => {
        let menus = workingMenus

        // Loop through each menu
        for (let index = 0; index < menus.length; index++) {
            // Loop through each key press
            for (let actionIndex = 0; actionIndex < menus[index].data.actions.length; actionIndex++) {
                let destinationID = idForExtension(menus[index].data.actions[actionIndex].extension?.id ?? '', exts)
                if (menus[index].data.actions[actionIndex].extension) {
                    menus[index].data.actions[actionIndex].extension!.id = `${destinationID}`
                }
            }
            let validActions = menus[index].data.actions.filter((action) => {
                if (action.extension) {
                    return action.extension.id !== '0'
                }
                return true
            })
            menus[index].data.actions = validActions
        }

        console.log(menus)
    }

    const idForExtension = (extension: string, extensionsList: RCExtension[]) => {
        for (let index = 0; index < extensionsList.length; index++) {
            if (`${extensionsList[index].extensionNumber}` == `${extension}`) {
                return extensionsList[index].id
            }
        }
        console.log(`No ID for extension ${extension}`)
        console.log(extensionsList)
        return 0
    }

    const extensionExists = (extensionNumber: number, extensionList: RCExtension[]) => {
        for (let index = 0; index < extensionList.length; index++) {
            if (extensionList[index].extensionNumber == extensionNumber) return true
        }
        return false
    }

    const isIVRMenu = (extensionNumber: number, extensionList: RCExtension[]) => {
        for (let index = 0; index < extensionList.length; index++) {
            if (extensionList[index].extensionNumber === extensionNumber && extensionList[index].type === 'IvrMenu') return true
        }
        return false
    }

    return {createMenus}
}

export default useCreateIVRs