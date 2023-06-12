import { Extension } from "../models/Extension";

export const idForExtension = (targetExtension: string | number, extensionList: Extension[], extensionType?: string) => {
    let filteredExtensions: Extension[] = extensionList

    if (extensionType) {
        filteredExtensions = extensionList.filter((ext) => ext.prettyType() === extensionType)
    }

    for (const extension of extensionList) {
        if (extension.data.extensionNumber === `${targetExtension}` && extension.prettyType() === extensionType) {
            return extension.data.id
        }
    }
    return 0
}

export const extensionForID = (targetID: string | number, extensions: Extension[]) => {
    return extensions.find((ext) => `${ext.data.id}` === `${targetID}`)
}

export const wait = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}