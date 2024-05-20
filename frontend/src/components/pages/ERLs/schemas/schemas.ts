import z from 'zod'

export const deviceERLMappingSchema = z.object({
    'Device ID': z.coerce.string(),
    'ERL': z.coerce.string()
})