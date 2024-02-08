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
    const [oldRecordName, setOldRecordName] = useState('')
    const [newRecordName, setNewRecordName] = useState('')
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
        if (oldRecordName === '') setFilteredExtensions([])
        setEditedExtensions([])

        console.log('extensionsList', extensionsList)

        let filtered = extensionsList.filter((extension) => {
            return extension.contact && extension.contact.pronouncedName && (extension.contact.pronouncedName.type === 'TextToSpeech' || extension.contact.pronouncedName.type === 'Default') && extension.contact.pronouncedName.text && extension.contact.pronouncedName.text.includes(oldRecordName)
        })
        console.log('filtered', filtered)

        setFilteredExtensions(filtered)
        adjustRecordName(filtered)
    }, [oldRecordName])

    useEffect(() => {
        adjustFirstName()
    }, [newFirstName])

    useEffect(() => {
        adjustLastName()
    }, [newLastName])

    useEffect(() => {
        adjustEmail()
    }, [newEmail])

    useEffect(() => {
        adjustRecordName()
    }, [newRecordName])

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
                const newEdit = new EditedExtension(`${extension.id}`, extension.contact.firstName, extension.contact.firstName, extension.contact.lastName, extension.contact.lastName, extension.contact.email, email, extension.contact.pronouncedName?.text ?? '', extension.contact.pronouncedName?.text ?? '', extension.prettyType[extension.type])
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
                const newEdit = new EditedExtension(`${extension.id}`, extension.contact.firstName, firstName, extension.contact.lastName, extension.contact.lastName, extension.contact.email, extension.contact.email, extension.contact.pronouncedName?.text ?? '', extension.contact.pronouncedName?.text ?? '', extension.prettyType[extension.type])
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
                const newEdit = new EditedExtension(`${extension.id}`, extension.contact.firstName, extension.contact.firstName, extension.contact.lastName, lastName, extension.contact.email, extension.contact.email, extension.contact.pronouncedName?.text ?? '', extension.contact.pronouncedName?.text ?? '', extension.prettyType[extension.type])
                edits.push(newEdit)
            }
        })

        setEditedExtensions(edits)
    }

    const adjustRecordName = (filtered: RCExtension[] = []) => {
        console.log('adjustRecordName')
        if (filtered.length === 0) filtered = filteredExtensions

        let edits: EditedExtension[] = []
        filtered.map((extension) => {

            if (extension.contact.pronouncedName?.type === 'TextToSpeech' || extension.contact.pronouncedName?.type === 'Default') {
                const recordName = extension.contact.pronouncedName.text.replaceAll(oldRecordName, newRecordName)

                let existingExtension = edits.filter((currentExtension) => `${extension.id}` === currentExtension.id)
                if (existingExtension.length > 0) {
                    existingExtension[0].newRecordName = recordName
                }
                else {
                    const newEdit = new EditedExtension(`${extension.id}`, extension.contact.firstName, extension.contact.firstName, extension.contact.lastName, extension.contact.lastName, extension.contact.email, extension.contact.email, extension.contact.pronouncedName?.text ?? '', recordName, extension.prettyType[extension.type])
                    edits.push(newEdit)
                }
            }
        })

        setEditedExtensions(edits)
    }

    return { setOldFirstName, setOldLastName, setOldEmail, setNewFirstName, setNewLastName, setNewEmail, setOldRecordName, setNewRecordName, editedExtensions }
}

export default useExtensionEditing