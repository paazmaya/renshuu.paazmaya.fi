
CREATE TABLE IF NOT EXISTS renshuu_art (
  id int(11) NOT NULL AUTO_INCREMENT,
  title varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  url varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  modified int(11) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS renshuu_export (
  id mediumint(6) unsigned NOT NULL AUTO_INCREMENT,
  modified int(11) unsigned NOT NULL DEFAULT '0',
  user mediumint(6) unsigned NOT NULL DEFAULT '0',
  maptype mediumint(6) unsigned NOT NULL DEFAULT '0',
  public tinyint(1) DEFAULT '0',
  language mediumint(6) unsigned DEFAULT '0',
  format mediumint(6) unsigned DEFAULT '0',
  color varchar(20) COLLATE utf8_unicode_ci DEFAULT '0x55FF55',
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS renshuu_location (
  id mediumint(6) NOT NULL AUTO_INCREMENT,
  latitude decimal(10,6) DEFAULT NULL,
  longitude decimal(10,6) DEFAULT NULL,
  title varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  url varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  info varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  address varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  modified int(11) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS renshuu_person (
  id mediumint(6) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  art mediumint(6) unsigned DEFAULT NULL,
  contact varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  modified int(11) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS renshuu_training (
  id mediumint(6) unsigned NOT NULL AUTO_INCREMENT,
  art mediumint(6) unsigned DEFAULT NULL,
  location mediumint(6) unsigned DEFAULT NULL,
  starttime mediumint(6) unsigned DEFAULT NULL,
  person mediumint(6) unsigned DEFAULT NULL,
  endtime mediumint(6) unsigned DEFAULT NULL,
  occurance varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  weekday mediumint(6) unsigned NOT NULL DEFAULT '7',
  modified int(11) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS renshuu_user (
  id mediumint(6) unsigned NOT NULL AUTO_INCREMENT,
  email varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  name varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  modified int(11) unsigned NOT NULL DEFAULT '0',
  access smallint(4) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (id)
);
