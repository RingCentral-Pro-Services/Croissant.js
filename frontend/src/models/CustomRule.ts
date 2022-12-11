import { CallForwardingSettingsPayload } from './CallForwardingSettings';
import { Greeting } from './Greetings';
import { WeeklyRange } from './WeeklyRange';

export interface CustomRule {
    uri?: string;
    id?: string;
    type: string;
    name: string;
    enabled: boolean;
    schedule: WeeklyRange;
    greetings?: Greeting[]
    queue?: any
    callHandlingAction: string;
    forwarding?: CallForwardingSettingsPayload
    unconditionalForwarding: string
    transfer?: {
        id: string
        uri?: string
    }
    voicemail?: VoicemailDestination
    screening: string
}

export interface VoicemailDestination {
    enabled: boolean;
    recipient: {
        id: number;
        uri?: string;
    }
}