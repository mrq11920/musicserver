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
   


drop table if exists SongFile; drop table if exists Album; drop table if exists Artist;drop table if exists Genre; drop table if exists Playlist;   


create user 'musicserver'@'localhost'  identified with mysql_native_password by '12345'
GRANT ALL PRIVILEGES ON *.* TO 'musicserver'@'localhost' IDENTIFIED BY '12345';
create database musicdb;

ALTER TABLE SongFile  
ADD FULLTEXT(songTitle,artistName,albumTitle);

CREATE  INDEX autid ON newauthor(aut_id);

alter table SongFile create index songTitleindex on SongFile(songTitle);


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
            genreName varchar(72)
    );
 CREATE TABLE Album (
            albumTitle varchar(72) PRIMARY KEY,
            artistName varchar(72),
            genreName varchar(72),
            tracks int,
            year int
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
            PRIMARY KEY (songId)
    );