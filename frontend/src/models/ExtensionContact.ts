interface ExtensionContact {
    firstName: string
    lastName: string
    email: string
    pronouncedName?: {
        type: string
        text: string
    }
}

export default ExtensionContact