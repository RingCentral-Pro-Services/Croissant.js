import ExtensionIsolator from "../../../../helpers/ExtensionIsolator"
import { Extension } from "../../../../models/Extension"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { CustomField } from "../models/CustomField"
import { CustomFieldAssignment, CustomFieldAssignmentData } from "../models/CustomFieldAssignment"

export const useReadCustomFields = (postMessage: (message: Message) => void, postError: (error: SyncError) => void) => {

    const readCustomFields = (excelData: any[], customFields: CustomField[], extensions: Extension[]) => {
        const assignments: CustomFieldAssignment[] = []

        for (const item of excelData) {
            const isolator = new ExtensionIsolator()
            const isolatedExtension = isolator.isolateExtension(item['Extension Number'])

            if (!isolatedExtension) {
                postMessage(new Message(`Extension ${item['Extension Number']} was not found in the account`, 'warning'))
                postError(new SyncError('', item['Extension Number'], ['Extension not found', '']))
                continue
            }

            const targetExtension = extensions.find(extension => extension.data.extensionNumber == isolatedExtension)
            if (!targetExtension) {
                postMessage(new Message(`Extension ${item['Extension Number']} was not found in the account`, 'warning'))
                postError(new SyncError('', item['Extension Number'], ['Extension not found', '']))
                continue
            }

            const customField = customFields.find(customField => customField.data.displayName == item['Custom Field Name'])
            if (!customField) {
                postMessage(new Message(`Custom field ${item['Custom Field Name']} was not found in the account`, 'warning'))
                postError(new SyncError('', '', ['Custom field not found', item['Custom Field Name']]))
                continue
            }

            const assignment: CustomFieldAssignmentData = {
                customFieldId: customField.data.id,
                extensionId: `${targetExtension.data.id}`,
                value: item['Value'],
                name: item['Custom Field Name'],
                extensionName: `${targetExtension.data.name} - Ext. ${targetExtension.data.extensionNumber}`
            }

            assignments.push(new CustomFieldAssignment(assignment))
        }

        return assignments
    }

    return { readCustomFields }

}