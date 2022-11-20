export interface Greetings {

}

export interface Greeting {
    type: string
    preset: GreetingPreset
}

export interface GreetingPreset {
    uri?: string
    id?: string
    name: string
}

export namespace Presets {
    export const stayOnTheLine: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/132864',
        id: '132864',
        name: 'Thank you, Stay on the line'
    }
    export const greetingDisabled: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131837',
        id: '131837',
        name: 'None'
    }
    export const greetingEnabled: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131584',
        id: '131584',
        name: 'Default'
    }
    export const defaultVoicemail: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131329',
        id: '131329',
        name: 'Default'
    }
    export const ringtones: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131843',
        id: '131843',
        name: 'Ring Tones'
    }
    export const acousticMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131846',
        id: '131846',
        name: 'Acoustic'
    }
    export const beautifulMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131847',
        id: '131847',
        name: 'Beautiful'
    }
    export const classicalMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131848',
        id: '131848',
        name: 'Classical'
    }
    export const corporateMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131849',
        id: '131849',
        name: 'Corporate'
    }
    export const countryMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131850',
        id: '131850',
        name: 'Country'
    }
    export const holidayMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131851',
        id: '131851',
        name: 'Holiday'
    }
    export const latinMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131852',
        id: '131852',
        name: 'Latin'
    }
    export const modernJazzMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131853',
        id: '131853',
        name: 'Modern Jazz'
    }
    export const natureMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131854',
        id: '131854',
        name: 'Nature'
    }
    export const reggaeMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131855',
        id: '131855',
        name: 'Reggae'
    }
    export const worldMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131856',
        id: '131856',
        name: 'World'
    }
    export const musicDisabled: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131840',
        id: '131840',
        name: 'None'
    }
    export const custom: GreetingPreset = {
        uri: '',
        id: '',
        name: 'Custom'
    }

    export const presetForSelection = (selection: string) => {
        switch (selection) {
            case 'Ring Tones':
                return ringtones
            case 'Music (Acoustic)':
                return acousticMusic
            case 'Music (Beautiful)':
                return beautifulMusic
            case 'Music (Classical)':
                return classicalMusic
            case 'Music (Corporate)':
                return corporateMusic
            case 'Music (Country)':
                return countryMusic
            case 'Music (Holiday)':
                return holidayMusic
            case 'Music (Latin America)':
                return latinMusic
            case 'Music (Modern Jazz)':
                return modernJazzMusic
            case 'Music (Nature)':
                return natureMusic
            case 'Music (Reggae)':
                return reggaeMusic
            case 'Music (World)':
                return worldMusic
            case 'Music (Custom)':
                return custom
            case 'Custom':
                return custom
            case 'None':
                return musicDisabled
            default:
                return acousticMusic
        }
    }
}

// I don't know why, but hold music has its own presets that must be used instead of the
// presets above
export namespace HoldPresets {
    export const defaultVoicemail: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/131329',
        id: '131329',
        name: 'Default'
    }
    export const ringtones: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/197379',
        id: '197379',
        name: 'Ring Tones'
    }
    export const acousticMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/197382',
        id: '197382',
        name: 'Acoustic'
    }
    export const beautifulMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/197383',
        id: '197383',
        name: 'Beautiful'
    }
    export const classicalMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/197384',
        id: '197384',
        name: 'Classical'
    }
    export const corporateMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/197385',
        id: '197385',
        name: 'Corporate'
    }
    export const countryMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/197386',
        id: '197386',
        name: 'Country'
    }
    export const holidayMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/197387',
        id: '197387',
        name: 'Holiday'
    }
    export const latinMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/197388',
        id: '197388',
        name: 'Latin'
    }
    export const modernJazzMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/197389',
        id: '197389',
        name: 'Modern Jazz'
    }
    export const natureMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/197390',
        id: '197390',
        name: 'Nature'
    }
    export const reggaeMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/197391',
        id: '197391',
        name: 'Reggae'
    }
    export const worldMusic: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/197392',
        id: '197392',
        name: 'World'
    }
    export const musicDisabled: GreetingPreset = {
        uri: 'https://platform.ringcentral.com/restapi/v1.0/dictionary/greeting/197376',
        id: '197376',
        name: 'None'
    }
    export const custom: GreetingPreset = {
        uri: '',
        id: '',
        name: 'Custom'
    }

    export const presetForSelection = (selection: string) => {
        switch (selection) {
            case 'Ring Tones':
                return ringtones
            case 'Music (Acoustic)':
                return acousticMusic
            case 'Music (Beautiful)':
                return beautifulMusic
            case 'Music (Classical)':
                return classicalMusic
            case 'Music (Corporate)':
                return corporateMusic
            case 'Music (Country)':
                return countryMusic
            case 'Music (Holiday)':
                return holidayMusic
            case 'Music (Latin America)':
                return latinMusic
            case 'Music (Modern Jazz)':
                return modernJazzMusic
            case 'Music (Nature)':
                return natureMusic
            case 'Music (Reggae)':
                return reggaeMusic
            case 'Music (World)':
                return worldMusic
            case 'Music (Custom)':
                return custom
            case 'Custom':
                return custom
            case 'None':
                return musicDisabled
            default:
                return acousticMusic
        }
    }
}

let f = Presets.acousticMusic