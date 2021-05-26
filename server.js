const host = 'localhost';
var formidable = require('formidable'),
    util = require('util')
    , fs = require('fs'),
    mysql = require('mysql');
var sha1 = require('sha1');
var static = require('node-static');
var http = require('http');
const musicFolder = __dirname + "/music/";
const baseUrl = 'http://localhost:8080/'

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


var file = new (static.Server)(__dirname);
http.createServer(function (req, res) {
    if (req.url.includes('/music/') && req.method.toLowerCase() == 'get') {
        var params = req.url.split('/');
        var filePath = musicFolder + params[params.length - 1];
        console.log('get file Path --> ' + filePath);
        if (!fs.existsSync(filePath)) {
            console.log('file not found');
            res.writeHead(404, { 'content-type': 'text/plain' });
            res.end('resource node found!');
            return;
        }
        file.serve(req, res, () => {
            console.log('navigate to music folder!');
        });
    }
    else if (req.url.includes('/upload-music')) {
        fs.readFile('./upload-music.html', function (err, html) {
            res.writeHead(200, { 'content-type': 'text/html' });
            res.end(html);
        });

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
            var songTitle = fields.songTitle;
            var artistName = fields.artistName;
            var albumTitle = fields.albumTitle;
            var genreName = fields.genreName;
            var year = fields.year;
            var songId = sha1(songTitle + artistName + genreName + albumTitle + year);

            con.query('select artistName from Artist where artistName = ?', [artistName], function (err, result) {
                if (err) console.log(err);
                if (result.length == 0) {
                    con.query('insert into Artist values(?,?)', [artistName, genreName]);
                }
            });
            con.query('select albumTitle from Album where albumTitle = ?', [albumTitle], function (err, result) {
                if (err) console.log(err);
                if (result.length == 0)
                    con.query('insert into Album(albumTitle,artistName,genreName,year) values(?,?,?,?)', [albumTitle, artistName, genreName, year]);
            });

            con.query('select songId from SongFile where songId = ?', [songId], function (err, result) {
                if (err) console.log(err);
                if (result.length == 0) {

                    con.query('insert into SongFile(songTitle,artistName,albumTitle,genreName,songId,location) values (?,?,?,?,?,?)', [songTitle, artistName, albumTitle, genreName, songId, baseUrl + '/music/' + songId + '.mp3'], function (err, result) {
                        if (err) throw err;
                        console.log("1 record inserted");
                    });
                }
            });

            // move uploaded file from /tmp to musicFolder 
            fs.rename(files.upload.path, musicFolder + songId + '.mp3', function (err) {
                if (err) {
                    console.log('error in saving file --> ' + err.message);
                }
            });

        });
    }
    else if (req.url.includes('/search-music') && req.method.toLowerCase() == 'post') {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            console.log(JSON.parse(data));
            var json = JSON.parse(data);
            switch (json.action.toLowerCase()) {
                case "song":
                    console.log('query result from /search-music--------------------');
                    var songName = json.data;
                    console.log('songName --> ' + songName);
                    con.query('select * from SongFile where songTitle like ?', ['%' +songName +'%'], function (err, result) {
                        if (err) throw err;
                        console.log('action: song --> ');
                        console.log(result);
                        console.log('length --> ' + result.length);
                        console.log('---------------------------------------------------')
                        res.end(JSON.stringify(result));
                    });
                    break;
                case "artist":
                    var artistName = json.data;
                    con.query('select * from SongFile where artistName like ?', ['%' +artistName+'%'], function (err, result) {
                        if (err) throw err;
                        console.log('query result from /search-music| action: artist --> ');
                        console.log(result);
                        console.log('length --> ' + result.length);
                        console.log('---------------------------------------------------')
                        res.end(result);
                    });
                    break;
                case "album":
                    var albumTitle = json.data;
                    con.query('select * from SongFile where albumTitle = ?', ['%' +albumTitle +'%'], function (err, result) {
                        if (err) throw err;
                        console.log('query result from /search-music| action: album --> ');
                        console.log(result);
                        console.log('length --> ' + result.length);
                        console.log('---------------------------------------------------')
                        res.end(result);
                    });
                    break;
                default:
                    console.log('error in /search music | action not found!');
            }
        })
    }
    else {
        // to do: search song by name or author (fulltext)
        // + get song by id / name 
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
                switch (json.action) {
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

