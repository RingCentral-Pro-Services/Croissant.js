import { useEffect, useState } from "react"
import { IVRMenu } from "../models/IVRMenu"
import RCExtension from "../models/RCExtension"
import rateLimit from "../helpers/rateLimit";
import ExtensionContact from "../models/ExtensionContact";
import { Message } from "../models/Message";
import { SyncError } from "../models/SyncError";
const axios = require('axios').default;

interface response {
    rateLimit: number
    id: string
}

const useCreateIVRs = (setProgressValue: (value: (any)) => void, postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number,) => void, postError: (error: SyncError) => void, isMultiSiteEnabled: boolean) => {
    let [rateLimitInterval, setRateLimitInterval] = useState(0)
    const [workingMenus, setMenus] = useState<IVRMenu[]>([])
    let [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [shouldCreateMenus, setShoudCreateMenus] = useState(false)
    const [shouldUpdateMenus, setShouldUpdateMenus] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const accessToken = localStorage.getItem('cs_access_token')
    const url = 'https://platform.ringcentral.com/restapi/v1.0/account/~/ivr-menus'
    const [exts, setExtensionList] = useState<RCExtension[]>([])

    const createMenus = (menus: IVRMenu[], extensionList: RCExtension[]) => {
        setShoudCreateMenus(true)
        setRateLimitInterval(0)
        setShouldUpdateMenus(false)
        setMenus(menus)
        setExtensionList(extensionList)
        setIsSyncing(true)
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
                    if (response.rateLimit > 0) postTimedMessage(new Message(`Rate limit reached. Waiting 60 seconds`, 'info'), 60000)
                    setRateLimitInterval(response.rateLimit)
                    let newMenus = workingMenus
                    newMenus[currentExtensionIndex].data.id = response.id
                    // addToExtensionList(workingMenus[currentExtensionIndex])
                    setCurrentExtensionIndex(currentExtensionIndex + 1)
                    increaseProgress()
                    setMenus(newMenus)
                    if (currentExtensionIndex === workingMenus.length - 1) {
                        validateKeyPresses()
                        setShouldUpdateMenus(true)
                        setShoudCreateMenus(false)
                        setCurrentExtensionIndex(0)
                    }
                })
                .catch((error: any) => {
                    console.log(`Failed to create menu '${workingMenus[currentExtensionIndex]}'`)
                    postMessage(new Message(`Failed to create menu '${workingMenus[currentExtensionIndex].data.name}.' ${error.response.data.message}`, 'error'))
                    postError(new SyncError(workingMenus[currentExtensionIndex].data.name, workingMenus[currentExtensionIndex].data.extensionNumber, ['Failed to create IVR', ''], error.response.data.message))
                    setCurrentExtensionIndex(prev => prev + 1)
                    increaseProgress()
                })
            }
        }, rateLimitInterval)
        
    }, [shouldCreateMenus, rateLimitInterval, currentExtensionIndex, workingMenus, exts])

    // Update menus
    useEffect(() => {
        if (!shouldUpdateMenus) return
        if (currentExtensionIndex === workingMenus.length) return

        setTimeout(() => {
            updateMenu(workingMenus[currentExtensionIndex])
            .then((response: any) => {
                console.log(`Menu '${workingMenus[currentExtensionIndex].data.name}' updated successfully`)
                if (response.rateLimit > 0) postTimedMessage(new Message(`Rate limit reached. Waiting 60 seconds`, 'info'), 60000)
                setRateLimitInterval(response.rateLimit)
                setCurrentExtensionIndex(currentExtensionIndex + 1)
                increaseProgress()
                if (currentExtensionIndex === workingMenus.length - 1) {
                    setShouldUpdateMenus(false)
                    setShoudCreateMenus(false)
                    setCurrentExtensionIndex(0)
                    setProgressValue(workingMenus.length * 2)
                    setIsSyncing(false)
                    console.log('Done')
                }
            })
            .catch((error: any) => {
                console.log(`Failed to update menu '${workingMenus[currentExtensionIndex]}'`)
                postMessage(new Message(`Failed to update menu '${workingMenus[currentExtensionIndex].data.name}.' ${error.response.data.message}`, 'error'))
                postError(new SyncError(workingMenus[currentExtensionIndex].data.name, workingMenus[currentExtensionIndex].data.extensionNumber, ['Failed to update IVR', ''], error.response.data.message))
                setCurrentExtensionIndex(prev => prev + 1)
                increaseProgress()
            })
        }, rateLimitInterval)

        console.log('Updating')

    }, [shouldUpdateMenus, currentExtensionIndex, rateLimitInterval, workingMenus])

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
                data: menu.payload(isMultiSiteEnabled, false),
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

    const increaseProgress = () => {
        setProgressValue((prev: any) => prev + 1)
    }

    const addToExtensionList = (menu: IVRMenu) => {
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

            let removedKeypresses: string[] = []
            menus[index].data.actions.map((action) => {
                if (action.extension && action.extension.id === '0') {
                    removedKeypresses.push(`Key ${action.input}`)
                }
            })

            if (removedKeypresses.length > 0) {
                postMessage(new Message(`The following key presses were removed from menu '${menus[index].data.name}' due to invalid destinations: ${removedKeypresses.join(', ')}`, 'warning'))
                postError(new SyncError(menus[index].data.name, menus[index].data.extensionNumber, ['Invalid key presses', removedKeypresses.join(', ')]))
            }

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
        return 0
    }

    const extensionExists = (extensionNumber: number, extensionList: RCExtension[]) => {
        for (let index = 0; index < extensionList.length; index++) {
            if (extensionList[index].extensionNumber == extensionNumber) return true
        }
        return false
    }

    return {createMenus, isSyncing}
}

export default useCreateIVRs