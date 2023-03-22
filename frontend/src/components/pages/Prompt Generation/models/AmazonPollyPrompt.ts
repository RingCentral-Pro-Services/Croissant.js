import { DataGridFormattable } from "../../../../models/DataGridFormattable";

export class AmazonPollyPrompt implements DataGridFormattable {
    constructor(public name: string, public text: string, public data?: Blob, public id?: string) {
        this.id = this.randomId()
    }

    toDataGidHeader() {
        return [
            { field: "name", headerName: "Name", width: 200 },
            { field: "text", headerName: "Text", width: 800 },
        ]
    }

    toDataGridRow(): any {
        return {
            id: `${this.id}`,
            name: this.name,
            text: this.text,
        }
    }

    property(key: string) {
        return this[key as keyof AmazonPollyPrompt]
    }

    randomId() {
        return `${Math.floor(Math.random() * 100000)}`
    }

}