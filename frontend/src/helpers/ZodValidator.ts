import { MessageQueue, Validator } from "../models/Transformer";
import z from 'zod'
import { SyncError } from "../models/SyncError";
import { Message } from "../models/Message";

export class ZodValidator implements Validator {
    constructor(private schema: z.Schema, public messageQueue?: MessageQueue) {}

    validate(data: any[]): any[] {
        let validItems: any[] = []

        for (let index = 0; index < data.length; index++) {
            try {
                const valid = this.schema.parse(data[index])
                validItems.push(valid)
            }
            catch(error: any) {
                for (let errorIndex = 0; errorIndex < error.issues.length; errorIndex++) {
                    this.messageQueue?.postMessage(new Message(`Validation: Row ${data[index]['__rowNum__'] + 1} - ${error.issues[errorIndex].message}`, 'error'))
                    this.messageQueue?.postError(new SyncError(`Excel Row ${data[index]['__rowNum__'] + 1}`, 0, ['Failed validation', error.issues[errorIndex].message]))
                }
            }
        }

        return validItems
    }
}