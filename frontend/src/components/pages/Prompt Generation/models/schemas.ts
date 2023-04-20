import z from 'zod'

export const PromptSchema = z.object({
    'Prompt Name': z.coerce.string({
        required_error: 'Prompt Name is required',
        invalid_type_error: 'Prompt Name must be text'
    }),
    'Prompt Text': z.string({
        required_error: 'Prompt Text is required',
        invalid_type_error: 'Prompt Text must be text'
    })
})