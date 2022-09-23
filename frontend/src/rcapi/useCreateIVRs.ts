import { useState } from "react"
import { IVRMenu } from "../models/IVRMenu"
import RCExtension from "../models/RCExtension"
import rateLimit from "../helpers/rateLimit";
const axios = require('axios').default;

const useCreateIVRs = () => {
    const [menus, setMenus] = useState<IVRMenu[]>([])
    let [shouldFetch, setShouldFetch] = useState(false)
    let [rateLimitInterval, setRateLimitInterval] = useState(0)
    let [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [isMenuCreationPending, setIsPending] = useState(true)
    const accessToken = localStorage.getItem('cs_access_token')
    const url = 'https://platform.devtest.ringcentral.com/restapi/v1.0/account/~/ivr-menus'

    const createMenus = (menus: IVRMenu[], extensionList: RCExtension[]) => {
        // setMenus(menus)
        // setShouldFetch(true)
        // setCurrentExtensionIndex(0)
        createMenu(menus[0])
        .then((rateLimit: any) => {
            console.log('Sucess')
            console.log(`Rate limit: ${rateLimit}`)
        })
        .catch((error) => {
            console.log('Something bad happened')
            console.log(error)
        })
    }

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
                resolve(interval)
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

    }

    const extensionExists = (extensionNumber: number, extensionList: RCExtension[]) => {
        for (let index = 0; index < extensionList.length; index++) {
            if (extensionList[index].extensionNumber === extensionNumber) return true
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