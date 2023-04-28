import z from 'zod'

export const CustomRuleSchema = z.object({
    'Ext Number': z.coerce.string(),
    'Rule Name': z.coerce.string(),
    'Rule ID': z.coerce.string().optional(),
    'Enabled': z.string({
        required_error: 'Rule status is required',
        invalid_type_error: 'Rule status must be "Yes" or "No"',
    }),
    'Caller ID': z.coerce.string().optional(),
    'Called Number': z.coerce.string().optional(),
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
    'Transfer Extension': z.coerce.string().optional(),
    'External Number': z.coerce.string().optional(),
    'Voicemail Recipient': z.coerce.string().optional(),
})