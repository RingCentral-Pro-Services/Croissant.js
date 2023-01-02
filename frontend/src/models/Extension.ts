import { DataGridFormattable } from "./DataGridFormattable";
import ExcelFormattable from "./ExcelFormattable";
import { ExtensionData } from "./ExtensionData";

export class Extension implements ExcelFormattable, DataGridFormattable {
    constructor(public data: ExtensionData) {}

    prettyType() {
        switch (this.data.type) {
            case 'User':
                return 'User';
            case 'Department':
                return 'Call Queue';
            case 'ParkLocation':
                return 'Park Location';
            case 'IvrMenu':
                return 'IVR Menu';
            case 'Site':
                return 'Site';
            case 'DigitalUser':
                return 'Digital User';
            case 'FaxUser':
                return 'Fax User';
            case 'FlexibleUser':
                return 'Flexible User';
            case 'VirtualUser':
                return 'Virtual User';
            case 'Announcement':
                return 'Announcement-Only';
            case 'Voicemail':
                return 'Message-Only';
            case 'SharedLinesGroup':
                return 'Shared Line Group';
            case 'PagingOnly':
                return 'Paging Group';
            case 'ApplicationExtension':
                return 'Application Extension';
            case 'Limited':
                return 'Limited Extension';
            case 'Bot':
                return 'Bot';
            case 'ProxyAdmin':
                return 'Proxy Admin';
            case 'DelegatedLinesGroup':
                return 'Delegated Lines Group';
            case 'GroupCallPickup':
                return 'Group Call Pickup';
            case 'Room':
                return 'Room';
            default:
                return this.data.type;
        }
    }

    toExcelRow(): string[] {
        return [`${this.data.id}`, this.data.status === 'Unassigned' ? 'Unassigned Extension' : this.data.name, this.data.extensionNumber, this.data.contact ? this.data.contact.email : '', this.data.site?.name ?? 'N/A', this.prettyType(), this.data.status ?? '', `${this.data.hidden}`]
    }

    toDataGridRow(): any {
        return {
            id: this.data.id,
            name: this.data.status === 'Unassigned' ? 'Unassigned Extension' : this.data.name,
            extensionNumber: this.data.extensionNumber,
            email: this.data.contact ? this.data.contact.email : '',
            site: this.data.site?.name ?? 'N/A',
            type: this.prettyType(),
            status: this.data.status ?? '',
            hidden: this.data.hidden
        }
    }

    toDataGidHeader(): any {
        return [
            { field: 'id', headerName: 'ID', width: 100 },
            { field: 'name', headerName: 'Name', width: 300 },
            { field: 'extensionNumber', headerName: 'Extension Number', width: 150 },
            { field: 'email', headerName: 'Email', width: 400 },
            { field: 'site', headerName: 'Site', width: 200,},
            { field: 'type', headerName: 'Type', width: 200 },
            { field: 'status', headerName: 'Status', width: 200 },
            { field: 'hidden', headerName: 'Hidden', width: 200 }
        ]
    }

    property(key: string): any {
        if (key === 'site') {
            return this.data.site?.name ?? 'N/A'
        }
        return this[key as keyof Extension]
    }

    payload(isMultiSiteEnable: boolean): any {
        return {
            contact: {
                ...((this.data.type === 'User' || this.data.type == 'VirtualUser') && {firstName: this.data.contact?.firstName}),
                ... ((this.data.type !== 'User' && this.data.type !== 'VirtualUser') && {firstName: `${this.data.contact.firstName}${this.data.contact.lastName ? ` ${this.data.contact.lastName }`: ''}`}),
                ...((this.data.type === 'User' || this.data.type == 'VirtualUser') && {lastName: this.data.contact?.lastName}),
                email: this.data.contact?.email,
                ...(((this.data.type === 'User' || this.data.type == 'VirtualUser') && (this.data.contact.department && this.data.contact?.department !== '')) && {department: this.data.contact?.department ?? ''})
            },
            extensionNumber: this.data.extensionNumber,
            type: this.data.type === 'VirtualUser' ? 'User' : this.data.type,
            status: (this.data.ivrPin && this.data.ivrPin != '') || (this.data.password && this.data.password !== '') ? 'Enabled' : this.data.status,
            ...(this.data.type === 'VirtualUser' && {subType: 'VideoPro'}),
            ...(isMultiSiteEnable && { site: { id: this.data.site?.id } }),
            ...((this.data.ivrPin && this.data.ivrPin != '') && {ivrPin: this.data.ivrPin}),
            ...((this.data.password && this.data.password != '') && {password: this.data.password}),
        }
    }
}