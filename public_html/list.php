<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/

/*
A list of selected trainings with static maps.
http://code.google.com/apis/maps/documentation/staticmaps/

*/

require './config.php';
require './functions.php';
session_start();

// require 'translations_' . $_SESSION['lang'] . '.php';
require './translations_en.php';

// As per .htaccess, all requests are redirected to index.php with one GET variable.
if (isset($_GET['page']) && strlen($_GET['page']) > 0)
{
	$uri = '/#' . urize($_GET['page']);

	header('HTTP/1.1 301 Moved Permanently');
	header('Location: http://' . $_SERVER['HTTP_HOST'] . $uri);
	exit();
}

header('Content-type: text/html; charset=utf-8');


$gmapstaticbase = 'http://maps.google.com/maps/api/staticmap?';

//http://maps.google.com/staticmap?zoom=14&size=640x500&maptype=terrain&format=jpg&sensor=false&markers=60.464940,22.281646,blue&language=en

// Key values are same as used in the url for static Google Maps
$gmapoptions = array(
	'maptype' => array('roadmap', 'satellite', 'hybrid', 'terrain'),
	'language' => array('ja', 'en', 'fi'),
	'format' => array('png8', 'png32', 'gif', 'jpg', 'jpg-baseline')
);
// http://code.google.com/apis/maps/documentation/staticmaps/#URL_Parameters
// If the value is array, its value becomes the value of that array for an index found in db.
$options = array(
	'maptype' => 'roadmap',
	'language' => 'ja',
	'format' => 'png8',
	'sensor' => 'false',
	//'center' => '0,0', // Marker will set the center anyhow..
	'zoom' => '14',
	'size' => '400x300'
	'markers' => 'color:blue|label:X|0,0'
);

// Marker label will be numbered accoring to the order of how many of them are shown, perhaps A-Z as 0-9 is only ten...




$id = 0;
// This should always be set anyhow due to mod_rewrite...
// $_GET['page'] --> /export/[id int]
if (isset($_GET['page']))
{
	$parts = explode('/', strtolower($_GET['page']));
	$count = count($parts);
	if ($count > 1 && $parts['0'] = 'export' && is_numeric($parts['1']))
	{
		$id = intval($parts['1']);
	}
}


// 0. Get the export settings
// If not logged in, check "public" boolean...
$sql = 'SELECT * FROM ren_export WHERE id = ' . $id;
$run =  $link->query($sql);
if ($run)
{
	$settings = $run->fetch(PDO::FETCH_ASSOC);
	$options['maptype'] = $gmapoptions['maptype'][$settings['maptype']];
	$options['language'] = $gmapoptions['language'][$settings['language']];
	$options['format'] = $gmapoptions['format'][$settings['format']];
}

// 1. Get the list of saved items, loop thru, ordering also by request


// 2. Build a info box of each, containing the map

// 3. Create html page but keep in mind paper size A4...





$url = $gmapstaticbase . implode('&', $options);



// Close the SQLite connection
$link = null;

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<title><?php echo $cf['title']; ?></title>
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
	<link rel="icon" type="image/ico" href="/favicon.ico" />
	<link type="text/css" href="/css/export.css" rel="stylesheet" />
</head>
<?php

?>
<body>
	<div id="wrap">

	</div>
<?php


if ($_SERVER['SERVER_NAME'] == '192.168.1.37')
{
	?>
	<script type="text/javascript">
		var _gaq = _gaq || [];
		_gaq.push(['_setAccount', 'UA-2643697-11']);
		_gaq.push(['_trackPageview']);

		(function() {
			var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		})();
	</script>
	<?php
}
?>
</body>
</html>