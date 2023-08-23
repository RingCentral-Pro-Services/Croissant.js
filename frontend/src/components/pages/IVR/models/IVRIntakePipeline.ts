import { IVRMenu } from "../../../../models/IVRMenu";
import { DataProvider, MessageQueue, Pipeline, Transformer, Validator } from "../../../../models/Transformer";

export class IVRIntakePipeline implements Pipeline<IVRMenu> {
    constructor(public provider: DataProvider, public transformer: Transformer<IVRMenu>, public validator: Validator, public messageQueue?: MessageQueue) {
        provider.messageQueue = messageQueue
        transformer.messageQueue = messageQueue
        validator.messageQueue = messageQueue
    }

    async run(): Promise<IVRMenu[]> {
        const data = await this.provider.getData()
        
        console.log('Data from provider')
        console.log(data)

        const validatedData = this.validator.validate(data)
        console.log('Validated data')
        console.log(validatedData)

        const transformedData = this.transformer.transform(validatedData)
        console.log('Transformed data')
        console.log(transformedData)

        return transformedData
    }
}