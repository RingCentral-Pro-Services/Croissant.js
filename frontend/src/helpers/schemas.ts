import z from 'zod'

export const ivrSchema = z.object({
    'Menu Name': z.string({
        required_error: 'Missing Menu Name',
        invalid_type_error: 'Menu Name data type invalid'
    }),
    'Site': z.string({
        required_error: 'Missing Site',
        invalid_type_error: 'Site data type invalid'
    }),
    'Menu Ext': z.string({
        required_error: 'Missing Menu Ext',
        invalid_type_error: 'Menu Ext data type invalid'
    }),
    'Prompt Name/Script': z.string({
        required_error: 'Missing Prompt Name/Script',
        invalid_type_error: 'Prompt Name/Script data type invalid'
    }),
    'Key 1 Action': z.string({
        invalid_type_error: 'Key 1 Action data type invalid',
    }).optional(),
    'Key 1 Destination': z.string({
        invalid_type_error: 'Key 1 Destination data type invalid',
    }).optional(),
    'Key 2 Action': z.string({
        invalid_type_error: 'Key 2 Action data type invalid',
    }).optional(),
    'Key 2 Destination': z.string({
        invalid_type_error: 'Key 2 Destination data type invalid',
    }).optional(),
    'Key 3 Action': z.string({
        invalid_type_error: 'Key 3 Action data type invalid',
    }).optional(),
    'Key 3 Destination': z.string({
        invalid_type_error: 'Key 3 Destination data type invalid',
    }).optional(),
    'Key 4 Action': z.string({
        invalid_type_error: 'Key 4 Action data type invalid',
    }).optional(),
    'Key 4 Destination': z.string({
        invalid_type_error: 'Key 4 Destination data type invalid',
    }).optional(),
    'Key 5 Action': z.string({
        invalid_type_error: 'Key 5 Action data type invalid',
    }).optional(),
    'Key 5 Destination': z.string({
        invalid_type_error: 'Key 5 Destination data type invalid',
    }).optional(),
    'Key 6 Action': z.string({
        invalid_type_error: 'Key 6 Action data type invalid',
    }).optional(),
    'Key 6 Destination': z.string({
        invalid_type_error: 'Key 6 Destination data type invalid',
    }).optional(),
    'Key 7 Action': z.string({
        invalid_type_error: 'Key 7 Action data type invalid',
    }).optional(),
    'Key 7 Destination': z.string({
        invalid_type_error: 'Key 7 Destination data type invalid',
    }).optional(),
    'Key 8 Action': z.string({
        invalid_type_error: 'Key 8 Action data type invalid',
    }).optional(),
    'Key 8 Destination': z.string({
        invalid_type_error: 'Key 8 Destination data type invalid',
    }).optional(),
    'Key 9 Action': z.string({
        invalid_type_error: 'Key 9 Action data type invalid',
    }).optional(),
    'Key 9 Destination': z.string({
        invalid_type_error: 'Key 9 Destination data type invalid',
    }).optional(),
    'Key 0 Action': z.string({
        invalid_type_error: 'Key 0 Action data type invalid',
    }).optional(),
    'Key 0 Destination': z.string({
        invalid_type_error: 'Key 0 Destination data type invalid',
    }).optional(),
})

export const callQueueSchema = z.object({
    'Queue Name': z.string({
        required_error: 'Missing queue name',
        invalid_type_error: 'Queue name data type invalid'
    }),
    'Extension': z.string({
        required_error: 'Missing extension number',
        invalid_type_error: 'Extension number data type invalid'
    }),
    'Email': z.string({
        required_error: 'Missing email',
        invalid_type_error: 'Email data type invalid'
    }),
    'Site': z.string({
        required_error: 'Missing site',
        invalid_type_error: 'Site data type invalid'
    }),
    'Members (Ext)': z.string({
        required_error: 'Missing members',
        invalid_type_error: 'Members data type invalid'
    })
})

export const notificationSchema = z.object({
    'Mailbox ID': z.string({
        required_error: 'Missing Mailbox ID',
        invalid_type_error: 'Mailbox ID type invalid'
    }),
    'Email Addresses': z.string({
        required_error: 'Missing email addresses',
        invalid_type_error: 'Email addresses type invalid'
    }),
})

export const promptSchema = z.object({
    'Prompt Name': z.string({
        required_error: 'Missing prompt name',
        invalid_type_error: 'Prompt name data type invalid'
    }),
    'Prompt Text': z.string({
        required_error: 'Missing prompt text',
        invalid_type_error: 'Prompt text data type invalid'
    })
})