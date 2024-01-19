import z from 'zod'

export const ivrSchema = z.object({
    'Menu Name': z.coerce.string({
        required_error: 'Missing Menu Name',
        invalid_type_error: 'Menu Name data type invalid'
    }).trim().min(1),
    'Site': z.coerce.string({
        required_error: 'Missing Site',
        invalid_type_error: 'Site data type invalid'
    }).trim(),
    'Menu Ext': z.coerce.number({
        required_error: 'Missing Menu Ext',
        invalid_type_error: 'Menu Ext data type invalid'
    }),
    'Prompt Name/Script': z.string({
        required_error: 'Missing Prompt Name/Script',
        invalid_type_error: 'Prompt Name/Script data type invalid',
    }).trim(),
    'Key 1 Action': z.string({
        invalid_type_error: 'Key 1 Action data type invalid',
    }).trim().optional(),
    'Key 1 Destination': z.coerce.string({
        invalid_type_error: 'Key 1 Destination data type invalid',
    }).trim().optional(),
    'Key 2 Action': z.string({
        invalid_type_error: 'Key 2 Action data type invalid',
    }).trim().optional(),
    'Key 2 Destination': z.coerce.string({
        invalid_type_error: 'Key 2 Destination data type invalid',
    }).trim().optional(),
    'Key 3 Action': z.string({
        invalid_type_error: 'Key 3 Action data type invalid',
    }).trim().optional(),
    'Key 3 Destination': z.coerce.string({
        invalid_type_error: 'Key 3 Destination data type invalid',
    }).trim().optional(),
    'Key 4 Action': z.string({
        invalid_type_error: 'Key 4 Action data type invalid',
    }).trim().optional(),
    'Key 4 Destination': z.coerce.string({
        invalid_type_error: 'Key 4 Destination data type invalid',
    }).trim().optional(),
    'Key 5 Action': z.string({
        invalid_type_error: 'Key 5 Action data type invalid',
    }).trim().optional(),
    'Key 5 Destination': z.coerce.string({
        invalid_type_error: 'Key 5 Destination data type invalid',
    }).trim().optional(),
    'Key 6 Action': z.string({
        invalid_type_error: 'Key 6 Action data type invalid',
    }).trim().optional(),
    'Key 6 Destination': z.coerce.string({
        invalid_type_error: 'Key 6 Destination data type invalid',
    }).trim().optional(),
    'Key 7 Action': z.string({
        invalid_type_error: 'Key 7 Action data type invalid',
    }).trim().optional(),
    'Key 7 Destination': z.coerce.string({
        invalid_type_error: 'Key 7 Destination data type invalid',
    }).trim().optional(),
    'Key 8 Action': z.string({
        invalid_type_error: 'Key 8 Action data type invalid',
    }).trim().optional(),
    'Key 8 Destination': z.coerce.string({
        invalid_type_error: 'Key 8 Destination data type invalid',
    }).trim().optional(),
    'Key 9 Action': z.string({
        invalid_type_error: 'Key 9 Action data type invalid',
    }).trim().optional(),
    'Key 9 Destination': z.coerce.string({
        invalid_type_error: 'Key 9 Destination data type invalid',
    }).trim().optional(),
    'Key 0 Action': z.string({
        invalid_type_error: 'Key 0 Action data type invalid',
    }).trim().optional(),
    'Key 0 Destination': z.coerce.string({
        invalid_type_error: 'Key 0 Destination data type invalid',
    }).trim().optional(),
})

export const callQueueSchema = z.object({
    'Queue Name': z.string({
        required_error: 'Missing queue name',
        invalid_type_error: 'Queue name data type invalid'
    }).trim(),
    'Extension': z.coerce.string({
        required_error: 'Missing extension number',
        invalid_type_error: 'Extension number data type invalid'
    }).trim(),
    'Queue Email': z.string().trim().optional(),
    'Email': z.string().trim().optional(),
    'Site': z.coerce.string({
        required_error: 'Missing site',
        invalid_type_error: 'Site data type invalid'
    }).trim(),
    'Members (Ext)': z.coerce.string({
        required_error: 'Missing members',
        invalid_type_error: 'Members data type invalid'
    }).trim().default(''),
    'Queue Manager': z.coerce.string().trim().optional(),
    'Greeting': z.string().trim().optional(),
    'Audio While Connecting': z.string().trim().optional(),
    'Hold Music': z.string().trim().optional(),
    'Interrupt Audio': z.string().trim().optional(),
    'Interrupt Prompt': z.string().trim().optional(),
    'Member Queue Status': z.string().trim().optional(),
    'Callers In Queue': z.string().trim().optional(),
    'Max Wait Time Action': z.coerce.string().trim().optional(),
    'Max Wait Time Destination': z.coerce.string().trim().optional(),
    'Max Callers Action': z.coerce.string().trim().optional(),
    'Max Callers Destination': z.coerce.string().trim().optional(),
    'When Queue is Full': z.string().trim().optional(),
    'Queue Full Destination': z.coerce.string().trim().optional(),
    'When Max Time is Reached': z.string().trim().optional(),
    'Time Reached Destination': z.coerce.string().trim().optional(),
    'Voicemail Recipients': z.coerce.string().trim().optional(),
    'Voicemail Notifications': z.string().trim().optional(),
    'Voicemail Notifications Email': z.string().trim().optional(),
    'After Hours Behavior': z.string().trim().optional(),
    'After Hours Destination': z.coerce.string().trim().optional(),
    'Ring Type': z.string().trim().optional(),
    'User Ring Time': z.string().trim().optional(),
    'Total Ring Time': z.string().trim().optional(),
    'Wrap Up Time': z.string().trim().optional(),
    'Voicemail Greeting': z.string().trim().optional(),
    'Queue PIN': z.coerce.string().trim().optional()
})

export const notificationSchema = z.object({
    'Mailbox ID': z.coerce.string({
        required_error: 'Missing Mailbox ID',
        invalid_type_error: 'Mailbox ID type invalid'
    }).trim(),
    'Email Addresses': z.string({
        required_error: 'Missing email addresses',
        invalid_type_error: 'Email addresses type invalid'
    }).trim(),
    'Advanced Voicemail Emails': z.string().trim().optional(),
    'Advanced Inbound Fax Emails': z.string().trim().optional(),
    'Advanced Outbound Fax Emails': z.string().trim().optional(),
    'Advanced Inbound Texts Emails': z.string().trim().optional(),
    'Advanced Missed Calls Emails': z.string().trim().optional()
})

export const promptSchema = z.object({
    'Prompt Name': z.string({
        required_error: 'Missing prompt name',
        invalid_type_error: 'Prompt name data type invalid'
    }).trim(),
    'Prompt Text': z.string({
        required_error: 'Missing prompt text',
        invalid_type_error: 'Prompt text data type invalid'
    }).trim()
})

export const siteSchema = z.object({
    'ID': z.coerce.string({
        required_error: 'Missing ID',
        invalid_type_error: 'ID data type invalid'
    }).trim(),
    'Name': z.coerce.string({
        required_error: 'Missing name',
        invalid_type_error: 'Name data type invalid'
    }).trim(),
    'Ext': z.coerce.string({
        required_error: 'Missing extension number',
        invalid_type_error: 'Extension number data type invalid'
    }).trim()
})

export const extensionSchema = z.object({
    'Site Name': z.coerce.string({
        required_error: 'Missing site name',
        invalid_type_error: 'Site name data type invalid'
    }).trim(),
    'First Name': z.coerce.string({
        required_error: 'Missing first name',
        invalid_type_error: 'First name data type invalid'
    }).trim(),
    'Last Name': z.coerce.string({
        required_error: 'Missing last name',
        invalid_type_error: 'Last name data type invalid'
    }).trim().optional(),
    'Email': z.string({
        required_error: 'Missing email',
        invalid_type_error: 'Email data type invalid'
    }).trim(),
    'Extension': z.coerce.string({
        required_error: 'Missing extension number',
        invalid_type_error: 'Extension number data type invalid'
    }).trim(),
    'User Type': z.string({
        required_error: 'Missing user type',
        invalid_type_error: 'User type data type invalid'
    }).trim(),
    'Department': z.coerce.string().trim().optional(),
    'Dept': z.string().trim().optional(),
    'Pin': z.coerce.string().trim().optional(),
    'Password': z.string().trim().optional(),
    'Role': z.string().trim().optional(),
    'Existing Device Type': z.string().trim().optional(),
    'MAC Address': z.string().trim().optional()
})

export const callMonitoringSchema = z.object({
    'Group Name': z.coerce.string({
        required_error: 'Missing group name',
        invalid_type_error: 'Group name data type invalid'
    }).trim(),
    'Can Monitor': z.coerce.string({
        required_error: 'Missing Users that can monitor',
        invalid_type_error: 'Users that can monitor data type invalid'
    }).trim(),
    'Can be Monitored': z.coerce.string({
        required_error: 'Missing Users that can be monitored',
        invalid_type_error: 'Users that can be monitored data type invalid'
    }).trim(),
})

export const pagingGroupSchema = z.object({
    'Group Name': z.coerce.string({
        required_error: 'Missing group name',
        invalid_type_error: 'Group name data type invalid'
    }).trim(),
    'Extension': z.coerce.string({
        required_error: 'Missing extension number',
        invalid_type_error: 'Extension number data type invalid'
    }).trim(),
    'Devices to Receive Page (up to 25 devices)': z.coerce.string({
        required_error: 'Missing devices to receive page',
        invalid_type_error: 'Devices to receive page data type invalid'
    }).trim(),
    'Users Allowed to Page This Group': z.coerce.string({
        required_error: 'Missing devices to receive page',
        invalid_type_error: 'Devices to receive page data type invalid'
    }).trim()
})

export const createSiteSchema = z.object({
    'Site Name': z.coerce.string({
        required_error: 'Missing name',
        invalid_type_error: 'Name data type invalid'
    }).trim(),
    'Address 1': z.string({
        required_error: 'Missing address 1',
        invalid_type_error: 'Address 1 data type invalid'
    }).trim(),
    'Address 2': z.coerce.string().trim().optional(),
    'City': z.string({
        required_error: 'Missing city',
        invalid_type_error: 'City data type invalid'
    }).trim().optional(),
    'Suburb': z.coerce.string().trim().optional(),
    'State': z.string({
        required_error: 'Missing state',
        invalid_type_error: 'State data type invalid'
    }).trim(),
    'Postal Code': z.coerce.string({
        required_error: 'Missing zip',
        invalid_type_error: 'Zip data type invalid'
    }).trim(),
    'Country': z.string({
        required_error: 'Missing country',
        invalid_type_error: 'Country data type invalid'
    }).trim(),
    'Timezone': z.string({
        required_error: 'Missing time zone',
        invalid_type_error: 'Time zone data type invalid'
    }).trim(),
    'User Language': z.string({
        required_error: 'Missing user language',
        invalid_type_error: 'User language data type invalid'
    }).trim(),
    'Greeting Language': z.string({
        required_error: 'Missing greetings language',
        invalid_type_error: 'Greetings language data type invalid'
    }).trim(),
    'Regional Format': z.string({
        required_error: 'Missing regional format',
        invalid_type_error: 'Regional format data type invalid'
    }).trim(),
    'Time Format': z.string({
        required_error: 'Missing time format',
        invalid_type_error: 'Time format data type invalid'
    }).trim(),
    'Outbound Cnam': z.string({
        required_error: 'Missing outbound cnam',
        invalid_type_error: 'Outbound cnam data type invalid'
    }).trim().optional(),
    'Main Extension Number': z.coerce.string().trim().optional(),
    'Site Code': z.coerce.string().trim().optional()
})

export const PhoneNumberPayloadSchema = z.object({
    'Phone Number': z.coerce.string({
        required_error: 'Missing phone number',
        invalid_type_error: 'Phone number data type invalid. Expected text, found number'
    }).trim(),
    'Extension': z.coerce.string({
        required_error: 'Missing extension number',
        invalid_type_error: 'Extension number data type invalid. Expected text, found number'
    }).trim()
})

export const LocationUpdateSchema = z.object({
    'Site': z.coerce.string({
        required_error: 'Missing site name',
        invalid_type_error: 'Site name data type invalid'
    }).trim(),
    'Nickname': z.coerce.string({
        required_error: 'Missing nickname',
        invalid_type_error: 'Nickname data type invalid. Expected text, found number'
    }).trim(),
    'Type': z.string({
        required_error: 'Missing type',
        invalid_type_error: 'Type data type invalid. Expected text, found number'
    }).trim(),
    'Chassis ID / BSSID': z.string({
        required_error: 'Missing chassis id',
        invalid_type_error: 'Chassis id data type invalid. Expected text, found number'
    }).trim(),
    'ERL': z.string({
        required_error: 'Missing ERL',
        invalid_type_error: 'ERL data type invalid. Expected text, found number'
    }).trim(),
    'Street': z.string().trim().optional(),
    'Street 2': z.string().trim().optional(),
    'City': z.string().trim().optional(),
    'State': z.string().trim().optional(),
    'Postal Code': z.coerce.string().optional(),
})

export const accountIDSchema = z.object({
    'UID': z.coerce.string({
        required_error: 'Missing UID',
        invalid_type_error: 'UID data type invalid'
    }).trim()
})

export const deviceUploadSchema = z.object({
    'Extension': z.coerce.string().optional(),
    'Device Type': z.string().trim(),
    'MAC Address': z.string().trim(),
    'Device Name': z.coerce.string().trim().optional()
})

export const customFieldSchema = z.object({
    'Custom Field Name': z.coerce.string({
        required_error: 'Missing custom field name',
        invalid_type_error: 'Missing custom field data type invalid'
    }).trim(),
    'Extension Number': z.coerce.string({
        required_error: 'Missing extension number',
        invalid_type_error: 'Extension number data type invalid'
    }).trim(),
    'Value': z.coerce.string({
        required_error: 'Missing value',
        invalid_type_error: 'Value data type invalid'
    }).trim()
})

export const credentialsSchema = z.object({
    'Extension Number': z.coerce.string({
        required_error: 'Missing extension number',
        invalid_type_error: 'Extension number data type invalid'
    }).trim(),
    'Password': z.coerce.string().trim().min(8, 'Password is too short').optional(),
    'PIN': z.coerce.string().trim().min(6, 'PIN is too short').optional(),
    'Security Question': z.coerce.string().trim().min(1, 'Securtity question is too short').optional(),
    'Security Question Answer': z.coerce.string().trim().min(5, 'Security question answer is too short').optional()
})