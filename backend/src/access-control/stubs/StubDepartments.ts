import { Department } from "../interfaces/Department";

export const stubDepartments: Department[] = [
    {
        id: 1,
        name: 'Sales',
        addedByName: 'John Person',
        addedByEmail: 'john.person@realcompany.com',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        name: 'Marketing',
        addedByName: 'John Person',
        addedByEmail: 'john.person@realcompany.com',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 3,
        name: 'Finance',
        addedByName: 'Michael Person',
        addedByEmail: 'michael.person@realcompany.com',
        createdAt: new Date(),
        updatedAt: new Date()
    }
]