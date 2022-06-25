const { Client } = require('pg');

class DatabaseManager {

    xml_created = 0
    csv_created = 0
    menus_created = 0
    keypresses_created = 0
    menus_audited = 0
    keypresses_audited = 0

    constructor() {

    }

    logXML(menuCount, keyPressCount) {
        this.getCurrentCounts(menuCount, keyPressCount)
        console.log(`XML Created (Before): ${this.xml_created}`)
        console.log(`CSV Created (Before): ${this.csv_created}`)
        console.log(`Menus Created (Before): ${this.menus_created}`)
        console.log(`Keypresses Created (Before): ${this.keypresses_created}`)
    }

    logCSV(menuCount, keyPressCount) {
        this.updateAuditCounts(menuCount, keyPressCount)
    }

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

    logFile(filename, menuCount, keyPressCount) {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false
            }
          });
          
          client.connect();
          
          client.query(`INSERT INTO menu_data VALUES('south', ${menuCount}, ${keyPressCount}, ${Date.now().toString().replace(/\s/g, '_')})`, (err, res) => {
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

}

module.exports = DatabaseManager