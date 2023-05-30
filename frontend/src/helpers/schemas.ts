import z from 'zod'

export const ivrSchema = z.object({
    'Menu Name': z.coerce.string({
        required_error: 'Missing Menu Name',
        invalid_type_error: 'Menu Name data type invalid'
    }).min(1),
    'Site': z.coerce.string({
        required_error: 'Missing Site',
        invalid_type_error: 'Site data type invalid'
    }),
    'Menu Ext': z.coerce.number({
        required_error: 'Missing Menu Ext',
        invalid_type_error: 'Menu Ext data type invalid'
    }),
    'Prompt Name/Script': z.string({
        required_error: 'Missing Prompt Name/Script',
        invalid_type_error: 'Prompt Name/Script data type invalid',
    }),
    'Key 1 Action': z.string({
        invalid_type_error: 'Key 1 Action data type invalid',
    }).optional(),
    'Key 1 Destination': z.coerce.string({
        invalid_type_error: 'Key 1 Destination data type invalid',
    }).optional(),
    'Key 2 Action': z.string({
        invalid_type_error: 'Key 2 Action data type invalid',
    }).optional(),
    'Key 2 Destination': z.coerce.string({
        invalid_type_error: 'Key 2 Destination data type invalid',
    }).optional(),
    'Key 3 Action': z.string({
        invalid_type_error: 'Key 3 Action data type invalid',
    }).optional(),
    'Key 3 Destination': z.coerce.string({
        invalid_type_error: 'Key 3 Destination data type invalid',
    }).optional(),
    'Key 4 Action': z.string({
        invalid_type_error: 'Key 4 Action data type invalid',
    }).optional(),
    'Key 4 Destination': z.coerce.string({
        invalid_type_error: 'Key 4 Destination data type invalid',
    }).optional(),
    'Key 5 Action': z.string({
        invalid_type_error: 'Key 5 Action data type invalid',
    }).optional(),
    'Key 5 Destination': z.coerce.string({
        invalid_type_error: 'Key 5 Destination data type invalid',
    }).optional(),
    'Key 6 Action': z.string({
        invalid_type_error: 'Key 6 Action data type invalid',
    }).optional(),
    'Key 6 Destination': z.coerce.string({
        invalid_type_error: 'Key 6 Destination data type invalid',
    }).optional(),
    'Key 7 Action': z.string({
        invalid_type_error: 'Key 7 Action data type invalid',
    }).optional(),
    'Key 7 Destination': z.coerce.string({
        invalid_type_error: 'Key 7 Destination data type invalid',
    }).optional(),
    'Key 8 Action': z.string({
        invalid_type_error: 'Key 8 Action data type invalid',
    }).optional(),
    'Key 8 Destination': z.coerce.string({
        invalid_type_error: 'Key 8 Destination data type invalid',
    }).optional(),
    'Key 9 Action': z.string({
        invalid_type_error: 'Key 9 Action data type invalid',
    }).optional(),
    'Key 9 Destination': z.coerce.string({
        invalid_type_error: 'Key 9 Destination data type invalid',
    }).optional(),
    'Key 0 Action': z.string({
        invalid_type_error: 'Key 0 Action data type invalid',
    }).optional(),
    'Key 0 Destination': z.coerce.string({
        invalid_type_error: 'Key 0 Destination data type invalid',
    }).optional(),
})

export const callQueueSchema = z.object({
    'Queue Name': z.string({
        required_error: 'Missing queue name',
        invalid_type_error: 'Queue name data type invalid'
    }),
    'Extension': z.coerce.string({
        required_error: 'Missing extension number',
        invalid_type_error: 'Extension number data type invalid'
    }),
    'Queue Email': z.string().optional(),
    'Email': z.string().optional(),
    'Site': z.coerce.string({
        required_error: 'Missing site',
        invalid_type_error: 'Site data type invalid'
    }),
    'Members (Ext)': z.coerce.string({
        required_error: 'Missing members',
        invalid_type_error: 'Members data type invalid'
    }).default(''),
    'Queue Manager': z.coerce.string().optional(),
    'Greeting': z.string().optional(),
    'Audio While Connecting': z.string().optional(),
    'Hold Music': z.string().optional(),
    'Interrupt Audio': z.string().optional(),
    'Interrupt Prompt': z.string().optional(),
    'Member Queue Status': z.string().optional(),
    'Callers In Queue': z.string().optional(),
    'Max Wait Time Action': z.coerce.string().optional(),
    'Max Wait Time Destination': z.coerce.string().optional(),
    'Max Callers Action': z.coerce.string().optional(),
    'Max Callers Destination': z.coerce.string().optional(),
    'When Queue is Full': z.string().optional(),
    'Queue Full Destination': z.coerce.string().optional(),
    'When Max Time is Reached': z.string().optional(),
    'Time Reached Destination': z.coerce.string().optional(),
    'Voicemail Recipients': z.coerce.string().optional(),
    'Voicemail Notifications': z.string().optional(),
    'Voicemail Notifications Email': z.string().optional(),
    'After Hours Behavior': z.string().optional(),
    'After Hours Destination': z.coerce.string().optional(),
    'Ring Type': z.string().optional(),
    'User Ring Time': z.string().optional(),
    'Total Ring Time': z.string().optional(),
    'Wrap Up Time': z.string().optional(),
    'Voicemail Greeting': z.string().optional(),
    'Queue PIN': z.coerce.string().optional()
})

export const notificationSchema = z.object({
    'Mailbox ID': z.coerce.string({
        required_error: 'Missing Mailbox ID',
        invalid_type_error: 'Mailbox ID type invalid'
    }),
    'Email Addresses': z.string({
        required_error: 'Missing email addresses',
        invalid_type_error: 'Email addresses type invalid'
    }),
    'Advanced Voicemail Emails': z.string().optional(),
    'Advanced Inbound Fax Emails': z.string().optional(),
    'Advanced Outbound Fax Emails': z.string().optional(),
    'Advanced Inbound Texts Emails': z.string().optional(),
    'Advanced Missed Calls Emails': z.string().optional()
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

export const siteSchema = z.object({
    'ID': z.coerce.string({
        required_error: 'Missing ID',
        invalid_type_error: 'ID data type invalid'
    }),
    'Name': z.coerce.string({
        required_error: 'Missing name',
        invalid_type_error: 'Name data type invalid'
    }),
    'Ext': z.coerce.string({
        required_error: 'Missing extension number',
        invalid_type_error: 'Extension number data type invalid'
    })
})

export const extensionSchema = z.object({
    'Site Name': z.coerce.string({
        required_error: 'Missing site name',
        invalid_type_error: 'Site name data type invalid'
    }),
    'First Name': z.coerce.string({
        required_error: 'Missing first name',
        invalid_type_error: 'First name data type invalid'
    }),
    'Last Name': z.coerce.string({
        required_error: 'Missing last name',
        invalid_type_error: 'Last name data type invalid'
    }).optional(),
    'Email': z.string({
        required_error: 'Missing email',
        invalid_type_error: 'Email data type invalid'
    }),
    'Extension': z.coerce.string({
        required_error: 'Missing extension number',
        invalid_type_error: 'Extension number data type invalid'
    }),
    'User Type': z.string({
        required_error: 'Missing user type',
        invalid_type_error: 'User type data type invalid'
    }),
    'Department': z.coerce.string().optional(),
    'Dept': z.string().optional(),
    'Pin': z.coerce.string().optional(),
    'Password': z.string().optional(),
    'Role': z.string().optional()
})

export const callMonitoringSchema = z.object({
    'Group Name': z.coerce.string({
        required_error: 'Missing group name',
        invalid_type_error: 'Group name data type invalid'
    }),
    'Can Monitor': z.coerce.string({
        required_error: 'Missing Users that can monitor',
        invalid_type_error: 'Users that can monitor data type invalid'
    }),
    'Can be Monitored': z.coerce.string({
        required_error: 'Missing Users that can be monitored',
        invalid_type_error: 'Users that can be monitored data type invalid'
    }),
})

export const pagingGroupSchema = z.object({
    'Group Name': z.coerce.string({
        required_error: 'Missing group name',
        invalid_type_error: 'Group name data type invalid'
    }),
    'Extension': z.coerce.string({
        required_error: 'Missing extension number',
        invalid_type_error: 'Extension number data type invalid'
    }),
    'Devices to Receive Page (up to 25 devices)': z.coerce.string({
        required_error: 'Missing devices to receive page',
        invalid_type_error: 'Devices to receive page data type invalid'
    }),
    'Users Allowed to Page This Group': z.coerce.string({
        required_error: 'Missing devices to receive page',
        invalid_type_error: 'Devices to receive page data type invalid'
    })
})

export const createSiteSchema = z.object({
    'Site Name': z.coerce.string({
        required_error: 'Missing name',
        invalid_type_error: 'Name data type invalid'
    }),
    'Address 1': z.string({
        required_error: 'Missing address 1',
        invalid_type_error: 'Address 1 data type invalid'
    }),
    'Address 2': z.coerce.string().optional(),
    'City': z.string({
        required_error: 'Missing city',
        invalid_type_error: 'City data type invalid'
    }),
    'State': z.string({
        required_error: 'Missing state',
        invalid_type_error: 'State data type invalid'
    }),
    'Postal Code': z.coerce.string({
        required_error: 'Missing zip',
        invalid_type_error: 'Zip data type invalid'
    }),
    'Country': z.string({
        required_error: 'Missing country',
        invalid_type_error: 'Country data type invalid'
    }),
    'Timezone': z.string({
        required_error: 'Missing time zone',
        invalid_type_error: 'Time zone data type invalid'
    }),
    'User Language': z.string({
        required_error: 'Missing user language',
        invalid_type_error: 'User language data type invalid'
    }),
    'Greeting Language': z.string({
        required_error: 'Missing greetings language',
        invalid_type_error: 'Greetings language data type invalid'
    }),
    'Regional Format': z.string({
        required_error: 'Missing regional format',
        invalid_type_error: 'Regional format data type invalid'
    }),
    'Time Format': z.string({
        required_error: 'Missing time format',
        invalid_type_error: 'Time format data type invalid'
    }),
    'Outbound Cnam': z.string({
        required_error: 'Missing outbound cnam',
        invalid_type_error: 'Outbound cnam data type invalid'
    }),
    'Main Extension Number': z.coerce.string().optional(),
    'Site Code': z.coerce.string().optional()
})

export const PhoneNumberPayloadSchema = z.object({
    'Phone Number': z.coerce.string({
        required_error: 'Missing phone number',
        invalid_type_error: 'Phone number data type invalid. Expected text, found number'
    }),
    'Extension': z.coerce.string({
        required_error: 'Missing extension number',
        invalid_type_error: 'Extension number data type invalid. Expected text, found number'
    })
})

export const LocationUpdateSchema = z.object({
    'Site': z.coerce.string({
        required_error: 'Missing site name',
        invalid_type_error: 'Site name data type invalid'
    }),
    'Nickname': z.coerce.string({
        required_error: 'Missing nickname',
        invalid_type_error: 'Nickname data type invalid. Expected text, found number'
    }),
    'Type': z.string({
        required_error: 'Missing type',
        invalid_type_error: 'Type data type invalid. Expected text, found number'
    }),
    'Chassis ID / BSSID': z.string({
        required_error: 'Missing chassis id',
        invalid_type_error: 'Chassis id data type invalid. Expected text, found number'
    }),
    'ERL': z.string({
        required_error: 'Missing ERL',
        invalid_type_error: 'ERL data type invalid. Expected text, found number'
    }),
    'Street': z.string().optional(),
    'Street 2': z.string().optional(),
    'City': z.string().optional(),
    'State': z.string().optional(),
    'Postal Code': z.coerce.string().optional(),
})