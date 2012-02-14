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


$renshuu = new RenshuuSuruToki($cf, $lang);
$renshuu->htmlDir = __DIR__;
$renshuu->lang = $lang;
echo $renshuu->createHead();
echo $renshuu->createBodyLoggedin();


// -----
/*
echo '<pre>SESSION ';
print_r($_SESSION);
echo '</pre>';
*/
// -----



	/**
	 * 
	 */
	function pageForm()
	{
		
		// $this->lang['forms'] variable available in the translations_xx.php,
		// $this->lang['weekdays'] too..

		$data = $this->lang['forms'][$this->pagetype];
		$items = array();
		foreach($data['items'] as $item)
		{
			if ($item['type'] == 'select')
			{
				if ($item['name'] == 'weekday')
				{
					$item['options'] = $this->lang['weekdays'];
				}
				else if ($item['name'] == 'art')
				{
					$results = array();
					$sql = 'SELECT id, name FROM renshuu_art ORDER BY name ASC';
					$run =  $this->pdo->query($sql);
					if ($run)
					{
						while($res = $run->fetch(PDO::FETCH_ASSOC))
						{
							$results[$res['id']] = $res['name'];
						}
					}
					$item['options'] = $results;
				}
			}
			$items[] = $item;
		}
		
		$data['items'] = $items;

		$action = null;
		if ($this->pagetype == 'login')
		{
			$action = '/login';
		}
		$this->out['form'] = $this->helper->createForm($this->pagetype, $data, $action);
	}
