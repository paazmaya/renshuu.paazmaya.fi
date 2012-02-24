<?php
/*******************
RENSHUU.PAAZMAYA.COM
http://creativecommons.org/licenses/by-nc-sa/3.0/
*******************/

/*
A list of selected trainings with static maps.
These trainings have been saved in the database.

http://code.google.com/apis/maps/documentation/staticmaps/

*/

require './config.php';
require './locale.php';

header('Content-type: text/html; charset=utf-8');


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

// Key values are same as used in the url for static Google Maps
$gmapoptions = array(
	'maptype' => array('roadmap', 'satellite', 'hybrid', 'terrain'),
	'language' => array('ja', 'en', 'fi'),
	'format' => array('png8', 'png32', 'gif', 'jpg', 'jpg-baseline')
);
// If the value is array, its value becomes the value of that array for an index found in db.


// Marker label will be numbered accoring to the order of how many of them are shown, perhaps A-Z as 0-9 is only ten...
// Marker color will be marked as 0x123456
// color: (optional) specifies a 24-bit color (example: color=0xFFFFCC) or a predefined color from the set {black, brown, green, purple, yellow, blue, gray, orange, red, white}.


// 0. Get the export settings
// If not logged in, check "public" boolean...
$options = array();
$sql = 'SELECT * FROM renshuu_export WHERE id = ' . $id;
$run =  $this->pdo->query($sql);
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




?>
<!DOCTYPE html>
<html lang="en">
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


if ($_SERVER['SERVER_NAME'] != '192.168.1.37')
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
