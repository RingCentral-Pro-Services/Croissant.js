const { Client } = require('pg');

class DatabaseManager {

    xml_created = 0
    csv_created = 0
    menus_created = 0
    keypresses_created = 0

    constructor() {

    }

    logXML(menuCount, keyPressCount) {
        this.getCurrentCounts()
    }

    getCurrentCounts() {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false
            }
          });
          
          client.connect();
          
          client.query('SELECT xml_created, csv_created, menus_created, keypresses_created FROM metrics', (err, res) => {
            if (err) {
              console.log('Failed')
              console.log(err)
            }
            else {
                this.xml_created = res.rows[0]["xml_created"]
                this.csv_created = res.rows[0]["csv_created"]
                this.menus_created = res.rows[0]["menus_created"]
                this.keypresses_created = res.rows[0]["keypresses_created"]

                console.log(`XML Created: ${this.xml_created}`)
                console.log(`CSV Created: ${this.csv_created}`)
                console.log(`Menus Created: ${this.menus_created}`)
                console.log(`Keypresses Created: ${this.keypresses_created}`)

                client.end()
            }
          });
    }

}

module.exports = DatabaseManager