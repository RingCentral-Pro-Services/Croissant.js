import ExcelFormattable from "../../../../../models/ExcelFormattable"

export class CustomRoleExport implements ExcelFormattable {
    constructor(public role: Role) {}

    toExcelRow(): string[] {
        return [
            this.role.displayName,
            this.role.description ?? '',
            this.role.permissions.find((permission) => permission.id === 'General') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'DomesticCalls') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'InternalCalls') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'InternationalCalling') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'Voicemail') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'CallHandling') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'MessagesAndNotifications') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'OutboundCallerId') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'OutboundFaxSettings') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'PhonesAndNumbers') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'ScreeningGreetingHoldMusic') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'UserInfo') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'AccountAdministration') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'Appearance') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'CompanyInfo') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'Sites') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'SiteCallLog') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'AutoReceptionist') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'CompanyNumbers') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'DirectoryAssistance') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'Groups') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'PhonesAndDevices') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'Roles') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'Templates') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'UserGroups') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'Users') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'UsageReports') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'CompanyNumbersReports') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'MeetingsAnalytics') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'Reports') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'QoSReportsAlerts') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'QoSReports') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'BillingInfo') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'CostCenterManagement') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'DeviceOrdering') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'EditInternationalCallingPolicy') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'LicensesAndInventory') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'LiveReportsLicense') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'MeetingsPlan') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'PaymentMethod') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'Purchase') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'UsageInfo') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'AuditTrail') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'BusinessSms') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'ConfigureDelegates') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'ConfigureIntercom') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'ConfigurePresence') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'DevPortalAccess') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'HUD') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'InternalSMS') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'OrganizeConference') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'UnifiedAppDesktop') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'UnifiedAppMobile') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'RingCentralDesktopApp') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'RingCentralMobileApp') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'ThirdPartyAppAccess') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'BotInstall') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'BotUninstall') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'ReadCompanyCallRecordings') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'Meetings') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'MeetingsSettings') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'MeetingsConfiguration') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'MeetingsCompanyRecordings') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'RoomConnectorSettings') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'RoomsSettings') ? 'X' : '',
            '?', // Rooms app access
            this.role.permissions.find((permission) => permission.id === 'WebinarSettings') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'ReadCompanyCallRecordings') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'EditCompanyCallLog') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'EditCompanyCallLogDelivery') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'ReadCompanyCallLog') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'ReadCallRecordings') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'EditCallLog') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'EditCallLogDelivery') ? 'X' : '',
            this.role.permissions.find((permission) => permission.id === 'ReadCallLog') ? 'X' : '',
        ]
    }
}

export interface Role {
    uri?: string
    id?: string
    displayName: string
    description?: string
    custom: boolean
    scope: string
    hidden: boolean
    lastUpdated?: boolean
    siteCompatible: boolean
    permissions: RolePermission[]
}

export interface RolePermission {
    uri: string
    id: string 
    assignable?: boolean
    readOnly?: boolean
    siteCompatible?: boolean
}