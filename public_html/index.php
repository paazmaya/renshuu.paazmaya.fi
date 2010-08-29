<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/
/*
Colors at Kuler: http://kuler.adobe.com/#themeID/979806

Light blue: 129EF7
Dark red: 5E0202
Yellow: B7B529
Blue: 034A77
Red: AA1515
White: F9FBF7
Black: 05050D
Grey: 67828A
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

// Local javascript files should reside in public_html/js/..
$javascript = array(
	'jquery.js', // 1.4.2
	'jquery.ui.core.js', // 1.8.2
	'jquery.ui.widget.js',
	'jquery.ui.tabs.js', // depends ui.core and ui.widget
	'ui.timepickr.js', // contains jquery.utils, jquery.strings
	'jquery.timepicker.js',
	'jquery.cookie.js', // 2006
	'jquery.clockpick.1.2.7.js',
	'jquery.inputnotes-0.6.js', // 0.6
	'jquery.json-2.2.js',
	'jstorage.js',
	'jquery.hotkeys.js', // 0.8 (2010-02-23)
	'jquery.corner.js', // 2.11 (15-JUN-2010)
	'jquery.form.js', // 2.45 (09-AUG-2010)
	'jquery.autoSuggest.js',
	'jquery.simplemodal.js', // 1.4 (2010-08-19)
	'jquery.ba-hashchange.js', // 1.3
	'renshuusurutoki.js'
);

// What should be done is to create one javascript file of the local files and minify it followed by gzipping.
//minify('js', $javascript);

// Same thing for cascaded style sheet, in public_html/css/..
minify('css', array(
	'main.css',
	'autoSuggest.css',
	'jquery.clockpick.1.2.7.css',
	'ui.timepickr.css'
));

// Append with gzip if supported.
$gzipped = ''; //'.gz';


// -----------------
// Create iconset css file
$iconcss = '@charset "UTF-8";' . "\n";
$iconcss .= '/*******************' . "\n";
$iconcss .= 'RENSHUU.PAAZMAYA.COM' . "\n";
$iconcss .= '*******************/' . "\n";
$iconcss .= '/*' . "\n";
$iconcss .= $cf['iconset'] . "\n";
$iconcss .= '*/' . "\n";
$iconcss .= generateCssRule('.icon', array(
	'background-repeat' => 'no-repeat',
	'background-attachment' => 'scroll',
	'background-position' => '1em center'
));

$items = array(
	'add', 'addressbook', 'alert', 'arrow1_se', 'arrow3_n', 'arrow3_s', 'calendar', 'cellphone', 'check', 
	'close', 'comment', 'denied', 'document', 'edit', 'equalizer', 'lock', 'loop', 'mail', 
	'newwindow', 'phone', 'reload', 'save', 'search', 'smirk', 'time', 'tools', 
	'trash', 'window', 'womanman', 'zoomin', 'zoomout'
);
$iconcss .= generateIconCssRules($cf['iconset'], '16x16', 'green', $items);

file_put_contents('css/iconset-' . $cf['iconset'] . '.css', $iconcss);

// -----------------

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<title><?php echo $cf['title']; ?></title>
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="author" href="http://paazio.nanbudo.fi" />
	<link rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/" />
	<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
	<link rel="icon" type="image/ico" href="/favicon.ico" />
	<link type="text/css" href=<?php echo '"/css/' . $cf['minified'] . $gzipped . '.css"'; ?> rel="stylesheet" />
	<link type="text/css" href=<?php echo '"/css/iconset-' . $cf['iconset'] . '.css"'; ?> rel="stylesheet" />
</head>
<?php

?>
<body>
	<div id="wrap">
		<div id="left" class="left-side">
			<div id="mapping">
				<div class="header icon icon-tools">
					<p><a href="#" rel="map"><?php echo $lang['index']['header']['map']; ?></a><span></span></p>
				</div>
				<div class="content">
					<div id="map" class="stuff">Google Maps V3</div>
				</div>
				<div class="header icon icon-search">
					<p><a href="#" rel="street"><?php echo $lang['index']['header']['streetview']; ?></a>
						<span>
							<label><input type="checkbox" name="markerstreet" /> toggle SV</label>
						</span>
					</p>
				</div>
				<div class="content">
					<div id="street" class="stuff">Google Maps Street View</div>
				</div>
				<div class="header icon icon-calendar">
					<p><a href="#" rel="savedlist"><?php echo $lang['index']['header']['savedlist']; ?></a><span></span></p>
				</div>
				<div class="content">
					<div id="savedlist" class="stuff">
						<?php
						echo createTable($lang['savedtable']);
						?>
					</div>
				</div>
			</div>
		</div>

		<div id="right" class="right-side">
			<div>
				<div class="header icon icon-equalizer">
					<?php
					// Navigation based on the current access level
					echo createNavigation($lang['navigation']);
					?>
				</div>
				<div class="content">
					<div class="stuff" id="tabcontent">
						<div id="filtering">
							<?php
							// <form name="filter_form" action="/ajax/get" method="post">
							echo createSelectionShortcuts('rel_arts', $lang['selectionshortcuts']);
							echo '<ul id="arts">';
							// Filter based on the user access if any...
							$sql = 'SELECT id, name FROM ren_art ORDER BY name';
							$run =  $link->query($sql);
							while($res = $run->fetch(PDO::FETCH_ASSOC))
							{
								echo '<li><label><input type="checkbox" name="art_' . $res['id'] . '" /> ' . $res['name'] . '</label></li>';
							}
							
							echo '</ul>';
							
							echo createSelectionShortcuts('rel_weekdays', $lang['selectionshortcuts']);
							echo '<ul id="weekdays">';
							// Zero index Sunday.
							foreach($lang['weekdays'] as $key => $val)
							{
								echo '<li title="' . $val . '"><label><input type="checkbox" name="day_' . $key . '" checked="checked" /> ' . $val . '</label></li>';
							}
							echo '</ul>';
							// </form>
							?>
						</div>
					</div>
				</div>
			</div>
			<div>
				<div class="header icon icon-edit">
					<p><a href="#" rel="export"><?php echo $lang['index']['header']['export']; ?></a><span></span></p>
				</div>
				<div class="content">
					<div id="export" class="stuff">
						<?php
						// export settings. will require to login for remembering them
						echo createForm('export', $lang['forms']['export']);
						
						$staticmap = createStaticMapUrl(); // using defaults
						?>
						<p><img id="exportpreview" src="<?php echo $staticmap; ?>" alt="Preview of the current settings affect on the resulting map" /></p>
					</div>
				</div>
			</div>
		</div>

	</div>

	<?php
	/*
	<div id="bottom">
		<div class="left-side">
		</div>
		<div class="right-side">
		</div>
	</div>
	*/
	?>
	
	<div id="copyright">
		<p><a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/deed.en" title="Creative Commons - Attribution-ShareAlike 3.0 Unported - License">License information</a></p>
	</div>

<?php
// Translations
echo '<script type="text/javascript">';

echo '</script>';


echo scriptElement('http://maps.google.com/maps/api/js?v=3.1&amp;sensor=false&amp;language=ja'); // $_SESSION['lang']
//echo scriptElement($cf['minified'] . $gzipped . '.js');

foreach($javascript as $js)
{
	echo scriptElement($js);
}

// Close the SQLite connection
$link = null;

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
