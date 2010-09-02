<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/
/**
* Possible commands as the first part of the url after "ajax":
* - get		Get public data while not logged in
* - set		Accessable only when logged in
* - form	Can be accessed anytime but useless if not logged in.
*
* In all of the cases, the keyword followed must be one of the following,
* if not "get" option:
* - art			A martial art
* - location	A location where martial arts can be practisted
* - training	A training time with a location and an art
* - person		A person who might be leading some martial art trainings.
*
* In the case of the first, "get", the POST parametres,
* where arrays contain numerical data, must be the following:
* - area { northeast [], southwest [] }
* - filter { arts [], weekdays [] }
* This is when there is no additional keywork in the url.
*
* Output JSON is always contained in a "response" array,
* which will contain "error" item in case such should have occurred.
*
* While responding to "get" mode request, the output is build as such:
*	result: [
*		{
*			training: {
*				id: 0,
*				art: {
*					id: 0,
*					title: ''
*				},
*				weekday: 0,
*				starttime: 0,
*				endtime: 0
*			}
*			location: {
*				id: 0,
*				latitude: 0.0,
*				longitude: 0.0,
*				title: '',
*				url: '',
*				address: ''
*			},
*			person: {
*				id: 0,
*				title: '',
*				contact: ''
*			}
*		}
*	]
*
* In the other use cases of "get", when a keyword is used, the return value will be of
* the following format. The results are filtered by a keyword as a last parametre in the url.
*	[keyword, one of four]: [
*		{ id: 0, title: '' }
* 	]
*
* Note that "get" and "location" with "area" in the POST will return a list of locations
* within the given boundaries.
*
* While in "form" mode, the output is a html string containing <form>
* with all the requested components, in a "form" key.
*
* Additional "form" options are: login and profile.
* Those two will use index.php directly as their counter parts, so there is no need 
* to set up an "set" options for them.
*
* As for the "set" mode, the output is simply to return the id and the title
* for the data which was successfuly inserted. In any other case "error" will be present.
*	result: { id: 0, title: '' }
*
* In the case of an update, the "set" mode is used, where a post parametre will reveal
* the need for an update.
*	'update' => existing_id
*
*
* Weekdays are zero indexed, starting from Sunday as in the Japanese calendar.
*/

require './config.php';
require './functions.php';

// require 'translations_' . $_SESSION['lang'] . '.php';
require './translations_en.php';


// http://marcgrabanski.com/articles/jquery-ajax-content-type
//header('Content-type: application/json; charset=utf-8');
header('Content-type: text/plain; charset=utf-8');


// Default output
$out = array(
	'error' => 'Parameters missing'
);

$page = ''; // get/set/form
$pages = array('get', 'set', 'form');

$pagetype = ''; // art/location/training/person + profile/login
$pagetypes = array('art', 'location', 'training', 'person', 'profile', 'login');

$getfilter = '';

$id = 0;
$passcheck = false;
$loggedin = true; // for testing...

if ($_SERVER['SERVER_NAME'] == '192.168.1.37')
{
	$out['post'] = $_POST;
	$out['get'] = $_GET;
}

// This should always be set anyhow due to mod_rewrite...
if (isset($_GET['page']))
{
	$parts = explode('/', strtolower($_GET['page']));
	$count = count($parts);
	if ($count > 1 && $parts['0'] = 'ajax' && in_array($parts['1'], $pages))
	{
		$page = $parts['1'];

		if ($page == 'get')
		{
			$passcheck = true;
		}
		
		if ($page != 'form')
		{
			// Remove "profile" and "login" options.
			array_splice($pagetypes, -2);
		}

		if ($count > 2 && in_array($parts['2'], $pagetypes))
		{
			$pagetype = $parts['2'];
			$passcheck = true;
			
			// Since here, should there be a keyword for filtering the results available?
			if ($page == 'get' && $count > 3) {
				$getfilter = trim($parts['3']);
			}
		}
	}
	else
	{
		// We are in the harms way...
	}
}

if ($passcheck)
{
	// Check for map boundaries, used in two place, for getting trainings and locations.
	$area_existed = false;
	if (isset($_POST['area']) && is_array($_POST['area']))
	{
		$ne_lat = 0;
		$ne_lng = 0;
		$sw_lat = 0;
		$sw_lng = 0;
		
		if (isset($_POST['area']['northeast']['0']) && is_numeric($_POST['area']['northeast']['0']))
		{
			$ne_lat = floatval($_POST['area']['northeast']['0']);
		}
		if (isset($_POST['area']['northeast']['1']) && is_numeric($_POST['area']['northeast']['1']))
		{
			$ne_lng = floatval($_POST['area']['northeast']['1']);
		}
		if (isset($_POST['area']['southwest']['0']) && is_numeric($_POST['area']['southwest']['0']))
		{
			$sw_lat = floatval($_POST['area']['southwest']['0']);
		}
		if (isset($_POST['area']['southwest']['1']) && is_numeric($_POST['area']['southwest']['1']))
		{
			$sw_lng = floatval($_POST['area']['southwest']['1']);
		}
		$area_existed = true;
	}
	
	// In get mode, the parametres should always be set, thus the limit can be set already here without a failsafe.
	if ($page == 'get' && $pagetype == '' && $area_existed && isset($_POST['filter']) && is_array($_POST['filter']))
	{
		$arts = array();
		if (isset($_POST['filter']['arts']) && is_array($_POST['filter']['arts']))
		{
			$arts = $_POST['filter']['arts'];
		}

		$weekdays = array();
		if (isset($_POST['filter']['weekdays']) && is_array($_POST['filter']['weekdays']))
		{
			$weekdays = $_POST['filter']['weekdays'];
		}
		
		$at = array();
		$art = '';
		if (count($arts) > 0)
		{
			foreach($arts as $a)
			{
				$at[] = 'A.art = ' . intval($a);
			}
			$art = ' AND (' . implode(' OR ', $at) . ')';
		}

		$wk = array();
		$weekday = '';
		if (count($weekdays) > 0)
		{
			foreach($weekdays as $day)
			{
				$wk[] = 'A.weekday = ' . intval($day);
			}
			$weekday = ' AND (' . implode(' OR ', $wk) . ')';
		}

		$position = 'B.latitude > ' . $sw_lat . ' AND B.latitude < ' . $ne_lat . ' AND B.longitude > ' . $sw_lng . ' AND B.longitude < ' . $ne_lng;
		$from = 'FROM ren_training A LEFT JOIN ren_location B ON A.location = B.id LEFT JOIN ren_art C ON A.art = C.id LEFT JOIN ren_person D ON D.id = A.person';

		$sql = 'SELECT A.id AS trainingid, A.art AS artid, C.name AS artname, A.weekday, A.starttime, A.endtime, B.id AS locationid, B.latitude, B.longitude, B.name AS locationname, B.url, B.address, D.id AS personid, D.name AS personname, D.contact ' . $from . ' WHERE ' . $position . $art . $weekday;
		$results = array();
		$run =  $link->query($sql);
		if ($run)
		{
			while($res = $run->fetch(PDO::FETCH_ASSOC))
			{
				$results[] = array(
					'training' => array(
						'id' => $res['trainingid'],
						'art' => array(
							'id' => $res['artid'],
							'title' => $res['artname']
						),
						'weekday' => $res['weekday'],
						'starttime' => $res['starttime'],
						'endtime' => $res['endtime'],
					),
					'location' => array(
						'id' => $res['locationid'],
						'latitude' => $res['latitude'],
						'longitude' => $res['longitude'],
						'title' => $res['locationname'],
						'url' => $res['url'],
						'address' => $res['address'],
					),
					'person' => array(
						'id' => $res['personid'],
						'title' => $res['personname'],
						'contact' => $res['contact']
					)
				);
			}
			unset($out['error']);
			$out['result'] = $results;
		}
		else
		{
			if ($_SERVER['SERVER_NAME'] == '192.168.1.37')
			{
				$out['errorInfo'] = $link->errorInfo();
			}
		}
		if ($_SERVER['SERVER_NAME'] == '192.168.1.37')
		{
			$out['sql'] = $sql;
		}
	}
	else if ($page == 'get' && $pagetype == 'location' && $area_existed)
	{
		$position = 'B.latitude > ' . $sw_lat . ' AND B.latitude < ' . $ne_lat . ' AND B.longitude > ' . $sw_lng . ' AND B.longitude < ' . $ne_lng;
		$from = 'FROM ren_location B';

		$sql = 'SELECT B.id AS locationid, B.latitude, B.longitude, B.name AS locationname, B.url, B.address ' . $from . ' WHERE ' . $position;
		$results = array();
		$run =  $link->query($sql);
		if ($run)
		{
			while($res = $run->fetch(PDO::FETCH_ASSOC))
			{
				$results[] = array(
					'location' => array(
						'id' => $res['locationid'],
						'latitude' => $res['latitude'],
						'longitude' => $res['longitude'],
						'title' => $res['locationname'],
						'url' => $res['url'],
						'address' => $res['address'],
					)
				);
			}
			unset($out['error']);
			$out['result'] = $results;
		}
		else
		{
			if ($_SERVER['SERVER_NAME'] == '192.168.1.37')
			{
				$out['errorInfo'] = $link->errorInfo();
			}
		}
		if ($_SERVER['SERVER_NAME'] == '192.168.1.37')
		{
			$out['sql'] = $sql;
		}
	}
	else if ($page == 'get' && $pagetype != '')
	{
		// If art id is not set, then fetch all the trainings...
		$where_art = '';
		if (isset($_POST['art']) && is_numeric($_POST['art']))
		{
			$where_art = ' WHERE art = ' . intval($_POST['art']);
		}
		$where_filter = '';
		if ($getfilter != '')
		{	
			$where_filter = 'name LIKE \'%' . $getfilter . '%\'';
		}
		$queries = array(
			'art' => 'SELECT id, name FROM ren_art ORDER BY name',
			'location' => 'SELECT id, name FROM ren_location ORDER BY name',
			'training' => 'SELECT id, name FROM ren_training ORDER BY name' . $where_art,
			'person' => 'SELECT id, name FROM ren_person ORDER BY name'
		);

		$sql = $queries[$pagetype];
		$results = array();
		$run = $link->query($sql);
		if ($run)
		{
			while($res = $run->fetch(PDO::FETCH_ASSOC))
			{
				$results[] = array(
					'id' => $res['id'],
					'title' => $res['name']
				);
			}
			unset($out['error']);
			$out[$pagetype] = $results;
		}
		else
		{
			if ($_SERVER['SERVER_NAME'] == '192.168.1.37')
			{
				$out['errorInfo'] = $link->errorInfo();
			}
		}
		if ($_SERVER['SERVER_NAME'] == '192.168.1.37')
		{
			$out['sql'] = $sql;
		}
	}
	else if ($page == 'set' && $loggedin) // login should not require to be logged in...
	{
		// Data availalable is dependant of the form used
		// Key in the form matches the value of the table row name.
		// The object named after the $pagetype should include the data that is to be updated.
		// Keys should match the ones used in $map below, available in $_POST['items'] as an array.
		$map = array(
			'art' => array(
				'title' => 'A.name',
				'uri' => 'A.uri'
			),
			'location' => array(
				'title' => '',
				'uri' => '',
				'info' => '',
				'address' => '',
				//'addr_autofill' => '',
				'latitude' => '',
				'longitude' => ''
			),
			'training' => array(
				'title' => '',
				'location' => '',
				'weekday' => '',
				'occurance' => '',
				'starttime' => '',
				'endtime' => '',
				//'duration' => '',
				'art' => ''
			),
			'person' => array(
				'title' => '',
				'art' => '',
				'contact' => '',
				'info' => '',
			)
		);
		// Are all the posted keys set which are needed for that type?
		$trimmed = array();
		$missing = array();
		foreach($map[$pagetype] as $key => $value)
		{
			if (isset($_POST['items'][$key]))
			{
				$trimmed[$key] = htmlenc($_POST['items'][$key]);
			}
			else
			{
				$missing[] = $key;
			}
		}
		if (!isset($_POST['update']) && !isset($_POST['insert']))
		{
			$missing[] = 'main parametre';
		}

		if (count($missing) == 0)
		{
			$sql = '';
			
			// Each of the given tables have a field for modified time
			$trimmed['modified'] = time();
			$keys = implode(', ', array_keys($trimmed));
			$values = '\'' . implode('\', \'', array_values($trimmed)) . '\'';
			
			// For testing only...
			$out['sql_build'] = array(
				'keys' => $keys,
				'values' => $values
			);
			
			// This should include the id of that item which is currently being updated.
			if (isset($_POST['update']) && is_numeric($_POST['update']))
			{
				$id = intval($_POST['update']);
				
				$sets = array();
				foreach($trimmed as $key => $val)
				{
					$sets[] = $key . ' = \'' . $val . '\'';
				}
				
				// http://sqlite.org/lang_update.html
				$sql = 'UPDATE ren_' . $pagetype . ' SET ' . implode(', ', $sets) . ' WHERE id = ' . $id;
			}
			else if (isset($_POST['insert']) && $_POST['insert'] == '0')
			{
				// Value of "insert" should be 0
				
				// http://sqlite.org/lang_insert.html
				$sql = 'INSERT INTO ren_' . $pagetype . ' (' . $keys . ') VALUES (' . $values . ')';
				/*
				Return Values
					If a sequence name was not specified for the name parameter, 
					PDO::lastInsertId() returns a string representing the row ID of 
					the last row that was inserted into the database. 
					
					If a sequence name was specified for the name parameter, PDO::lastInsertId() 
					returns a string representing the last value retrieved from the specified sequence object. 
					
					If the PDO driver does not support this capability, 
					PDO::lastInsertId() triggers an IM001 SQLSTATE. 
				*/
			}
			else
			{
				// Harms way...
			}
			
			if ($sql != '') 
			{
				$affected = $link->exec($sql);
				
				if (isset($_POST['insert']))
				{
					try 
					{
						$id = $link->lastInsertId('id'); // should the "id" be used here as a prametre
					}
					catch (PDOException $error)
					{
						$out['errorInfo'] = $link->errorInfo();
					}
				}
				
				$out['result'] = array(
					'id' => $id,
					'title' => $trimmed['title']
				);
				unset($out['error']);
			}
		}
		else 
		{
			$out['error'] = 'Missing: ' . implode(', ', $missing);
		}
	}
	else if ($page == 'form')
	{
		// $lang['forms'] variable available in the translations_xx.php,
		// $lang['weekdays'] too..
		
		$data = $lang['forms'][$pagetype];
		$items = array();
		foreach($data['items'] as $item)
		{
			if ($item['type'] == 'select')
			{
				if ($item['name'] == 'weekday')
				{
					$item['options'] = $lang['weekdays'];
				}
				else if ($item['name'] == 'art')
				{
					$results = array();
					$sql = 'SELECT id, name FROM ren_art ORDER BY name ASC';
					$run =  $link->query($sql);
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
		
		$out['form'] = createForm($pagetype, $data);
		unset($out['error']);
	}
}
else
{
	// Failed to pass the checks
	$out['errorInfo'] = 'Wrong line at the passport control';
}


$out['created'] = date($cf['datetime']);

//print_r($out);
echo json_encode(array('response' => $out));
