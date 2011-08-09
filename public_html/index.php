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

All data fetched from the backend will be cached locally and will expire after two weeks (unless specific "clear" command is made)...

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

// Remove www from the url and redirect.
if (substr($_SERVER['HTTP_HOST'], 0, 3) == 'www')
{
	$go = 'http://' . substr($_SERVER['HTTP_HOST'], 4) . $_SERVER['REQUEST_URI'];
	header('HTTP/1.1 301 Moved Permanently');
	header('Location: ' . $go);
	exit();
}

// Clear out of the session ids.
if (isset($getted['RE']))
{
	$uri = preg_replace('/?RE=[^&]+/', '', $_SERVER['REQUEST_URI']);
	$uri = preg_replace('/&RE=[^&]+/', '', $uri);
	header('HTTP/1.1 301 Moved Permanently');
	header('Location: http://' . $_SERVER['HTTP_HOST'] . $uri);
	exit();
}

// As per .htaccess, all requests are redirected to index.php with one GET variable.
if (isset($getted['page']) && strlen($getted['page']) > 0)
{
	$uri = '';
	$getted['page'] = strtolower($getted['page']);

	// Try to login or logout the user if so requested
	if ($getted['page'] == 'login')
	{
		// How much is 2 + 3 --> answer
		if (isset($posted['email']) && $posted['email'] != '' && isset($posted['password']) && $posted['password'] != '' && isset($posted['answer']) && is_numeric($posted['answer']) && intval($posted['answer']) == 5)
		{
			$sql = 'SELECT id, name, email, access FROM ren_user WHERE email = \'' . $posted['email'] . '\' AND password = \'' . sha1($posted['password']) . '\' AND access > 0';
			$run = $link->query($sql);
			if ($run->columnCount() > 0)
			{
				$res = $run->fetch(PDO::FETCH_ASSOC);
				$_SESSION['userid'] = intval($res['id']);
				$_SESSION['email'] = $res['email'];
				$_SESSION['username'] = $res['name'];
				$_SESSION['access'] = intval($res['access']);

				$uri = '/#user';
			}
			else
			{
				$uri = '/#login';
			}
		}
	}
	else if ($getted['page'] == 'logout')
	{
		session_destroy();
	}
	else if (strlen($getted['page']) == 2 && array_key_exists($getted['page'], $cf['languages']))
	{
		$_SESSION['lang'] = $getted['page'];
		$uri = '/';
	}
	else
	{
		$uri = '/#' . urize($getted['page']);
		header('HTTP/1.1 301 Moved Permanently');
	}
	//print_r($getted);
	//print_r($posted);
	header('Location: http://' . $_SERVER['HTTP_HOST'] . $uri);
	exit();
}

// Using gettext for further localisation.
require './locale.php';

header('Content-type: text/html; charset=utf-8');

// Local javascript files should reside in public_html/js/..
$javascript = array(
	'jquery.js', // 1.6.2 (2011-06-30), http://jquery.com/
	
	'jquery.tmpl.js', // 1.0.0pre (2011-06-10), https://github.com/jquery/jquery-tmpl
	'jquery.datalink.js', // 1.0.0pre (2011-06-01), https://github.com/jquery/jquery-datalink
	
	'jquery.ui.core.js', // 1.8.15 (2011-08-08), http://jqueryui.com/
	'jquery.ui.widget.js',
	'jquery.ui.mouse.js', // depends ui.widget
	'jquery.ui.resizable.js', // depends ui.core, ui.mouse and ui.widget
	'jquery.ui.datepicker.js', // depends ui.core
	'jquery.ui.tabs.js', // depends ui.core and ui.widget
	
	'ui.timepickr.js', // contains jquery.utils, jquery.strings
	'jquery.timepicker.js', // 
	'jquery-ui-timepicker-addon.js', // 0.9.6 (2011-07-20), http://trentrichardson.com/examples/timepicker/
	'jquery.cookie.js', // (2011-07-08), https://github.com/carhartl/jquery-cookie/
	'jquery.clockpick.js', // 1.2.9 (2011-01-09), http://www.jnathanson.com/index.cfm?page=jquery/clockpick/ClockPick
	'jquery.inputnotes-0.6.js', // 0.6 ()
	'jquery.json-2.2.js', // ()
	'jstorage.js', // ()
	//'jquery.simplemodal.js', // 1.4.1 (2010-11-05), http://www.ericmmartin.com/projects/simplemodal/
	'jquery.gomap.js', // 1.3.2 (2011-07-01), http://www.pittss.lv/jquery/gomap/
	'jquery.hotkeys.js', // 0.8 (2010-03-10), https://github.com/tzuryby/jquery.hotkeys
	'jquery.corner.js', // 2.12 (2011-05-23), http://jquery.malsup.com/corner/
	'jquery.form.js', // 2.83 (2011-07-11), http://malsup.com/jquery/form/
	'jquery.autoSuggest.js', // 1.4 (2010-03-23), http://code.drewwilson.com/entry/autosuggest-jquery-plugin
	'jquery.blockUI.js', // 2.39 (2011-05-23), http://malsup.com/jquery/block/
	'jquery.ba-hashchange.js', // 1.3 (2010-07-21), http://benalman.com/projects/jquery-hashchange-plugin/
	'jquery.clickoutside.js', // (2010-02-17), http://www.stoimen.com/blog/2010/02/17/clickoutside-jquery-plugin/
	'renshuusurutoki.js'
);


// What should be done is to create one javascript file of the local files and minify it followed by gzipping.
//minify('js', $javascript);

// Same thing for cascaded style sheet, in public_html/css/..
minify('css', array(
	'main.css',
	'autoSuggest.css',
	'jquery.clockpick.css',
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

// http://ogp.me/
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:og="http://ogp.me/ns#" xml:lang="en" lang="en">
<head>
	<title><?php echo $cf['title'] . ' | ' . $lang['title']; ?></title>
	<meta name="description" content="<?php echo $lang['description']; ?>" />
	<meta name="viewport" content="initial-scale=1.0, maximum-scale=1, user-scalable=no, width=device-width" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta property="og:type" content="sport" />
	<link rel="author" href="http://paazio.nanbudo.fi" />
	<link rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/" />
	<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
	<link rel="icon" type="image/ico" href="/favicon.ico" />
	<link type="text/css" href=<?php echo '"/css/' . $cf['minified'] . $gzipped . '.css"'; ?> rel="stylesheet" />
	<link type="text/css" href=<?php echo '"/css/iconset-' . $cf['iconset'] . '.css"'; ?> rel="stylesheet" />

	<script id="savedTemplate" type="text/x-jquery-tmpl">
		<tr rel="{{id}">
			<td>{{artTitle}</td>
			<td>{{weekDay}}/td>
			<td>{{startTime}} - {{endTime}}/td>
			<td><a href="#remove-{{id}}" rel="remove" title="{{removeTitle}} - {{weekDayInt}}">
				<img src="/img/sanscons/png/green/32x32/close.png" alt="{{removeTitle}}" />
			</a></td>
		</tr>
	</script>
		
	<script id="feedbackTemplate" type="text/x-jquery-tmpl">
		<h1 title="{{message}}">{{message}}</h1>
		{{if title}}
			<p>{{title}}</p>
		{{/if}}
		<p>
			<a href="#insert-0" rel="clear" title="{{$.renshuu.lang.form.createnew}}">
				{{$.renshuu.lang.form.createnew}} / {{$.renshuu.lang.form.clear}}
			</a>
		</p>
		<p>
			<a href="#update-{{id}}" rel="keep" title="{{$.renshuu.lang.form.modify}}">
				{{$.renshuu.lang.form.modify}}
			</a>
		</p>
	</script>
	
	<script id="modalTemplate" type="text/x-jquery-tmpl">
		<div class="modal-info vevent">
			{{if artId && artTitle}}
				<h2 class="summary" rel="art-{{artId}}">
					<a href="#training-{{ trainingId}}" class="modal-close uid icon-close" title="{{artTitle}}">{{artTitle}}</a>
				</h2>
			{{/if}}
			{{if weekDay}}
				<p class="modal-time" rel="training-{{trainingId}}">{{weekDay}}
				{{if trainingStime && trainingEtime}}
					<span class="dtstart" title="{{trainingStime}}">{{trainingStime}}</span>
					-<span class="dtend" title="{{trainingEtime}}">{{trainingEtime}}</span>
				{{/if}}
				</p>
			{{/if}}
			{{if personId && personTitle}}
				<p class="modal-contact" rel="person-{{personId}}">{{personTitle}}
				{{if personContact}}
					 ( {{personContact}})
				{{/if}}
				</p>
			{{/if}}
			{{if locationId && locationTitle}}
				<p class="modal-location" rel="location-{{locationId}}">{{locationTitle}}
				{{if locationUrl}}
					<a href="{{locationUrl}}" title="{{locationTitle}}"> {{locationUrl}}</a>
				{{/if}}
				</p>
			{{/if}}
			{{if locationLat && locationLng}}
				<address class="geo">
					{{if locationAddr}}
						{{locationAddr}}
					{{/if}}
					<span>
						<abbr class="latitude" title="{{locationLat}}">$.renshuu.data.deg2dms(locationLat, true)</abbr>
						<abbr class="longitude" title="{{locationLng}}">$.renshuu.data.deg2dms(locationLng, false)</abbr>
					</span>
				</address>
			{{/if}}
			{{if trainingId}}
				<p class="modal-tools">
					<a href="#training-{{trainingId}}" title="{{langSave}}" rel="savetolist">{{langSave}}</a>
					<a href="#training-{{trainingId}}" title="{{langRemove}}" rel="removefromlist" style="display:none;">{{langRemove}}</a>
				</p>
			{{/if}}
		</div>
	</script>

</head>
<?php

?>
<body>
	<div id="wrap">
		<div id="left" class="left-side">
			<div id="mapping">
				<div class="header icon icon-tools">
					<p><a href="#" rel="map"><?php echo gettext('Training locations'); ?></a><span></span></p>
				</div>
				<div class="content">
					<div id="map" class="stuff">Google Maps V3</div>
				</div>
				<div class="header icon icon-search">
					<p><a href="#" rel="street"><?php echo gettext('Street View'); ?></a>
						<span>
							<label><input type="checkbox" name="markerstreet" /> <?php echo gettext('toggle SV'); ?></label>
						</span>
					</p>
				</div>
				<div class="content">
					<div id="street" class="stuff">Google Maps Street View</div>
				</div>
				<div class="header icon icon-calendar">
					<p><a href="#" rel="savedlist"><?php echo gettext('Saved list'); ?></a><span></span></p>
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
					echo createNavigation($lang['navigation'], $_SESSION['access']);
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
					<p><a href="#" rel="export"><?php echo gettext('Export settings'); ?></a><span></span></p>
				</div>
				<div class="content">
					<div id="export" class="stuff">
						<?php
						// export settings. will require to login for remembering them
						echo createForm('export', $lang['forms']['export']);

						$staticmap = createStaticMapUrl(); // using defaults
						?>
						<p><img id="exportpreview" src="<?php echo $staticmap; ?>" alt="<?php echo gettext('Preview of the current settings affect on the resulting map'); ?>" /></p>
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
	$copyright = '<div id="copyright">
		<p><a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/deed.' . $_SESSION['lang'] . '"
			title="Creative Commons - Attribution-ShareAlike 3.0 Unported - License">' . gettext('License information') . '</a></p>
		<p>RenshuuSuruToki version ' . $cf['version'] . '</p>
		</div>';

	echo $copyright;


// -----
echo '<pre>SESSION ';
print_r($_SESSION);
echo '</pre>';
// -----

// http://code.google.com/apis/maps/documentation/javascript/basics.html#Versioning
echo scriptElement('http://maps.google.com/maps/api/js?v=' . $cf['gmapsver'] . '&amp;sensor=false&amp;language=' . $_SESSION['lang']);
//echo scriptElement($cf['minified'] . $gzipped . '.js');

foreach($javascript as $js)
{
	echo scriptElement($js);
}

// Add localisation to the date picker
echo scriptElement('jquery.ui.datepicker-' . ($_SESSION['lang'] == 'en' ? 'en-GB' : $_SESSION['lang']) . '.js');

// Close the SQLite connection
$link = null;

// Translations and user data if any...
echo '<script type="text/javascript">' . "\n";
echo '$(document).ready(function() {' . "\n";
echo ' $.renshuu.locale = "' . $cf['languages'][$_SESSION['lang']] . '";' . "\n";

// Translations based on the current locale
$jslang = array(
	'license' => gettext('License information'),
	'form' => array(
		'createnew' => gettext('Create new'),
		'clear' => gettext('Clear'),
		'modify' => gettext('Modify current'),
		'sending' => gettext('Sending data')
	),
	'list' => array(
		'removeitem' => gettext('Remove this item from the list')
	),
	'modal' => array(
		//'' => gettext(''),
		'savetolist' => gettext(' Save to list'),
		'removefromlist' => gettext('Remove from list')
	),
	'suggest' => array(
		//'' => gettext(''),
		//'' => gettext(''),
		'art' => gettext('Type an art name'),
		'location' => gettext('Type a location name')
	),
	'validate' => array(
		//'' => gettext(''),
		'requiredfield' => gettext('This field is required!'),
		'minlength' => gettext('Minimum password length is 5 characters')
	)
);
echo ' $.renshuu.lang = ' . json_encode($jslang) . ';' . "\n"; // JSON_FORCE_OBJECT

// List weekdays. Sunday is at 0 index
echo ' $.renshuu.weekdays = ' . json_encode($lang['weekdays']) . ';' . "\n";

// User specific data in case they would be logged in. Used for prefilling the forms.
echo ' $.renshuu.userData = {';
echo '  loggedIn: ' . ($_SESSION['access'] > 0 ? 'true' : 'false') . ',';
echo '  name: "' . $_SESSION['username'] . '",';
echo '  email: "' . $_SESSION['email'] . '"';
echo ' };' . "\n";

// Now that the final variables have been set, it is ok to initiate the site.
echo ' $.renshuu.ready();' . "\n";

// http://twitter.com/#!/cowboy/status/42753115878989824
//echo ' (function n(e){e.eq(0).fadeIn(99,function(){n(e.slice(1))})})($(":visible").hide()) ' . "\n";

echo '});' . "\n";
echo '</script>';



// Templating available onwards from jQuery 1.4.3
// http://api.jquery.com/jquery.tmpl/
// http://www.slideshare.net/garann/using-templates-to-achieve-awesomer-architecture
// http://www.borismoore.com/2010/10/jquery-templates-is-now-official-jquery.html
/*
var t = $('#tmpl-t1').html();
// Compile a template
var tmpl = _.template(t);
// render it
tmpl({data: {title : 'Ralph Smells'}});
*/
?>
<script type="text/html" id="tmpl-t1">
	<h1>${data.title}</h1>
	{{if data.item}}
		// hoplaa
	{{else}}
		// kukkuu
	{{/if}}
</script>
<?php

if (!$cf['isdevserver'])
{
	?>
	<script type="text/javascript">
		var _gaq = _gaq || [];
		_gaq.push(['_setAccount', 'UA-2643697-11']);
		_gaq.push(['_setDomainName', 'renshuu.paazmaya.com']);
		_gaq.push(['_trackPageview']);

		(function() {
			var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			//ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			ga.src = 'http://www.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		})();

		// http://cookbooks.adobe.com/post_How_to_use_Google_Analytics_in_Flash_the_easy_way_-18254.html
		function gaTrack(trackName) {
			_gaq.push(['_trackPageview', trackName]);
		}
		function gaTrackEvent(cat, act, id) {
			_gaq.push(['_trackEvent', cat, act, id]);
		}
	</script>
	<?php
}
?>
</body>
</html>
