import { z } from "zod";
import { Message } from "./Message";
import { SyncError } from "./SyncError";

export interface Transformer<T> {
    transform(data: unknown[]): T[];
    messageQueue?: MessageQueue
}

export interface Validator {
    validate(data: any[], schema?: z.Schema, ): any[];
    messageQueue?: MessageQueue
}

export interface MessageQueue {
    postMessage: (message: Message) => void;
    postError: (error: SyncError) => void;
    postTimedMessage: (message: Message, timeout: number) => void;
}

export interface DataProvider {
    getData(): Promise<any[]>;
    messageQueue?: MessageQueue
}

export interface Pipeline<T> {
    provider: DataProvider;
    transformer: Transformer<T>;
    validator: Validator;
    messageQueue?: MessageQueue
    run(data: unknown[]): Promise<T[]>;
}