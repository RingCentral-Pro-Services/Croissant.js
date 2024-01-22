import z from 'zod'

export const PTTSchema = z.object({
    'ID': z.coerce.string().trim().optional(),
    'Name': z.coerce.string(),
    'Members': z.coerce.string()
})