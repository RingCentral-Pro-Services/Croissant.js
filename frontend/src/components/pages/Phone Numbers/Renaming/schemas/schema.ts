import z from 'zod'

export const RenameNumberSchema = z.object({
    'Phone Number': z.coerce.string({required_error: 'Phone number is required'}).min(1, 'Phone number is too short'),
    'Name': z.string({required_error: 'Name is required'}).min(1, 'Name is too short')
})