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

// sudo locale-gen fi_FI.utf8
$lang = 'fi';

echo "Realpath of locale: " . realpath($cf['localedir']) . "\n";
echo "Current locale, setlocale(LC_ALL, '0'): " . setlocale(LC_ALL, "0") . "\n";

// Gettext related settings.
$localisedlang = $cf['languages'][$lang] . '.UTF-8';
echo "\nlocalisedlang: " . $localisedlang . "\n";

echo "\nLocales available:\n";
echo system('locale -a') . "\n";

// http://fi.php.net/manual/en/function.gettext.php
$option = 3;

$setlocale = 0;
if ($option == 0)
{
	putenv('LANGUAGE=' . $lang);
	putenv('LC_ALL=' . $lang);
	$setlocale = setlocale(LC_ALL, $lang);
}
else if ($option == 1)
{
	putenv('LANGUAGE=' . $cf['languages'][$lang]);
	putenv('LC_ALL=' . $cf['languages'][$lang]);
	$setlocale = setlocale(LC_ALL, $cf['languages'][$lang]);
}
else if ($option == 2)
{
	putenv('LANGUAGE=' . $localisedlang);
	putenv('LC_ALL=' . $localisedlang);
	$setlocale = setlocale(LC_ALL, $localisedlang);
}
else if ($option == 3)
{
	putenv('LANGUAGE=' . $lang);
	putenv('LC_ALL=' . $lang);
	
	$locales = array(
		$cf['languages'][$lang] . '.UTF-8',
		$cf['languages'][$lang] . '.utf-8',
		$cf['languages'][$lang] . '.UTF8',
		$cf['languages'][$lang] . '.utf8',
		$cf['languages'][$lang] . '.ISO-8859-15',
		$cf['languages'][$lang] . '.iso-8859-15',
		$cf['languages'][$lang] . '.iso885915',
		$cf['languages'][$lang] . '.ISO-8859-1',
		$cf['languages'][$lang] . '.iso-8859-1',
		$cf['languages'][$lang] . '.iso88591',
		$cf['languages'][$lang],
		$lang
	);
	$setlocale = setlocale(LC_ALL, $locales);
}

if ($setlocale === false) 
{
	$setlocale = "false";
}
echo "\nsetlocale resulted: " . $setlocale . "\n";

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

echo "\n";
echo "Current locale, setlocale(LC_ALL, '0'): " . setlocale(LC_ALL, "0") . "\n";
