var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var IVRMenu = require('./IVRMenu.js')
var ExcelReader = require('./ExcelReader.js')
var XMLWriter = require('./XMLWriter')

var server = http.createServer(function (req, res) {

    if (req.url == '/fileupload') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {

            var filePath = files.filetoupload.filepath;
            let resultingFilename = files.filetoupload.originalFilename.replace(".xlsx", ".xml")

            const reader = new ExcelReader(filePath)
            let menus = reader.getMenus()
            let xmlWriter = new XMLWriter(menus)

            res.setHeader('Content-Length', xmlWriter.xmlData.length);
            res.setHeader('Content-Type', 'text/xml');
            res.setHeader('Content-Disposition', 'attachment; filename=' + resultingFilename);
            res.write(xmlWriter.xmlData, 'binary');
            res.end()
     });
      } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.createReadStream('index.html').pipe(res)
      }

});

server.listen(3000); //3 - listen for any incoming requests

console.log('Node.js web server at port 5000 is running..')
