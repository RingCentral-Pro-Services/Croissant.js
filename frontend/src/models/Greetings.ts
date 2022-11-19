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