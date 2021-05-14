const host = 'localhost';
var formidable = require('formidable'),
    util = require('util')
    , fs = require('fs');

var static = require('node-static');
var http = require('http');

var file = new (static.Server)(__dirname);
http.createServer(function (req, res) {
    if (req.url.includes('/music/')) {
        file.serve(req, res, () => {
            console.log('navigate to music folder!');
        });
    }
    else if (req.url.includes('/upload-music')) {
        if (req.method.toLowerCase() == 'get') {
            res.writeHead(200, { 'content-type': 'text/html' });
            res.end(
                '<form action="/upload" enctype="multipart/form-data" method="post">' +
                '<input type="text" name="title"><br>' +
                '<input type="file" name="upload" multiple="multiple"><br>' +
                '<input type="submit" value="Upload">' +
                '</form>'
            );
        }
    }
    else if (req.url.includes('/upload') && req.method.toLowerCase() == 'post') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log(err.message);
                return;
            }
            res.writeHead(200, { 'content-type': 'text/plain' });
            res.write('received upload:\n\n');
            // This last line responds to the form submission with a list of the parsed data and files.
            res.end(util.inspect({ fields: fields, files: files }));
            // console.log(files.upload.name);
            fs.rename(files.upload.path,__dirname + "/music/" + files.upload.name,function(err){
                if(err)
                {
                console.log('error in saving file --> ' + err.message);

                }
            });

        });
    }
    else {
        console.log('normal path');
        switch (req.url) {
            case "/getshit":
                res.writeHead(200);
                res.end('this shit get one');
                break;
            default:
                res.writeHead(404);
                res.end('resource node found!');
        }
    }

}).listen(8080, host, () => {
    console.log(__dirname);
    console.log('server started!');
});

