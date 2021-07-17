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
const { JSONParser } = require('formidable');

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

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

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
    else if (req.url.includes('/get-all-music') && req.method.toLowerCase() == 'get') {
        console.log('/get-all-music---------------------------');
        con.query('select * from Song', function (err, result) {
            if (err) console.log(err);
            res.end(JSON.stringify(result));
        });
    }
    else if (req.url.includes('/get-top-ten-music') && req.method.toLowerCase() == 'get') {
        console.log('/get-top-ten-music---------------------------');
        con.query('select * from Song order by songId limit 5', function (err, result) {
            if (err) console.log(err);
            res.end(JSON.stringify(result));
        });
    }
    else if (req.url.includes('/handle-user/') & req.method.toLowerCase() == 'post') {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            console.log('/login post data json -----------> ');
            console.log(JSON.parse(data));
            var json = JSON.parse(data);
            var userName = json.userName;
            var password = json.password;
            var email = json.email;
            var age = json.age;
            var userId = '';
            switch (json.type) {
                case 'login':
                    con.query('select userId from User where userName = ? AND password = ?', [userName, password], function (err, result) {
                        if (err) console.log(err);
                        if (result.length != 0) {
                            res.end(JSON.stringify({ status: 'success', message: 'login successfully', userId: result[0].userId }));
                        }
                        else
                            res.end(JSON.stringify({ status: 'failed', message: 'login failed!' }));
                    });
                    break;
                case 'signup':
                    userId = sha1(userName + password + email + age);
                    con.query('select userId from User where userName = ?', [userName], function (err, result) {
                        if (err) console.log(err);
                        if (result.length == 0) {
                            con.query('insert into User(userName,password,email,age,userId) values(?,?,?,?,?)', [userName, password, email, age, userId], function (err, result) {
                                console.log('add new user to database userId--> ' + userId);
                            });
                            res.end(JSON.stringify({ status: 'success', message: 'sign up successfully', userId: userId }));
                        }
                        else {
                            res.end(JSON.stringify({ status: 'failed', message: 'username existed !' }));
                        }

                    });
                    break;
                case 'getUserId':
                    break;

            }
            console.log('end-----------------------------------------');
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
            // var songImage = 

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

            fs.rename(files.songData.path, musicFolder + songId + '.mp3', function (err) {
                if (err) {
                    console.log('error in saving file --> ' + err.message);
                }
            });
            fs.rename(files.songImage.path, musicFolder + songId + '.jpg', function (err) {
                if (err) {
                    console.log('error in saving file --> ' + err.message);
                }
            });

            con.query('select songId from Song where songId = ?', [songId], function (err, result) {
                if (err) console.log(err);
                if (result.length == 0) {
                    con.query('insert into Song(songTitle,artistName,albumTitle,genreName,songId,songUrl,songImageUrl) values (?,?,?,?,?,?,?)', [songTitle, artistName, albumTitle, genreName, songId, baseUrl + 'music/' + songId + '.mp3', baseUrl + 'music/' + songId + '.jpg'], function (err, result) {
                        if (err) throw err;
                        console.log("1 record inserted");
                    });
                }
            });
            // console.log(files);
            // console.log('--------------------');
            // console.log(files.songData);
            // console.log('-------------------');
            // move uploaded file from /tmp to musicFolder 

        });
    }
    else if (req.url.includes('/search-music/') && req.method.toLowerCase() == 'post') {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            console.log('/search-music post data json -------->');
            console.log(JSON.parse(data));
            var json = JSON.parse(data);
            switch (json.type.toLowerCase()) {
                case "song":
                    console.log('query result from /search-music--------------------');
                    var songName = json.data.trim();
                    console.log('songName --> ' + songName);
                    con.query('select * from Song where songTitle like ?', [songName + '%'], function (err, result) {
                        if (err) throw err;
                        console.log('type: song --> ');
                        console.log(result);
                        console.log('length --> ' + result.length);
                        console.log('---------------------------------------------------')
                        res.end(JSON.stringify(result));
                    });
                    break;
                case "artist":
                    var artistName = json.data.trim();
                    con.query('select * from Song where artistName like ?', [artistName + '%'], function (err, result) {
                        if (err) throw err;
                        console.log('query result from /search-music| type: artist --> ');
                        console.log(result);
                        console.log('length --> ' + result.length);
                        console.log('---------------------------------------------------')
                        res.end(JSON.stringify(result));
                    });
                    break;
                case "album":
                    var albumTitle = json.data;
                    con.query('select * from Song where albumTitle like ?', [albumTitle + '%'], function (err, result) {
                        if (err) throw err;
                        console.log('query result from /search-music| type: album --> ');
                        console.log(result);
                        console.log('length --> ' + result.length);
                        console.log('---------------------------------------------------')
                        res.end(JSON.stringify(result));
                    });
                    break;
                case "playlist":
                    var playlistName = json.data;
                    var arrayFinalResult = [];
                    var lock = 1;
                    con.query('select * from Playlist where playlistName like ?', [playlistName + '%'], function (err, result) {
                        if (err) throw err;
                        console.log('query result from /search-music| type: playlistName --> ');
                        console.log(result);
                        console.log('length --> ' + result.length);
                        console.log('---------------------------------------------------')
                        // if(result.length == 0) res.end();
                        var resultLength = result.length;
                        for (var i = 0; i < result.length; i++) {

                            var listSongId = result[i].songIdList.split(',');
                            var resultPlaylistName = result[i].playlistName;

                            console.log('list song id -->  ');
                            console.log(listSongId);
                            // lock = 1;
                            con.query('select * from Song where songId in (?)', [listSongId], function (err, result_songs) {
                                if (err) console.log(err);
                                console.log('result_songs --->  ');
                                console.log(result_songs);
                                console.log('resultPlaylistName ---> ' + resultPlaylistName);
                                var jsonTemp = { 'playlistName': resultPlaylistName, 'songs': result_songs };
                                console.log('jsonTemp --> ');
                                console.log(jsonTemp);
                                arrayFinalResult.push(jsonTemp);

                                console.log(' value i ----> ' + i);
                                // lock = 0;
                                console.log('lock value --> ' + lock)
                                if(i == resultLength - 1 ) 
                                    lock = 0;
                                //     res.end(JSON.stringify(arrayFinalResult));

                                // res.end(JSON.stringify(songs));
                            });
                         
                        }
                        // console.log('lock value --> ' + lock)
                        // res.end(JSON.stringify(arrayFinalResult));
                    });
                    break;
                default:
                    console.log('error in /search music | type not found!');
            }
        })
    }
    else if (req.url.includes('/generate-playlist') && req.method.toLocaleLowerCase() == 'get') {

        var playlistNames = ['Nhac Hay Thang 3', 'Nhac Tam Trang', 'Nhac Hay Thang 4', 'Nhac Buon', 'Dance', 'Pop'];
        con.query('select * from Song', function (err, result) {
            if (err) console.log(err);
            var allMusic = result;
            console.log(allMusic[1].songId);
            var owner = "admin";
            for (var i = 0; i < playlistNames.length; i++) {
                var playlistLength = randomIntFromInterval(2, 5);
                var songIdListString = [];
                for (var j = 0; j < playlistLength; j++) {
                    var songId = allMusic[randomIntFromInterval(0, allMusic.length - 1)].songId;
                    console.log('-------- songID ' + songId);
                    songIdListString.push(songId);
                }
                con.query('insert into Playlist(playlistName,owner,songIdList,playlistId) values(?,?,?,?)', [playlistNames[i], owner, songIdListString.join(), sha1(playlistNames[i])], function (err, result) { });
            }
            res.end(JSON.stringify(allMusic));
        });
    }
    else if (req.url.includes('/handle-user-playlist/') && req.method.toLowerCase() == 'post') {
        //"{"action":"add/update/delete", "data":"..","userid":"ab34"}
        //"playlist:{"playlist_id":"","owner":"userid","song_list":["songId","songId2"]}"
        //"song: {"name":"kho ve nu cuoi","singers":["dat g","du uyen"],"year":2019,""}

        let data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            console.log('/handle-user-playlist post data json -------->');
            console.log(JSON.parse(data));
            var json = JSON.parse(data);
            var playlistName = json.playlistName;
            var owner = json.owner;
            var songIdListString = JSON.stringify(json.songIdList);
            console.log('songIdListString --> ' + songIdListString);
            switch (json.type) {
                case "get":

                    break;
                case "add":
                    console.log('/handle-user-playlist |type --> add');
                    var playlistId = sha1(playlistName + owner + Date.now());
                    con.query('insert into Playlist(playlistName,owner,songIdList,playlistId) values(?,?,?,?)', [playlistName, owner, songIdListString, playlistId], function (err, result) {
                        if (err) {
                            console.log(err);
                            res.end(JSON.stringify({ status: 'fail', message: 'error in add new playlist' }));
                        }
                        else {
                            console.log('insert new playlist to database  playlistId ---> ' + playlistId);
                            res.end(JSON.stringify({ status: 'success', message: 'added new playlist to database, playlistId --> ' + playlistId }));
                        }
                    });
                    break;
                case "update":

                    break;
                case "delete":
                    break;
                default:
                    console.log('error in /handle user playlist');
            }
        });
    }
    else {
        // to do: search song by name or author (fulltext)
        // + get song by id / name 
        res.writeHead(404);
        res.end('resource node found!');
    }

}).listen(8080, () => {
    console.log("serve file at folder --> " + __dirname);
    console.log('server started!');
});

