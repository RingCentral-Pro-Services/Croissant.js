import { DataGridFormattable } from "../../../../models/DataGridFormattable"

export interface NotificationData {
    notificationKey: string
    body: string
    id: number
}

export class Notification implements DataGridFormattable {
    constructor(public data: NotificationData) { }

    getToolName(notificationKey: string): string {
        const parts = notificationKey.split('-')

        for (let i = 0; i < parts.length; i++) {
            const firstLetter = parts[i].charAt(0)

            const firstLetterCap = firstLetter.toUpperCase()

            const remainingLetters = parts[i].slice(1)

            const capitalizedWord = firstLetterCap + remainingLetters

            parts[i] = capitalizedWord
        }

        return parts.join(' ')
    }

    toDataGridRow(): any {
        return {
            id: this.data.id,
            notificationKey: this.getToolName(this.data.notificationKey),
            body: this.data.body
        }
    }

    toDataGidHeader(): any {
        return [
            { field: 'notificationKey', headerName: 'Notification Key', width: 200 },
            { field: 'body', headerName: 'Body', width: 500 },
        ]
    }

    property(key: string): any {
        return this.data[key as keyof NotificationData]
    }
}