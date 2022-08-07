var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var IVRMenu = require('./IVRMenu.js')
var ExcelReader = require('./ExcelReader.js')
var XMLWriter = require('./XMLWriter')
var XMLReader = require('./XMLReader')
var AuditWriter = require('./AuditWriter')
var path = require("path");
var LucidChartReader = require('./LucidChartReader')
const PrettyAuditWriter = require('./PrettyAuditWriter')

var server = http.createServer(function (req, res) {

    if (req.url == '/fileupload') {
        var form = new formidable.IncomingForm({multiples: true});
        
        form.parse(req, function (err, fields, files) {

            var filePath = files.filetoupload.filepath;
            let pages = [] // An array containing Lucidchart page names

            if (fields.page instanceof Array) {
              pages = fields.page
            }
            else {
              pages.push(fields.page)
            }

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
              let reader = new LucidChartReader(files.filetoupload.filepath)
              reader.getMenus().then((menus) => {

                // Filter out menus from pages not selected by the user
                const filteredMenus = menus.filter((menu) => {
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
      }
      else if (req.url == "/audit") {
        var form = new formidable.IncomingForm();

        form.parse(req, function (err, fields, files) {

          var filePath = files.filetoupload.filepath;
          let resultingFilename = files.filetoupload.originalFilename.replace(".xml", ".xlsx")
          let xmlReader = new XMLReader(filePath)
          let menus = xmlReader.getMenus()

          const prettyAuditWriter = new PrettyAuditWriter(menus)
          prettyAuditWriter.getData().then((data) => {
            res.setHeader('Content-Length', data.length);
            res.setHeader('Content-Type', 'application/vnd.ms-excel  ');
            res.setHeader('Content-Disposition', 'attachment; filename=' + resultingFilename);
            res.write(data, 'binary');
            res.end()
          })
        
        });
      }
      else if (req.url == "/link.png") {
        res.writeHead(200, {'Content-Type': 'image/png'});
        var absolutePath = path.resolve('./link.png');
        fs.createReadStream(absolutePath).pipe(res)
      } 
      else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        var absolutePath = path.resolve('./index.html');
        fs.createReadStream(absolutePath).pipe(res)
      }

});

let port = process.env.PORT || 3000
server.listen(port);

console.log('Server running on port ' + port)
