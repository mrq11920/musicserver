CREATE TABLE Genre (
            genreName varchar(72) PRIMARY KEY,
            description varchar(255)
    );
 CREATE TABLE Playlist (
            playlistName varchar(72) PRIMARY KEY,
            tracks int
    );
CREATE TABLE Artist (
            artistName varchar(72) PRIMARY KEY,
            genreName varchar(72),
            FOREIGN KEY (genreName) REFERENCES Genre(genreName)
    );
 CREATE TABLE Album (
            albumTitle varchar(72) PRIMARY KEY,
            artistName varchar(72),
            genreName varchar(72),
            tracks int,
           
            year int,
            FOREIGN KEY (artistName) REFERENCES Artist(artistName),
            FOREIGN KEY (genreName) REFERENCES Genre(genreName)
    );

    CREATE TABLE SongFile (
	    songId varchar(100),
            songTitle varchar(72),
            artistName varchar(72),
            albumTitle varchar(72),
            trackNo int,
           
            format varchar(6),
            location varchar(255),
            genreName varchar(72),
            playlistName varchar(72),
            FOREIGN KEY (artistName) REFERENCES Artist(artistName),
            FOREIGN KEY (albumTitle) REFERENCES Album(albumTitle),
            FOREIGN KEY (genreName) REFERENCES Genre(genreName),
            FOREIGN KEY (playlistName) REFERENCES Playlist(playlistName),
            PRIMARY KEY (songTitle, artistName, albumTitle)
    );
   

CREATE  INDEX autid ON newauthor(aut_id);
alter table Song create index songTitleindex on SongFile(songTitle);

use musicdb; drop table if exists SongFile; drop table if exists Album; drop table if exists Artist;drop table if exists Genre; drop table if exists Playlist;   

create user 'musicserver'@'localhost'  identified with mysql_native_password by '12345'
GRANT ALL PRIVILEGES ON *.* TO 'musicserver'@'localhost' IDENTIFIED BY '12345';
create database musicdb;

use musicdb;
CREATE TABLE Genre (
            genreName varchar(72) PRIMARY KEY,
            description varchar(255)
    );

CREATE TABLE Artist (
            artistName varchar(72) PRIMARY KEY,
            genreName varchar(72)
    );
 CREATE TABLE Album (
            albumTitle varchar(72) PRIMARY KEY,
            artistName varchar(72),
            genreName varchar(72),
            tracks int,
            year int
    );

    CREATE TABLE Song (
	    songId varchar(100),
            songTitle varchar(72),
            artistName varchar(72),
            albumTitle varchar(72),
            trackNo int,
            format varchar(6),
            songUrl varchar(255),
            songImageUrl varchar(255),
            genreName varchar(72),
            playlistName varchar(72),
            PRIMARY KEY (songId)
    );

    create table User (
            userName varchar(100),
            password varchar(100),
            email varchar(100),
            country varchar(10),
            age int,
            userId varchar(100)
    );
    create table Playlist (
            playlistName varchar(200),
            songIdList varchar(2000),
            owner varchar(100),
            playlistId varchar(100)
    );
