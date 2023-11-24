export interface User {
    id: string
    name: string
    contact: {
        firstName: string
        lastName: string
        email: string
        department: string
    }
}