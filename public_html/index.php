<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/
/*
Colors at Kuler: http://kuler.adobe.com/#themeID/979806
red: AA1515
white: E9FFE8
light green: B5E3AD
brown red: 8C635C
green: 0E3621
black: 100212
*/
/*
Filtering the list of trainings shown on the map can be set by the following:
- Art
- Weekday
- Area, which would be primarily set according to the current map view.

All data fetched from the backend will be cached locally and will expire after two weeks (unless specific "clear" command is made).

By dracking or clicking a marker to a saved list it is possible to export a page of all the 
selected training times and locations with static maps.
Perhaps these pages can then be hard linked...

CONTRIBUTOR VIEW
- Logged in people
- Insert/modify/delete

Can create the following rows:
- Location
- Training
- Person

User level is defined with a matrix build of the following:
- ART
- geographical area
- insert (with moderation)
- modify
- delete


*/
require './config.php';
session_start();
header('Content-type: text/html; charset=utf-8');

// white: 2.5% gray
// red: AA0000

/**
 * Colors are got from the image "juga-in-midair.png"
 */
$colors = array(
	'white' => '#FFFFFF',
	'grey' => '#9C9BA1',
	'light_green' => '#95AB60',
	'dark_green' => '#29411B'
);


function scriptElement($src)
{
	if (substr($src, 0, 4) != 'http')
	{
		$src = '/js/' . $src;
	}
	return '<script type="text/javascript" src="' . $src . '"></script>';
}
function linkElement($href, $rel)
{
	if (substr($href, -3) == 'css')
	{
		$rel = '/js/' . $src;
	}
	return '<link ';
}

$linkfiles = array(
);
$javascript = array(
	'http://maps.google.com/maps/api/js?v=3.1&amp;sensor=false&amp;language=ja',
	'jquery-1.4.2.min.js',
	'jquery.timepicker.js',
	'jquery.clockpick.1.2.7.js',
	'jquery.inputnotes-0.6.js',
	'jquery.json-2.2.js',
	'jstorage.js',
	'jquery.curvycorners.js',
	'jquery.autoSuggest.js',
	'jquery.simplemodal-1.3.5.js',
	'renshuusurutoki.js',
);


?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<title><?php echo $cf['title']; ?></title>
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
	<link rel="icon" type="image/ico" href="/favicon.ico" />
	<link type="text/css" href="/css/renshuu/jquery-ui-1.8.2.custom.css" rel="stylesheet" />
	<link type="text/css" href="/css/main.css" rel="stylesheet" />
	<link type="text/css" href="/css/autoSuggest.css" rel="stylesheet" />
	<link type="text/css" href="/css/jquery.clockpick.1.2.7.css" rel="stylesheet" />
	<?php
	foreach($css as $cs)
	{
		echo linkElement($cs);
	}
	foreach($javascript as $js)
	{
		echo scriptElement($js);
	}
	?>
	<script type="text/javascript">
		
	</script>
</head>
<?php
// Fetch all data to be used in the forms.
$arts = $persons = array();
$art_options = $person_options = '';

$sql = 'SELECT id, name FROM ren_art ORDER BY name';
$run =  $link->query($sql);
while($res = $run->fetch(PDO::FETCH_ASSOC)) 
{	
	$arts[$res['id']] = $res['name'];
	$art_options .= '<option value="' . $res['id'] . '">' . $res['name'] . '</option>';
}

$sql = 'SELECT id, name FROM ren_person ORDER BY name';
$run =  $link->query($sql);
while($res = $run->fetch(PDO::FETCH_ASSOC)) 
{	
	$persons[$res['id']] = $res['name'];
	$person_options .= '<option value="' . $res['id'] . '">' . $res['name'] . '</option>';
}
?>
<body>
	<div id="wrap">
		<div id="map" class="ui-widget-content">Google Maps V3</div>
		<div id="list">
			<p><a href="#" id="new_location">Create a new location</a></p>
			<ul>
			<?php
			$sql = 'SELECT id, name FROM ren_area ORDER BY name';
			$run =  $link->query($sql);
			while($res = $run->fetch(PDO::FETCH_ASSOC)) 
			{	
				echo '<li><a href="#" title="' . $res['name'] . '" rev="' . $res['id'] . '">' . $res['name'] . '</a></li>';
			}
			?>
			</ul>
		</div>
	</div>
</body>
<?php

// Close the SQLite connection
$link = null;

?>
<script type="text/javascript">
/*
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-2643697-11']);
	_gaq.push(['_trackPageview']);

	(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
*/
</script>
</html>