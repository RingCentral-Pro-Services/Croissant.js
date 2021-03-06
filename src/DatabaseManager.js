const { Client } = require('pg');

/**
 * A class for interacting with the Postgresql database
 */
class DatabaseManager {

    xml_created = 0
    csv_created = 0
    menus_created = 0
    keypresses_created = 0
    menus_audited = 0
    keypresses_audited = 0

    constructor() {

    }

    /**
     * Logs an XLSX file in the database
     * @param {number} menuCount The number of menus to add to the counter
     * @param {*} keyPressCount The number of keypresses to add to the counter
     */
    logXML(menuCount, keyPressCount) {
        this.getCurrentCounts(menuCount, keyPressCount)
        console.log(`XML Created (Before): ${this.xml_created}`)
        console.log(`CSV Created (Before): ${this.csv_created}`)
        console.log(`Menus Created (Before): ${this.menus_created}`)
        console.log(`Keypresses Created (Before): ${this.keypresses_created}`)
    }

    /**
     * Logs a CSV in the database
     * @param {number} menuCount The number of menus to add to the counter
     * @param {number} keyPressCount The number of keypresses to add to the counter
     */
    logCSV(menuCount, keyPressCount) {
        this.updateAuditCounts(menuCount, keyPressCount)
    }

    /**
     * Get current counts from the database and update them with the new values
     * @param {number} menuCount The number of menus to add to the counter
     * @param {number} keyPressCount The number of keypresses to add to the counter
     */
    getCurrentCounts(menuCount, keyPressCount) {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false
            }
          });
          
          client.connect();
          
          client.query('SELECT xml_created, csv_created, menus_created, keypresses_created, menus_audited, keypresses_audited FROM metrics', (err, res) => {
            if (err) {
              console.log('Failed')
              console.log(err)
            }
            else {
                this.xml_created = parseInt(res.rows[0]["xml_created"])
                this.csv_created = parseInt(res.rows[0]["csv_created"])
                this.menus_created = parseInt(res.rows[0]["menus_created"])
                this.keypresses_created = parseInt(res.rows[0]["keypresses_created"])
                this.menus_audited = parseInt(res.rows[0]["menus_audited"])
                this.keypresses_audited = parseInt(res.rows[0]["keypresses_audited"])
                client.query('DELETE FROM metrics', (err, res) => {
                    if (err) {
                      console.log('Failed')
                      console.log(err)
                    }
                    else {
                        this.xml_created += 1
                        this.menus_created += parseInt(menuCount)
                        this.keypresses_created += parseInt(keyPressCount)
                        client.query(`INSERT INTO metrics VALUES(${this.xml_created}, ${this.csv_created}, ${this.menus_created}, ${this.keypresses_created}, ${this.menus_audited}, ${this.keypresses_audited})`, (err, res) => {
                            if (err) {
                              console.log('Failed')
                              console.log(err)
                            }
                            else {
                                console.log(`Updated metrics to ${this.xml_created}, ${this.csv_created}, ${this.menus_created}, ${this.keypresses_created}, ${this.menus_audited}, ${this.keypresses_audited}`)
                                client.end()
                            }
                          });
                    }
                  });
            }
          });
    }

    /**
     * Get current counts from the database and update them with the new values
     * @param {number} menuCount The number of menus to add to the counter
     * @param {number} keyPressCount The number of keypresses to add to the counter
     */
    updateAuditCounts(menuCount, keyPressCount) {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false
            }
          });
          
          client.connect();
          
          client.query('SELECT xml_created, csv_created, menus_created, keypresses_created, menus_audited, keypresses_audited FROM metrics', (err, res) => {
            if (err) {
              console.log('Failed')
              console.log(err)
            }
            else {
                this.xml_created = parseInt(res.rows[0]["xml_created"])
                this.csv_created = parseInt(res.rows[0]["csv_created"])
                this.menus_created = parseInt(res.rows[0]["menus_created"])
                this.keypresses_created = parseInt(res.rows[0]["keypresses_created"])
                this.menus_audited = parseInt(res.rows[0]["menus_audited"])
                this.keypresses_audited = parseInt(res.rows[0]["keypresses_audited"])
                client.query('DELETE FROM metrics', (err, res) => {
                    if (err) {
                      console.log('Failed')
                      console.log(err)
                    }
                    else {
                        this.csv_created += 1
                        this.menus_audited += parseInt(menuCount)
                        this.keypresses_audited += parseInt(keyPressCount)
                        client.query(`INSERT INTO metrics VALUES(${this.xml_created}, ${this.csv_created}, ${this.menus_created}, ${this.keypresses_created}, ${this.menus_audited}, ${this.keypresses_audited})`, (err, res) => {
                            if (err) {
                              console.log('Failed')
                              console.log(err)
                            }
                            else {
                                console.log(`Updated metrics to ${this.xml_created}, ${this.csv_created}, ${this.menus_created}, ${this.keypresses_created}, ${this.menus_audited}, ${this.keypresses_audited}`)
                                client.end()
                            }
                          });
                    }
                  });
            }
          });
    }

    /**
     * Add a row for the file in the menu data table
     * @param {string} filename The name of the file to log
     * @param {number} menuCount The number of menus in the file
     * @param {number} keyPressCount The number of keypresses in the file
     */
    logFile(filename, menuCount, keyPressCount) {
            const client = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                rejectUnauthorized: false
                }
            });
          
            client.connect();
          
            let ts = Date.now();

            let date_ob = new Date(ts);
            let date = date_ob.getDate();
            let month = date_ob.getMonth() + 1;
            let year = date_ob.getFullYear();

            let date_string = `${year}-${month}-${date}`

            client.query(`INSERT INTO menu_data VALUES('${filename}', ${menuCount}, ${keyPressCount}, '${date_string}')`, (err, res) => {
                if (err) {
                console.log('Failed')
                console.log(err)
                }
                else {
                    console.log(`Updated menu_data to ${filename}, ${menuCount}, ${keyPressCount}, ${Date.now()}`)
                    client.end()
                }
            });
    }

    /**
     * Deletes all row in the metrics table
     */
    deleteAllRows() {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false
            }
          });
          
          client.connect();
          
          client.query('DELETE FROM metrics', (err, res) => {
            if (err) {
              console.log('Failed')
              console.log(err)
            }
            else {
                client.end()
            }
          });
    }

    /**
     * Insert a new row into the metrics table
     */
    createRow() {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false
            }
          });
          
          client.connect();
          
          client.query(`INSERT INTO metrics VALUES(${this.xml_created}, ${this.csv_created}, ${this.menus_created}, ${this.keypresses_created}, ${this.menus_audited}, ${this.keypresses_audited})`, (err, res) => {
            if (err) {
              console.log('Failed')
              console.log(err)
            }
            else {
                console.log(`Updated metrics to ${this.xml_created}, ${this.csv_created}, ${this.menus_created}, ${this.keypresses_created}`)
                client.end()
            }
          });
    }

    /**
     * Create the the metrics table
     */
    createTable() {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false
            }
          });
          
          client.connect();
          
          client.query(`CREATE TABLE metrics (xml_created numeric NOT NULL, csv_created numeric NOT NULL, menus_created numeric NOT NULL, keypresses_created numeric NOT NULL, menus_audited numeric NOT NULL, keypresses_audited numeric NOT NULL)`, (err, res) => {
            if (err) {
              console.log('Failed to create table')
              console.log(err)
            }
            else {
                console.log("Created table")
                client.end()
            }
          });
    }

    /**
     * Insert the initial values into the metrics table
     */
    initializeRow() {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false
            }
          });
          
          client.connect();
          
          client.query(`INSERT INTO metrics VALUES(0, 0, 0, 0)`, (err, res) => {
            if (err) {
              console.log('Failed')
              console.log(err)
            }
            else {
                console.log("Initialized row")
                client.end()
            }
          });
    }

    /**
     * Create the menu data table
     */
    createMenuDataTable() {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false
            }
          });
          
          client.connect();
          
          client.query(`create table menu_data (file_name text NOT NULL, menu_count numeric NOT NULL, key_presses numeric NOT NULL, date text NOT NULL)`, (err, res) => {
            if (err) {
              console.log('Failed to create menu data table')
              console.log(err)
            }
            else {
                console.log("Initialized menu data table")
                client.end()
            }
          });
    }

    /**
     * Delete all rows from the menu data table
     */
    resetMenuDataTable() {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false
            }
          });
          
          client.connect();
          
          client.query(`DELETE FROM menu_data`, (err, res) => {
            if (err) {
              console.log('Failed to delete menu data table')
              console.log(err)
            }
            else {
                console.log("Deleted menu data rows")
                client.end()
            }
          });
    }

}

module.exports = DatabaseManager