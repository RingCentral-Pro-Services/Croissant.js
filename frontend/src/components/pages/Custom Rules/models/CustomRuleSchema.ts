import z from 'zod'

export const CustomRuleSchema = z.object({
    'Ext Number': z.string().or(z.number()),
    'Rule Name': z.string().or(z.number()),
    'Enabled': z.string({
        required_error: 'Rule status is required',
        invalid_type_error: 'Rule status must be "Yes" or "No"',
    }),
    'Caller ID': z.string().or(z.number()).optional(),
    'Called Number': z.string().or(z.number()).optional(),
    'Work or After Hours': z.string().optional(),
    'Sunday': z.string().optional(),
    'Monday': z.string().optional(),
    'Tuesday': z.string().optional(),
    'Wednesday': z.string().optional(),
    'Thursday': z.string().optional(),
    'Friday': z.string().optional(),
    'Saturday': z.string().optional(),
    'Specific Dates': z.string().optional(),
    'Action': z.string({
        required_error: 'Rule action is required',
        invalid_type_error: 'Rule action invalid type',
    }),
    'Transfer Extension': z.string().or(z.number()).optional(),
    'External Number': z.string().or(z.number()).optional(),
    'Voicemail Recipient': z.string().or(z.number()).optional(),
})