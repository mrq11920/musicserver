const host = 'localhost';
var formidable = require('formidable'),
    util = require('util')
    , fs = require('fs'),
    mysql = require('mysql');

var static = require('node-static');
var http = require('http');

//create user 'musicserver'@'localhost'  identified with mysql_native_password by '12345';


var mysql = require('mysql');

var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "musicserver",
    password: "12345",
    database: "musicdb"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
con.query('CREATE table if not exists song (name')

var file = new (static.Server)(__dirname);
http.createServer(function (req, res) {
    if (req.url.includes('/music/')) {
        file.serve(req, res, () => {
            console.log('navigate to music folder!');
        });
    }
    else if (req.url.includes('/upload-music')) {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(
            '<form action="/upload" enctype="multipart/form-data" method="post">' +
            '<input type="text" name="title"><br>' +
            '<input type="file" name="upload" multiple="multiple"><br>' +
            '<input type="submit" value="Upload">' +
            '</form>'
        );
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
            var songName = files.upload.name;

            fs.rename(files.upload.path, __dirname + "/music/" + files.upload.name, function (err) {
                if (err) {
                    console.log('error in saving file --> ' + err.message);
                }
            });

        });
    }
    else {
        // to do: search song by name or author (fulltext)
        // + get song by id / name 
     
       

        console.log('normal path');
        if (req.url.includes('/handle-user-playlist')) { 
            //"{"action":"add/update/delete", "data":"..","userid":"ab34"}
            //"playlist:{"playlist_id":"","owner":"userid","song_list":["songId","songId2"]}"
            //"song: {"name":"kho ve nu cuoi","singers":["dat g","du uyen"],"year":2019,""}
            
            let data = '';
            req.on('data', chunk => {
                data += chunk;
              })
              req.on('end', () => {
                console.log(JSON.parse(data).todo); 
                var json = JSON.parse(data);
                switch(json.action)
                {
                    case "add":
                        break;
                    case "update":
                        break;
                    case "delete":
                        break;
                    default:
                        console.log('error in /handle user playlist');


                }
                res.end();
              })
        }
        else if(req.url.includes('/handle-song'))
        {
            //{"action":"get"}
            let data = '';
            req.on('data', chunk => {
                data += chunk;
              })
              req.on('end', () => {
                console.log(JSON.parse(data).todo); 
                var json = JSON.parse(data);
                switch(json.action)
                {
                    case "add":
                        break;
                    case "update":
                        break;
                    case "delete":
                        break;
                    default:
                        console.log('error in /handle user playlist');


                }
                res.end();
              })
        }
        else {
            res.writeHead(404);
            res.end('resource node found!');
        }
    }

}).listen(8080, host, () => {
    console.log("serve file at folder --> " + __dirname);
    console.log('server started!');
});

