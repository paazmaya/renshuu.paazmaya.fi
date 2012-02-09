<?php
/*******************
RENSHUU.PAAZMAYA.COM
http://creativecommons.org/licenses/by-nc-sa/3.0/
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
require '../libs/RenshuuSuruToki.php';
require './config.php';
require './locale.php';




$renshuu = new RenshuuSuruToki($cf);
$renshuu->htmlDir = __DIR__;
$renshuu->lang = $lang;
echo $renshuu->createHead();
echo $renshuu->createBody();

?>

	<?php


	/*
	<div id="bottom">
		<div class="left-side">
		</div>
		<div class="right-side">
		</div>
	</div>
	*/
	

	// http://www.w3.org/html/logo/#the-technology
	/*
	<a href="http://www.w3.org/html/logo/">
<img src="http://www.w3.org/html/logo/badge/html5-badge-h-css3-device-semantics-storage.png" width="229" height="64" alt="HTML5 Powered with CSS3 / Styling, Device Access, Semantics, and Offline &amp; Storage" title="HTML5 Powered with CSS3 / Styling, Device Access, Semantics, and Offline &amp; Storage">
</a>
*/

// -----
echo '<pre>SESSION ';
print_r($_SESSION);
echo '</pre>';
// -----



if (!$cf['isdevserver'])
{
	?>
	<script type="text/javascript">
		var _gaq = _gaq || [];
		_gaq.push(['_setAccount', 'UA-2643697-11']);
		_gaq.push(['_setSiteSpeedSampleRate', 10]);
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
