export class Message {
    constructor(public body: string, public type: MessageType) {}
}

export enum MessageType {
    INFO = 'message-info',
    ERROR = 'message-error',
    SUCCESS = 'message-success'
}
