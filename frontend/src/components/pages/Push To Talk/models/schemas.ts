import z from 'zod'

export const PTTSchema = z.object({
    'Name': z.coerce.string(),
    'Members': z.coerce.string()
})