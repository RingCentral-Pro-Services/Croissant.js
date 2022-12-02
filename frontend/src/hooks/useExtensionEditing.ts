import { useEffect, useState } from "react"
import { EditedExtension } from "../models/EditedExtension"
import RCExtension from "../models/RCExtension"

const useExtensionEditing = (extensionsList: RCExtension[]) => {
    const [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])
    const [editedExtensions, setEditedExtensions] = useState<EditedExtension[]>([])
    const [oldFirstName, setOldFirstName] = useState('')
    const [newFirstName, setNewFirstName] = useState('')
    const [oldLastName, setOldLastName] = useState('')
    const [newLastName, setNewLastName] = useState('')
    const [oldEmail, setOldEmail] = useState('')
    const [newEmail, setNewEmail] = useState('')
    
    useEffect(() => {
        if (oldFirstName === '') setFilteredExtensions([])

        let filtered = extensionsList.filter((extension) => {
            return extension.contact && extension.contact.firstName && extension.contact.firstName.includes(oldFirstName)
        })

        setFilteredExtensions(filtered)
        adjustFirstName(filtered)
    }, [oldFirstName])

    useEffect(() => {
        if (oldLastName === '') setFilteredExtensions([])
        setEditedExtensions([])

        let filtered = extensionsList.filter((extension) => {
            return extension.contact && extension.contact.lastName && extension.contact.lastName.includes(oldLastName)
        })

        setFilteredExtensions(filtered)
        adjustLastName(filtered)
    }, [oldLastName])

    useEffect(() => {
        if (oldEmail === '') setFilteredExtensions([])
        setEditedExtensions([])

        let filtered = extensionsList.filter((extension) => {
            return extension.contact && extension.contact.email && extension.contact.email.includes(oldEmail)
        })

        setFilteredExtensions(filtered)
        adjustEmail(filtered)
    }, [oldEmail])

    useEffect(() => {
        adjustFirstName()
    }, [newFirstName])

    useEffect(() => {
        adjustLastName()
    }, [newLastName])

    useEffect(() => {
        adjustEmail()
    }, [newEmail])

    const adjustEmail = (filtered: RCExtension[] = []) => {
        if (filtered.length === 0) filtered = filteredExtensions

        let edits: EditedExtension[] = []
        filtered.map((extension) => {
            const email = extension.contact.email.replaceAll(oldEmail, newEmail)

            let existingExtension = edits.filter((currentExtension) => `${extension.id}` === currentExtension.id)
            if (existingExtension.length > 0) {
                existingExtension[0].newEmail = email
            }
            else {
                const newEdit = new EditedExtension(`${extension.id}`, extension.contact.firstName, extension.contact.firstName, extension.contact.lastName, extension.contact.lastName, extension.contact.email, email, extension.prettyType[extension.type])
                edits.push(newEdit)
            }
        })

        setEditedExtensions(edits)
    }

    const adjustFirstName = (filtered: RCExtension[] = []) => {
        if (filtered.length === 0) filtered = filteredExtensions

        let edits: EditedExtension[] = []
        filtered.map((extension) => {
            const firstName = extension.contact.firstName.replaceAll(oldFirstName, newFirstName)

            let existingExtension = edits.filter((currentExtension) => `${extension.id}` === currentExtension.id)
            if (existingExtension.length > 0) {
                existingExtension[0].newFirstName = firstName
            }
            else {
                const newEdit = new EditedExtension(`${extension.id}`, extension.contact.firstName, firstName, extension.contact.lastName, extension.contact.lastName, extension.contact.email, extension.contact.email, extension.prettyType[extension.type])
                edits.push(newEdit)
            }
        })

        setEditedExtensions(edits)
    }

    const adjustLastName = (filtered: RCExtension[] = []) => {
        if (filtered.length === 0) filtered = filteredExtensions

        let edits: EditedExtension[] = []
        filtered.map((extension) => {
            const lastName = extension.contact.lastName.replaceAll(oldLastName, newLastName)

            let existingExtension = edits.filter((currentExtension) => `${extension.id}` === currentExtension.id)
            if (existingExtension.length > 0) {
                existingExtension[0].newLastName = lastName
            }
            else {
                const newEdit = new EditedExtension(`${extension.id}`, extension.contact.firstName, extension.contact.firstName, extension.contact.lastName, lastName, extension.contact.email, extension.contact.email, extension.prettyType[extension.type])
                edits.push(newEdit)
            }
        })

        setEditedExtensions(edits)
    }

    return {setOldFirstName, setOldLastName, setOldEmail, setNewFirstName, setNewLastName, setNewEmail, editedExtensions}
}

export default useExtensionEditing