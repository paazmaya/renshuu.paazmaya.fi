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


Access to any non / url will be checked against a weekday or an art string,
and in case matched, redirected to that prepended with a hash (#).

*/
require './config.php';
require './functions.php';
session_start();

// As per .htaccess, all requests are redirected to index.php with one GET variable.
if (isset($_GET['page']) && strlen($_GET['page']) > 0)
{
	$uri = '/#' . urize($_GET['page']);
	
	header('HTTP/1.1 301 Moved Permanently');
	header('Location: http://' . $_SERVER['HTTP_HOST'] . $uri);
	exit();
}


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
	'jquery.ba-hashchange.js',
	'renshuusurutoki.js'
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
	<link type="text/css" href="/css/main.css" rel="stylesheet" />
	<link type="text/css" href="/css/autoSuggest.css" rel="stylesheet" />
	<link type="text/css" href="/css/renshuu/jquery-ui-1.8.2.custom.css" rel="stylesheet" />
	<link type="text/css" href="/css/jquery.clockpick.1.2.7.css" rel="stylesheet" />
</head>
<?php

?>
<body>
	<div id="wrap" class="round">
		<div id="left">
			<div id="mapping">
				<div class="header qr_training">
					<p rel="map">Training locations</p>
				</div>
				<div class="content">
					<div id="map" class="stuff">Google Maps V3</div>
				</div>
				<div class="header qr_street">
					<p rel="street">Street View</p>
				</div>
				<div class="content">
					<div id="street" class="stuff">Google Maps Street View</div>
				</div>
			</div>
		</div>
		
		<div id="right">
			<div id="tools">
				<div class="header qr_tools">
					<p rel="tools">Tools</p>
				</div>
				<div class="content">
					<div class="stuff">
						<p><a href="#" id="new_location">Create a new location</a></p>
						<p><a href="#" id="post_data">Post data test</a></p>
					</div>
				</div>
			</div>			
			<div id="filters">
				<div class="header qr_arts">
					<p rel="arts">Martial Arts</p>
				</div>
				<div class="content">
					<div class="stuff">
						<p rel="arts">
							<a href="#" rel="all" title="Select all">Select all</a>
							<a href="#" rel="none" title="Select none">Select none</a>
							<a href="#" rel="inverse" title="Inverse selection">Inverse selection</a>
						</p>	
						<ul id="arts">
						<?php
						$sql = 'SELECT id, name FROM ren_art ORDER BY name';
						$run =  $link->query($sql);
						while($res = $run->fetch(PDO::FETCH_ASSOC)) 
						{	
							echo '<li><label><input type="checkbox" name="art_' . $res['id'] . '" /> ' . $res['name'] . '</label></li>';
						}
						?>
						</ul>
					</div>
				</div>
				
				<div class="header qr_weekdays">
					<p rel="weekdays">Weekdays</p>
				</div>
				<div class="content">
					<div class="stuff">
						<p rel="weekdays">
							<a href="#" rel="all" title="Select all">Select all</a>
							<a href="#" rel="none" title="Select none">Select none</a>
							<a href="#" rel="inverse" title="Inverse selection">Inverse selection</a>
						</p>
						<ul id="weekdays">
							<?php
							// Zero index Sunday.
							$weekdays = array('日', '月', '火', '水', '木', '金', '土'); // 曜日
							foreach($weekdays as $key => $val)
							{
								echo '<li><label><input type="checkbox" name="day_' . $key . '" checked="checked" /> ' . $val . '</label></li>';
							}
							?>
						</ul>
					</div>
				</div>

			</div>
		</div>
		
	</div>

	<div id="bottom" class="round">
		
	</div>
</body>

<?php
foreach($javascript as $js)
{
	echo scriptElement($js);
}

// Close the SQLite connection
$link = null;

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
</html>
