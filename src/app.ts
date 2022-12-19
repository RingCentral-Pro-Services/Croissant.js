require('dotenv').config()
var http = require('http');
var formidable = require('formidable');
const express = require('express')
var fs = require('fs');
import IVRMenu from './IVRMenu'
import ExcelReader from './ExcelReader';
import XMLWriter from './XMLWriter';
import XMLReader from './XMLReader'
import AuditWriter from './AuditWriter'
import LucidChartReader from './LucidChartReader';
import PrettyAuditWriter from './PrettyAuditWriter';
var path = require("path");
var ringcentral = require('ringcentral');
const axios = require('axios').default;

const app = express();

var session = require('express-session');
app.use(session({ secret: 'this-is-a-secret-token', tokens: '', resave: true, saveUninitialized: true}));
app.use(express.json())
const PORT = process.env.PORT || 3000

var rcsdk = null

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
})

app.use(express.static(path.resolve(__dirname, '../frontend/build')))

app.get('/login', (req: any, res: any) => {
  const state = req.query.state
  rcsdk = new ringcentral({
    server: process.env.RC_PLATFORM_URL,
    appKey: process.env.RC_CLIENT_ID,
    appSecret: process.env.RC_CLIENT_SECRET
  })
  let platform = rcsdk.platform()
  let loginURL = platform.loginUrl({"state": state})
  res.redirect(loginURL)
})

app.get('/oauth2callback', (req: any, res: any) => {
  let code = req.query.code
  let expiration = req.query['expires_in']
  let state = req.query.state

  rcsdk = new ringcentral({
    server: process.env.RC_PLATFORM_URL,
    appKey: process.env.RC_CLIENT_ID,
    appSecret: process.env.RC_CLIENT_SECRET
  })
  var platform = rcsdk.platform()
  var resp = platform.login({
    code: req.query.code,
    redirectUri: process.env.RC_REDIRECT_URI
  })
  .then((data: any) => {
    const refreshToken = data["_json"]["refresh_token"]
    const accessToken = data["_json"]["access_token"]
    res.redirect(`/token?access_token=${accessToken}&state=${state}&refresh_token=${refreshToken}`)
  })
})

app.get('/refresh', (req: any, res: any) => {
  const refreshToken = req.query.refresh_token
  const header = {
    "Content-type": "application/x-www-form-urlencoded",
    "Authorization": "Basic " + Buffer.from(process.env.RC_CLIENT_ID + ":" + process.env.RC_CLIENT_SECRET).toString('base64')
  }

  axios.post(`${process.env.RC_PLATFORM_URL}/restapi/oauth/token`, `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${process.env.RC_CLIENT_ID}`, {headers: header})
  .then((response: any) => {
    const accessToken = response.data.access_token
    const refreshToken = response.data.refresh_token
    const result = {
      "access_token": accessToken,
      "refresh_token": refreshToken
    }
    res.send(result)
    }
  )
  .catch((error: any) => {
    console.log('Error refreshing token')
    console.log(error)
  }
  )
  
})

app.post('/feedback', (req: any, res: any) => {
  console.log('Feedback received')
  axios.post('https://staging-n8n.ps.ringcentral.com/webhook-test/9d7ee724-8db6-4471-a29a-19818f803e16', req.body)
  .then((response: any) => {
    console.log('Feedback sent')
    console.log(response)
  })
  .catch((error: any) => {
    console.log('Error sending feedback')
    console.log(error)
  }
  )
  res.send('OK')
})

app.post('/fileupload', (req: any, res: any) => {
  var form = new formidable.IncomingForm({multiples: true});
        
        form.parse(req, function (err: any, fields: any, files: any) {

            var filePath = files.filetoupload.filepath;

            if (files.filetoupload.originalFilename.includes('.xlsx')) {
              
              // This is an excel file, process accordingly
              let resultingFilename = files.filetoupload.originalFilename.replace(".xlsx", ".xml")
              const reader = new ExcelReader(filePath)
              let menus = reader.getMenus()
              let xmlWriter = new XMLWriter(menus)

              res.setHeader('Content-Length', xmlWriter.xmlData.length);
              res.setHeader('Content-Type', 'text/xml');
              res.setHeader('Content-Disposition', 'attachment; filename=' + resultingFilename);
              res.write(xmlWriter.xmlData, 'binary');
              res.end()
            }
            else if (files.filetoupload.originalFilename.includes('.xml')) {
              // This is an XML file, generate audit
              let resultingFilename = files.filetoupload.originalFilename.replace(".xml", ".csv")
              let xmlReader = new XMLReader(filePath)
              let menus = xmlReader.getMenus()
              let auditWriter = new AuditWriter(menus)

              res.setHeader('Content-Length', auditWriter.csvData.length);
              res.setHeader('Content-Type', 'text/xml');
              res.setHeader('Content-Disposition', 'attachment; filename=' + resultingFilename);
              res.write(auditWriter.csvData, 'binary');
              res.end()
            }
            else if (files.filetoupload.originalFilename.includes('.csv')) {
              // This is a CSV file. Assume it was generated by LucidChart
              
              let pages: any[] = [] // An array containing Lucidchart page names

              if (fields.page instanceof Array) {
                pages = fields.page
              }
              else {
                pages.push(fields.page)
              }

              let reader = new LucidChartReader(files.filetoupload.filepath)
              reader.getMenus().then((menus: any) => {
                // Filter out menus from pages not selected by the user
                const filteredMenus = menus.filter((menu: any) => {
                  for (let index = 0; index < pages.length; index++) {
                    if (menu.page == pages[index]) {
                      return true
                    }
                  }
                  return false
                })

                let xmlWriter = new XMLWriter(filteredMenus)
                let outputFilename = files.filetoupload.originalFilename.replace(".csv", ".xml")

                res.setHeader('Content-Length', xmlWriter.xmlData.length);
                res.setHeader('Content-Type', 'text/xml');
                res.setHeader('Content-Disposition', 'attachment; filename=' + outputFilename);
                res.write(xmlWriter.xmlData, 'binary');
                res.end()
              })
            }
     });
})

app.post('/audit', (req: any, res: any) => {
  var form = new formidable.IncomingForm();

        form.parse(req, function (err: any, fields: any, files: any) {

          var filePath = files.filetoupload.filepath;
          let resultingFilename = files.filetoupload.originalFilename.replace(".xml", ".xlsx")
          let xmlReader = new XMLReader(filePath)
          let menus = xmlReader.getMenus()

          const prettyAuditWriter = new PrettyAuditWriter(menus)
          prettyAuditWriter.getData().then((data: any) => {
            res.setHeader('Content-Length', data.length);
            res.setHeader('Content-Type', 'application/vnd.ms-excel  ');
            res.setHeader('Content-Disposition', 'attachment; filename=' + resultingFilename);
            res.write(data, 'binary');
            res.end()
          })
        
        });
})

app.get('*', (req: any, res: any) => {
  res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
})
