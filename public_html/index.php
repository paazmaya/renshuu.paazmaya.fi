<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/

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
	<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false&amp;language=ja"></script>
	<script type="text/javascript" src="/js/jquery-1.4.2.min.js"></script>
	<script type="text/javascript" src="/js/jquery-ui-1.8.2.min.js"></script>
	<script type="text/javascript" src="/js/jquery.clickoutside.js"></script>
	<script type="text/javascript" src="/js/jquery.gomap-1.0.1.js"></script>
	<script type="text/javascript">
		var ajaxpoint = { get: '/ajax/get/', set: '/ajax/set/' };
		var map;
		var geocoder;
		
		// http://code.google.com/apis/maps/documentation/javascript/3.0/reference.html
		
		$(document).ready(function() {
			$("#map").goMap({ 
				scaleControl: true,
				maptype: 'ROADMAP',
				mapTypeControl: true, 
				mapTypeControlOptions: { 
					position: 'TOP_LEFT', 
					style: 'DROPDOWN_MENU' 
				},
				navigationControl: true, 
				navigationControlOptions: { 
					position: 'TOP_LEFT', 
					style: 'SMALL'
				} 
			}).resizable();
			
			$('#list li a').click(function() {
				var attr = { type: $(this).parent().attr('') };
				$.get(ajaxpoint.get + 'location/' + $(this).attr('rev'), attr, function(data, status) {
					var len = data.response.length;
					for (var i = 0; i < len; ++i) {
						var item = data.response[i];
						var icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + encodeURI(item.name.substr(0, 1)) + '|AA0000|FCFCFC&chof=png';
						console.log("icon: " + icon);						
						$.goMap.createMarker({  
							latitude: item.latitude, 
							longitude: item.longitude, 
							draggable: true,
							title: item.name,
							icon: icon,
							html: '<a href="' + item.url + '" title="' + item.name + '">' + item.url + '</a>'
						});
						
					}
				}, 'json');
				return false;				
			});
			
			$('#new_location').click(function() {
				createLocation();
				return false;
			});
		});
		
		function createLocation() {
			$('<div></div>').html('Select a position from the map by clicking it.').dialog({
				title: "Create a new location",
				width: 400,
				height: 300,
				buttons: {
					"Ok": function() {
						var location = {
							latitude: lat,
							longitude: lng
						};
						$.post(ajaxpoint.set + 'location', location, function (data, status) {
							$(this).dialog("close");
						}, 'json');
					}
				}
			});
			$.goMap.one('click', function(){
				// Create marker
				// Consecutive clicks move this marker to a new position
			});
		}
		
		/**
		* @param target The select element as jQuery object
		* @param type String defining the type of the data to be fetched
		*/
		function loadOptions(target, type) {
			var append = '';
			$.get(ajaxpoint.get + type, {}, function(data, status) {
				var len = data.response.length;
				for (var i = 0; i < len; ++i) {
					var item = data.response[i];
					append += '<' + 'option value="' + item.id + '">' + item.title + '<' + '/option>';
				}
				target.children('option').replace(append);
			});
		}
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
	<form id="location_form" action="/" style="display:none;">
		<p><label>Title: <input type="text" name="title" /></label></p>
		<p><label>URI: <input type="text" name="uri" /></label></p>
		<p><label>Info: <input type="text" name="info" /></label></p>
		<p><label>Address(if any): <input type="text" name="address" /></label></p>
		<p><label>Auto fill address from map position: <input type="checkbox" name="addr_autofill" /></label></p>
		<p><label>Latitude: <input type="text" name="latitude" /></label></p>
		<p><label>Longitude: <input type="text" name="longitude" /></label></p>
		<p><input type="button" name="send_location" value="Send location" /></p>
	</form>
	<form id="person_form" action="/" style="display:none;">
		<p><label>Name: <input type="text" name="title" /></label></p>
		<p><label>Art: <select name="art"></select></label></p>
		<p><label>Contact: <input type="text" name="contact" /></label></p>
		<p><label>Info: <input type="text" name="info" /></label></p>
		<p><input type="button" name="send_person" value="Send person" /></p>
	</form>
	<form id="art_form" action="/" style="display:none;">
		<p><label>Name: <input type="text" name="title" /></label></p>
		<p><label>URI: <input type="text" name="uri" /></label></p>
		<p><input type="button" name="send_art" value="Send art" /></p>
	</form>
	<form id="training_form" action="/" style="display:none;">
		<p><label>Title: <input type="text" name="title" /></label></p>
		<p><label>Location: <select name="location"></select></label></p>
		<p><label>Weekday: <select name="weekday"></select></label></p>
		<p><label>Occurance: <input type="text" name="occurance" /></label></p>
		<p><label>Start time: <input type="text" name="starttime" /></label></p>
		<p><label>Duration (minutes): <input type="text" name="duration" /></label></p>
		<p><label>Art: <select name="art"></select></label></p>
		<p><input type="button" name="send_training" value="Send training" /></p>
	</form>
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
