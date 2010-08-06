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
*			}
*		}
*	]
*
* In the other use cases of "get", when a keywork is used, the return value will be of 
* the following format:
*	[keyword, one of four]: [
*		{ id: 0, title: '' }
* 	]
*
* While in "form" mode, the output is a html string containing <form> 
* with all the requested components, in a "form" key.
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
session_start();
// http://marcgrabanski.com/articles/jquery-ajax-content-type
header('Content-type: application/json; charset=utf-8');


// Default output
$out = array(
	'error' => 'Parameters missing'
);

$page = ''; // get/set/form
$pages = array('get', 'set', 'form');

$pagetype = ''; // art/location/training/person
$pagetypes = array('art', 'location', 'training', 'person');

$id = 0;
$passcheck = false;
$loggedin = false;

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
		
		if ($count > 2 && in_array($parts['2'], $pagetypes))
		{
			$pagetype = $parts['2'];
			$passcheck = true;
		}
	}
	else
	{
		// We are in the harms way...
	}
}

if ($passcheck)
{
	// In get mode, the parametres should always be set, thus the limit can be set already here without a failsafe.
	if ($page == 'get' && $pagetype == '' && isset($_POST['area']) && is_array($_POST['area']) && isset($_POST['filter']) && is_array($_POST['filter']))
	{
		$ne_lat = 0;
		if (isset($_POST['area']['northeast']['0']) && is_numeric($_POST['area']['northeast']['0']))
		{
			$ne_lat = floatval($_POST['area']['northeast']['0']);
		}
		$ne_lng = 0;
		if (isset($_POST['area']['northeast']['1']) && is_numeric($_POST['area']['northeast']['1']))
		{
			$ne_lng = floatval($_POST['area']['northeast']['1']);
		}
		$sw_lat = 0;
		if (isset($_POST['area']['southwest']['0']) && is_numeric($_POST['area']['southwest']['0']))
		{
			$sw_lat = floatval($_POST['area']['southwest']['0']);
		}
		$sw_lng = 0;
		if (isset($_POST['area']['southwest']['1']) && is_numeric($_POST['area']['southwest']['1']))
		{
			$sw_lng = floatval($_POST['area']['southwest']['1']);
		}

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
		$from = 'FROM ren_training A LEFT JOIN ren_location B ON A.location = B.id LEFT JOIN ren_art C ON A.art = C.id';

		$sql = 'SELECT A.id AS trainingid, A.art AS artid, C.name AS artname, A.weekday, A.starttime, A.endtime, B.id AS locationid, B.latitude, B.longitude, B.name AS locationname, B.url, B.address ' . $from . ' WHERE ' . $position . $art . $weekday;
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
		$queries = array(
			'art' => 'SELECT id, name FROM ren_art ORDER BY name',
			'location' => 'SELECT id, name FROM ren_location ORDER BY name',
			'training' => 'SELECT id, name FROM ren_training ORDER BY name' . $where_art,
			'person' => 'SELECT id, name FROM ren_art ORDER BY name'
		);
		
		$sql = $queries[$pagetype];
		$results = array();
		$run =  $link->query($sql);
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
	else if ($page == 'set' && $loggedin)
	{
		// Data availalable is dependant of the form used
		// key in the form matches the value of the table row name
		$map = array(
			'art' => array(
				'title' => '',
				'uri' => ''
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
		// Each of the given tables have a field for modified time
		
		if (isset($_POST['update']) && is_numeric($_POST['update']))
		{
		}

		$out['result'] = array(
			'id' => $id,
			'title' => $title
		);
		unset($out['error']);
	}
	else if ($page == 'form')
	{
		$forms = array(
			'art' => array(
				'legend' => 'Art',
				'items' => array(
					array(
						'label' => 'Name',
						'type' => 'text',
						'name' => 'title',
						'class' => '',
						'disabled' => false
					),
					array(
						'label' => 'URI',
						'type' => 'text',
						'name' => 'uri',
						'class' => '',
						'disabled' => false
					)
				)
			),
			'location' => array(
				'legend' => 'Location',
				'items' => array(
					array(
						'label' => 'Title',
						'type' => 'text',
						'name' => 'title',
						'class' => '',
						'disabled' => false
					),
					array(
						'label' => 'URI',
						'type' => 'text',
						'name' => 'uri',
						'class' => '',
						'disabled' => false
					),
					array(
						'label' => 'Info',
						'type' => 'text',
						'name' => 'info',
						'class' => '',
						'disabled' => false
					),
					array(
						'label' => 'Address(if any)',
						'type' => 'text',
						'name' => 'address',
						'class' => '',
						'disabled' => false
					),
					array(
						'label' => 'Auto fill',
						'type' => 'checkbox',
						'name' => 'addr_autofill',
						'class' => '',
						'disabled' => false,
						'after' => ' (address from map position)'
					),
					array(
						'label' => 'Latitude',
						'type' => 'text',
						'name' => 'latitude',
						'class' => '',
						'disabled' => true
					),
					array(
						'label' => 'Longitude',
						'type' => 'text',
						'name' => 'longitude',
						'class' => '',
						'disabled' => true
					)
				)
			),
			'training' => array(
				'legend' => 'Training',
				'items' => array(
					array(
						'label' => 'Title',
						'type' => 'text',
						'name' => 'title',
						'class' => '',
						'disabled' => false
					),
					array(
						'label' => 'Location',
						'type' => 'text',
						'name' => 'location',
						'class' => '',
						'disabled' => false
					),
					array(
						'label' => 'Weekday',
						'type' => 'select',
						'name' => 'weekday',
						'class' => '',
						'disabled' => false,
						'options' => array()
					),
					array(
						'label' => 'Occurance',
						'type' => 'text',
						'name' => 'occurance',
						'class' => '',
						'disabled' => false
					),
					array(
						'label' => 'Start time',
						'type' => 'text',
						'name' => 'starttime',
						'class' => 'numeric',
						'disabled' => false
					),
					array(
						'label' => 'End time',
						'type' => 'text',
						'name' => 'endtime',
						'class' => 'numeric',
						'disabled' => false
					),
					array(
						'label' => 'Duration (minutes)',
						'type' => 'text',
						'name' => 'duration',
						'class' => 'numeric',
						'disabled' => true
					),
					array(
						'label' => 'Art',
						'type' => 'select',
						'name' => 'art',
						'class' => '',
						'disabled' => false,
						'options' => array()
					)
				)
			),
			'person' => array(
				'legend' => 'Person',
				'items' => array(
					array(
						'label' => 'Name',
						'type' => 'text',
						'name' => 'title',
						'class' => '',
						'disabled' => false
					),
					array(
						'label' => 'Art',
						'type' => 'text',
						'name' => 'art',
						'class' => '',
						'disabled' => false
					),
					array(
						'label' => 'Contact',
						'type' => 'text',
						'name' => 'contact',
						'class' => '',
						'disabled' => false
					),
					array(
						'label' => 'Info',
						'type' => 'text',
						'name' => 'info',
						'class' => '',
						'disabled' => false
					)
				)
			)
		);

		$out['form'] = createForm($pagetype, $forms[$pagetype]);
		unset($out['error']);
	}
}
else
{
	// Failed to pass the checks
	$out['errorInfo'] = 'Wrong line at the passport control';
}

/*
if ($page != '')
{
	$sql = '';
	$where = '';
	$order = '';
	unset($out['error']);
	if ($page == 'art')
	{
		$sql = 'SELECT * FROM ren_art';
		$order = ' ORDER BY name';
	}
	else if ($page = 'location')
	{
		$sql = 'SELECT * FROM ren_location';
		if ($id != 0)
		{
			$where = ' WHERE area = ' . $id;
		}
	}

	if ($sql != '')
	{
		$results = array();
		$run =  $link->query($sql . $where . $order);
		while($res = $run->fetch(PDO::FETCH_ASSOC))
		{
			$results[] = $res;
		}
		$out['result'] = $results;
	}
}
*/

$out['created'] = date($cf['datetime']);

//print_r($out);
echo json_encode(array('response' => $out));
