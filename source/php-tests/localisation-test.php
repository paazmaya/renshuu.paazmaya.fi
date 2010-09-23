<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/

header('Content-type: text/plain');

$cf = array();
$cf['gettextdomain'] = 'renshuuSuruToki';
$cf['localedir'] = '../locale';

// Languages supported
$cf['languages'] = array(
	'en' => '',
	'fi' => '',
	'fr' => '',
	'it' => '',
	'ja' => '',
	'sl' => ''
);

$lang = 'fi_FI';

// Gettext related settings.
putenv('LANGUAGE=' . $lang); // ?
putenv('LC_ALL=' . $lang); // ? should this be the actual language name...
//setlocale(LC_ALL, $lang); // . '.UTF-8');
//bindtextdomain($cf['gettextdomain'], $cf['localedir']);
//bind_textdomain_codeset($cf['gettextdomain'], 'UTF-8'); // ?
//textdomain($cf['gettextdomain']);

echo "\nsetlocale LC_MESSAGES: ";
//echo setlocale( LC_MESSAGES, $lang . '.UTF-8');
echo setlocale( LC_MESSAGES, $lang . '.utf8');
echo "\nbindtextdomain: ";
echo bindtextdomain($cf['gettextdomain'], $cf['localedir']);
echo "\nbind_textdomain_codeset: ";
echo bind_textdomain_codeset($cf['gettextdomain'], 'UTF-8');
echo "\ntextdomain: ";
echo textdomain($cf['gettextdomain']);



// Translation is looking for in ../../locale/en/LC_MESSAGES/renshuuSuruToki.mo

echo "\nweekdays: ";
$weekdays = array(
	gettext('Sunday'), 
	gettext('Monday'), 
	gettext('Tuesday'),
	gettext('Wednesday'), 
	gettext('Thursday'),
	gettext('Friday'), 
	gettext('Saturday')
);

print_r($weekdays);
