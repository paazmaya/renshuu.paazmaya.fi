
CREATE TABLE ren_area (id INTEGER PRIMARY KEY auto_increment, name TEXT);
INSERT INTO ren_area VALUES(1,'北海道');
INSERT INTO ren_area VALUES(2,'茨城県');
INSERT INTO ren_area VALUES(3,'埼玉県');
INSERT INTO ren_area VALUES(4,'千葉県');
INSERT INTO ren_area VALUES(5,'東京都');
INSERT INTO ren_area VALUES(6,'神奈川県');
INSERT INTO ren_area VALUES(7,'長野県');
INSERT INTO ren_area VALUES(8,'静岡県');
INSERT INTO ren_area VALUES(9,'愛知県');
INSERT INTO ren_area VALUES(10,'岐阜県');
INSERT INTO ren_area VALUES(11,'大阪湾');
INSERT INTO ren_area VALUES(12,'兵庫県');
INSERT INTO ren_area VALUES(13,'香川県');
INSERT INTO ren_area VALUES(14,'愛媛県');
INSERT INTO ren_area VALUES(15,'奈良県');
CREATE TABLE ren_art (id INTEGER PRIMARY KEY auto_increment, name TEXT, modified INTEGER NOT NULL DEFAULT 0);
INSERT INTO ren_art VALUES(1,'直心影流薙刀術',0);
INSERT INTO ren_art VALUES(2,'琉球古武術保存振興会',0);

CREATE TABLE ren_export (id INTEGER PRIMARY KEY  NOT NULL ,modified INTEGER NOT NULL ,user INTEGER NOT NULL  DEFAULT 0 ,maptype INTEGER NOT NULL  DEFAULT 0 ,public BOOL DEFAULT false ,language INTEGER DEFAULT 0 ,format INTEGER DEFAULT 0 , color TEXT DEFAULT '0x55FF55');
INSERT INTO ren_export VALUES(1,'2010-08-10 13:26:29',1,0,'true',0,0,'0x55FF55');

CREATE TABLE ren_location (id INTEGER PRIMARY KEY auto_increment, latitude REAL, longitude REAL, name TEXT, url TEXT, info TEXT, address TEXT, modified INTEGER NOT NULL DEFAULT 0);
INSERT INTO ren_location VALUES(1,43.06199056352941,141.3650743583679,'札幌市立中央体育館',NULL,NULL,NULL,0);
INSERT INTO ren_location VALUES(3,35.657099620424724,139.70614475631714,'soohonbu',NULL,NULL,NULL,0);


DROP TABLE IF EXISTS ren_person;
CREATE TABLE ren_person (id INTEGER PRIMARY KEY ,name TEXT,art INTEGER,contact TEXT,modified INTEGER NOT NULL );
INSERT INTO ren_person VALUES(1,'井上キショ',2,NULL,0);


CREATE TABLE ren_training (id INTEGER PRIMARY KEY ,art INTEGER,location INTEGER,starttime INTEGER,person INTEGER,endtime INTEGER,occurance TEXT,weekday INTEGER NOT NULL  DEFAULT 7 ,modified INTEGER NOT NULL  default 0);
INSERT INTO ren_training VALUES(1,1,1,1000,NULL,150,NULL,7,0);
INSERT INTO ren_training VALUES(2,2,3,1900,2,180,NULL,2,0);


CREATE TABLE ren_user (id INTEGER PRIMARY KEY  NOT NULL ,email TEXT,password TEXT,name TEXT,modified INTEGER NOT NULL , access INTEGER NOT NULL  DEFAULT 0);
INSERT INTO ren_user VALUES(1,'olavic@gmail.com','95f65294081a8c4a28d03e42f6294f7c2af4fbe5','Jukka Paasonen',0,128);
