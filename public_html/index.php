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
require_once './config.php';
require_once './locale.php';
require_once $cf['libdir'] . 'RenshuuSuruToki.php';
require_once $cf['libdir'] . 'RenshuuAjax.php';


if (isset($_GET['page']) && substr($_GET['page'], 0, 4) == 'ajax')
{
	// Output is handled by the constructor.
	$ajax = new RenshuuAjax($cf, $lang);
}
else
{
	$renshuu = new RenshuuSuruToki($cf, $lang);
	$renshuu->htmlDir = __DIR__;
	$renshuu->templateDir = $cf['libdir'] . '/../templates' . '/';
	$renshuu->lang = $lang;
	echo $renshuu->createHead();
	if ($_SESSION['access'] > 0)
	{
		echo $renshuu->createBodyLoggedin();
	}
	else
	{
		echo $renshuu->createBodyPublic();
	}
}
	
// -----
/*
echo '<pre>SESSION ';
print_r($_SESSION);
echo '</pre>';
*/
// -----
