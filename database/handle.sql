
create user 'musicserver'@'localhost'  identified with mysql_native_password by '12345'
GRANT ALL PRIVILEGES ON *.* TO 'musicserver'@'localhost' IDENTIFIED BY '12345';
create database musicdb;

ALTER TABLE Song  
ADD FULLTEXT(productDescription,productLine)

