import ExcelFormattable from "../../../../../models/ExcelFormattable"

export class CustomRoleExport implements ExcelFormattable {
    constructor(public role: Role) {}

    toExcelRow(): string[] {
        return [
            this.role.displayName,
            this.role.description ?? '',
            this.role.permissions.find((permission) => permission.id === 'General') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'DomesticCalls') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'InternalCalls') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'InternationalCalling') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'Voicemail') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'CallHandling') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'MessagesAndNotifications') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'OutboundCallerId') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'OutboundFaxSettings') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'PhonesAndNumbers') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'ScreeningGreetingHoldMusic') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'UserInfo') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'AccountAdministration') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'Appearance') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'CompanyInfo') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'Sites') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'SiteCallLog') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'AutoReceptionist') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'CompanyNumbers') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'DirectoryAssistance') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'Groups') ? 'Yes' : 'No',
            'UNKNOWN',
            this.role.permissions.find((permission) => permission.id === 'PhonesAndDevices') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'Roles') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'Templates') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'UserGroups') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'Users') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'UsageReports') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'CompanyNumbersReports') ? 'Yes' : 'No',
            'UNKNOWN',
            this.role.permissions.find((permission) => permission.id === 'MeetingsAnalytics') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'Reports') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'QoSReportsAlerts') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'QoSReports') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'BillingInfo') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'CostCenterManagement') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'DeviceOrdering') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'EditInternationalCallingPolicy') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'LicensesAndInventory') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'LiveReportsLicense') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'MeetingsPlan') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'PaymentMethod') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'Purchase') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'UsageInfo') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'AuditTrail') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'BusinessSms') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'ConfigureDelegates') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'ConfigureIntercom') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'ConfigurePresence') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'DevPortalAccess') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'HUD') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'InternalSMS') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'OrganizeConference') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'UnifiedAppDesktop') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'UnifiedAppMobile') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'RingCentralDesktopApp') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'RingCentralMobileApp') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'ThirdPartyAppAccess') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'BotInstall') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'BotUninstall') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'ReadCompanyCallRecordings') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'Meetings') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'MeetingsSettings') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'MeetingsConfiguration') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'MeetingsCompanyRecordings') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'RoomConnectorSettings') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'RoomsSettings') ? 'Yes' : 'No',
            'UNKNOWN',
            this.role.permissions.find((permission) => permission.id === 'WebinarSettings') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'ReadCompanyCallRecordings') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'EditCompanyCallLog') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'EditCompanyCallLogDelivery') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'ReadCompanyCallLog') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'ReadCallRecordings') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'EditCallLog') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'EditCallLogDelivery') ? 'Yes' : 'No',
            this.role.permissions.find((permission) => permission.id === 'ReadCallLog') ? 'Yes' : 'No',
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