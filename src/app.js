var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var IVRMenu = require('./IVRMenu.js')
var ExcelReader = require('./ExcelReader.js')

var server = http.createServer(function (req, res) {

    if (req.url == '/fileupload') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var filePath = files.filetoupload.filepath;
            res.write('You uploaded a file: ' + filePath)

            const reader = new ExcelReader(filePath)
            let menus = reader.getMenus()

            console.log(menus[0]["name"])

            res.end()
     });
      } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
        res.write('<input type="file" name="filetoupload"><br>');
        res.write('<input type="submit">');
        res.write('</form>');
        res.end();
      }

});

server.listen(3000); //3 - listen for any incoming requests

console.log('Node.js web server at port 5000 is running..')

const menu = new IVRMenu()