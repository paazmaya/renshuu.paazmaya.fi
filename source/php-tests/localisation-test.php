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
	'en' => 'en_GB',
	'fi' => 'fi_FI',
	'fr' => 'fr_FR',
	'it' => 'it_IT',
	'ja' => 'ja_JP',
	'sl' => 'sl_SI'
);

$lang = 'fi';

echo "Realpath of locale: " . realpath($cf['localedir']) . "\n";

// Gettext related settings.
$localisedlang = $cf['languages'][$lang] . '.UTF-8';
echo "\nlocalisedlang: " . $localisedlang;

// http://fi.php.net/manual/en/function.gettext.php
//putenv('LANGUAGE=' . $lang);
//putenv('LC_ALL=' . $lang);
//setlocale(LC_ALL, $lang);

//putenv('LANGUAGE=' . $cf['languages'][$lang]);
//putenv('LC_ALL=' . $cf['languages'][$lang]);
//setlocale(LC_ALL, $cf['languages'][$lang]);

putenv('LANGUAGE=' . $localisedlang);
putenv('LC_ALL=' . $localisedlang);
setlocale(LC_ALL, $localisedlang);


bindtextdomain($cf['gettextdomain'], realpath($cf['localedir']));
bind_textdomain_codeset($cf['gettextdomain'], 'UTF-8');
echo "\ntextdomain set: " . textdomain($cf['gettextdomain']);

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

