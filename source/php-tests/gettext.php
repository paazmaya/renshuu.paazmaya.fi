<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/
/*
A tool for creating .MO files from .PO.
*/

require './config.php';
require './functions.php';
require $cf['libdir'] . 'Pepipopum.php';

header('Content-type: text/plain; charset=utf-8');

// Write a small application to print "Good Morning!" in a variety of languages
// Rather than hard-code the greetings, use gettext to manage the translations

// Make an array
// Use the ISO two-letter codes as keys
// Use the language names as values
$iso_codes = array 
(
	'en' => 'English',
	'fi' => 'Finnish',
	'fr' => 'French',
	'it' => 'Italian',
	'ja' => 'Japanese',
	'sl' => 'Slovenian'
);

echo 'Going to create .MO files of the existing .PO files:' . "\n";

$localedir = realpath($cf['localedir']);

//bindtextdomain($cf['gettextdomain'], $cf['localedir']);
//textdomain($cf['gettextdomain']);

//bind_textdomain_codeset($cf['gettextdomain'], 'UTF-8'); // ?


foreach ($iso_codes as $iso_code => $language)
{
	echo "\t" . 'Prosessing ' . $language . ' (' . $iso_code . ')' . "\n";
	$dir = $localedir . '/' . $iso_code;
	if (!file_exists($dir))
	{
		mkdir($dir);
	}
	$dir .= '/LC_MESSAGES/';
	if (!file_exists($dir))
	{
		mkdir($dir);
	}
	$po = $dir . $cf['gettextdomain'] . '.po';
	$mo = $dir . $cf['gettextdomain'] . '.mo';
	echo "\t" . $po . ' --> ' . $mo . "\n";
	if (file_exists($po))
	{
		echo system('msgfmt -o ' . $mo . ' ' . $po) . "\n";
	}
}

/*
foreach ($iso_codes as $iso_code => $language)
{
	echo "putenv LANGUAGE: " . putenv('LANGUAGE='.$iso_code) . "\n";
	echo "putenv LC_ALL: " . putenv('LC_ALL=' . $language) . "\n";
	echo "setlocale LC_ALL: " . setlocale(LC_ALL, $language . '.UTF-8') . "\n";

	// Print out the language name and greeting
	// Note that the greeting is wrapped in a call to gettext
	printf("%12s: %s\n", $language, gettext("Good morning!"));
	echo "\n";
}
*/

/*
xgettext \
--default-domain=greetings \
--indent \
--omit-header \
--sort-output \
--width=76 \
--language=PHP \
--strict \
gettext.php


msgfmt -o greetings.mo greetings.po

*/

