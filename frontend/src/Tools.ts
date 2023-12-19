export interface Tool {
    name: string
    route: string
}

export const Tools: Tool[] = [
    {
        name: 'Create IVRs',
        route: '/create-ivrs'
    },
    {
        name: 'Audit IVRs',
        route: '/auditmenus'
    },
    {
        name: 'Create Call Queues',
        route: '/createcallqueues'
    },
    {
        name: 'Audit Call Queues',
        route: '/auditcallqueues'
    },
    {
        name: 'Call Queue Templates',
        route: '/callqueuetemplates'
    },
    {
        name: 'Export Custom Rules',
        route: '/exportrules'
    },
    {
        name: 'Build Custom Rules',
        route: '/customrules'
    },
    {
        name: 'Copy Custom Rules',
        route: '/copycustomrules'
    },
    {
        name: 'Delete Custom Rules',
        route: '/customruleedit'
    },
    {
        name: 'Create Sites',
        route: '/sites'
    },
    {
        name: 'Edit Sites',
        route: '/editsites'
    },
    {
        name: 'Bulk Number Assign',
        route: '/bulkassign'
    },
    {
        name: 'Auto Migrate',
        route: '/migrateusers'
    },
    {
        name: 'Auto Audit',
        route: '/autoaudit'
    },
    {
        name: 'Account Dump',
        route: '/accountdump'
    },
    {
        name: 'Upload Devices',
        route: '/uploaddevices'
    },
    {
        name: 'Account Templates',
        route: '/accounttemplates'
    },
    {
        name: 'Extension Upload',
        route: '/extensionupload'
    },
    {
        name: 'Delete Extensions',
        route: '/deleteextensions'
    },
    {
        name: 'Edit Extensions',
        route: '/extensionupload'
    },
    {
        name: 'Notifications',
        route: '/notificationsaudit'
    },
    {
        name: 'Custom Fields',
        route: '/customfields'
    },
    {
        name: 'Desk Phones',
        route: '/deskphones'
    },
    {
        name: 'Intercom',
        route: '/intercom'
    },
    {
        name: 'Presence',
        route: '/presence'
    },
    {
        name: 'Automatic Location Updates',
        route: '/locationupdates'
    },
    {
        name: 'Convert Call Queues',
        route: '/convert-call-queues'
    },
    {
        name: 'Push to Talk',
        route: '/pushtotalk'
    },
    {
        name: 'User Groups',
        route: '/usergroups'
    },
    {
        name: 'Call Monitoring',
        route: '/callmonitoring'
    },
    {
        name: 'Paging Groups',
        route: '/paginggroups'
    },
    {
        name: 'Park Locations',
        route: '/parklocations'
    }
]