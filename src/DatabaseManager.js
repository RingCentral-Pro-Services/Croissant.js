const { Client } = require('pg');

class DatabaseManager {

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
              console.log(res.rows[0])
              client.end()
            }
          });
    }

    addRow

}

module.exports = DatabaseManager