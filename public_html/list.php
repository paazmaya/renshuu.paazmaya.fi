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

// Local javascript files should reside in public_html/js/..
$javascript = array(
	'jquery.js', // 1.4.2
	'jquery.ui.core.js', // 1.8.2
	'jquery.ui.widget.js',
	'jquery.ui.tabs.js', // depends ui.core and ui.widget
	'ui.timepickr.js', // contains jquery.utils, jquery.strings
	'jquery.timepicker.js', //
	'jquery.cookie.js',
	'jquery.clockpick.1.2.7.js',
	'jquery.inputnotes-0.6.js',
	'jquery.json-2.2.js',
	'jstorage.js',
	'jquery.curvycorners.js',
	'jquery.autoSuggest.js',
	'jquery.simplemodal.js', // 1.3.5
	'jquery.ba-hashchange.js',
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

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<title><?php echo $cf['title']; ?></title>
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
	<link rel="icon" type="image/ico" href="/favicon.ico" />
	<link type="text/css" href=<?php echo '"/css/' . $cf['minified'] . $gzipped . '.css"'; ?> rel="stylesheet" />
	<?php
	/*
	<link type="text/css" href="/css/main.css" rel="stylesheet" />
	<link type="text/css" href="/css/autoSuggest.css" rel="stylesheet" />
	<link type="text/css" href="/css/renshuu/jquery-ui-1.8.2.custom.css" rel="stylesheet" />
	<link type="text/css" href="/css/jquery.clockpick.1.2.7.css" rel="stylesheet" />
	*/
	?>
</head>
<?php

?>
<body>
	<div id="wrap">
		<div id="left">
			<div id="mapping">
				<div class="header qr_training">
					<p><a href="#" rel="map">Training locations</a><span></span></p>
				</div>
				<div class="content">
					<div id="map" class="stuff">Google Maps V3</div>
				</div>
				<div class="header qr_street">
					<p><a href="#" rel="street">Street View</a><span><input type="checkbox" name="markerstreet" /> toggle SV</span></p>
				</div>
				<div class="content">
					<div id="street" class="stuff">Google Maps Street View</div>
				</div>
			</div>
		</div>

		<div id="right">
			<div>
				<div class="header qr_tools">
					<ul id="tabs">
						<li><a href="#filters" title="">filters</a></li>
						<li><a href="#location" title="">location</a></li>
						<li><a href="#art" title="">art</a></li>
						<li><a href="#profile" title="">profile</a></li>
						<li><a href="#login" title="">login</a></li>
					</ul>
				</div>
				<div class="content">
					<div class="stuff" id="tabcontent">
						
					</div>
				</div>
			</div>
		</div>

	</div>

	<div id="bottom">

	</div>

<?php
echo scriptElement('http://maps.google.com/maps/api/js?v=3.1&amp;sensor=false&amp;language=ja');
//echo scriptElement($cf['minified'] . $gzipped . '.js');

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
</body>
</html>
