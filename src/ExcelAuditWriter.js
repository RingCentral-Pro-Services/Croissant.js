const xlsx = require('xlsx')

class ExcelAuditWriter {

    auditData = []

    constructor(menus) {
        this.menus = menus
        this.writeHeader()
        this.writeMenuData()
    }

    /**
     * Write the header to the audit data array
     */
    writeHeader() {
        let header = ["Menu Name", "Menu Ext", "Prompt Name/Script"]

        for (let index = 1; index < 10; index++) {
            header.push(`Key ${index} Action`)
            header.push(`Key ${index} Destination`)
        }

        header.push(`Key 0 Action`)
        header.push(`Key 0 Destination`)
        header.push("Key # Press")
        header.push("Key * Press")

        this.auditData.push(header)
    }

    /**
     * Add all menu data to the audit data array
     */
    writeMenuData() {
        console.log(`Writing menu data to ${this.menus.length} menus`)
        for (let index = 0; index < this.menus.length; index++) {
            let menuData = [this.menus[index].name, this.menus[index].extensionNumber, this.menus[index].prompt]

            // Add keys 1 - 9
            for (let key = 1; key < 10; key++) {
                let found = false
                for (let actionIndex = 0; actionIndex < this.menus[index].actions.length; actionIndex++) {
                    if (this.menus[index].actions[actionIndex].key == key) {
                        menuData.push(this.menus[index].actions[actionIndex].actionType)
                        menuData.push(this.menus[index].actions[actionIndex].destination)
                        found = true
                    }
                }
                if (!found) {
                    menuData.push("")
                    menuData.push("")
                }
            }

            // Add key 0
            let zeroKeyFound = false
            for (let actionIndex = 0; actionIndex < this.menus[index].actions.length; actionIndex++) {
                if (this.menus[index].actions[actionIndex].key == 0) {
                    menuData.push(this.menus[index].actions[actionIndex].actionType)
                    menuData.push(this.menus[index].actions[actionIndex].destination)
                    zeroKeyFound = true
                }
            }
            if (!zeroKeyFound) {
                menuData.push("")
                menuData.push("")
            }

            // Add # key
            let poundKeyFound = false
            for (let actionIndex = 0; actionIndex < this.menus[index].actions.length; actionIndex++) {
                if (this.menus[index].actions[actionIndex].key == "#") {
                    menuData.push(this.menus[index].actions[actionIndex].actionType)
                    poundKeyFound = true
                }
            }
            if (!poundKeyFound) {
                menuData.push("")
            }

            let starKeyFound = false
            for (let actionIndex = 0; actionIndex < this.menus[index].actions.length; actionIndex++) {
                if (this.menus[index].actions[actionIndex].key == "*") {
                    menuData.push(this.menus[index].actions[actionIndex].actionType)
                    starKeyFound = true
                }
            }
            if (!starKeyFound) {
                menuData.push("")
            }

            this.auditData.push(menuData)
        }
    }

    /**
     * Get the XLSX data 
     * @returns An XLSX file
     */
    data() {
        var workbook = xlsx.utils.book_new();

        var worksheet = xlsx.utils.aoa_to_sheet(this.auditData);
        worksheet["!cols"] = [ { wch: 15 }, { wch: 10}, { wch: 30}, {wch: 20}, {wch: 20}, {wch: 20}, 
            {wch: 20}, {wch: 20}, {wch: 20} , {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, 
            {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20},
            {wch: 20},{wch: 20} ]

        xlsx.utils.book_append_sheet(workbook, worksheet, "IVRs", true);

        return xlsx.write(workbook, { type:"binary", bookType: "xlsx" });
    }
}

module.exports = ExcelAuditWriter