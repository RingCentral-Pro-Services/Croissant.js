import z from 'zod'

export const DeleteExtensionsSchema = z.object({
    'Extension Name': z.string().optional(),
    'Extension Number': z.coerce.string()
})