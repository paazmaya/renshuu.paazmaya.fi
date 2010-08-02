<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/
/**
* Possible commands as the first part of the url after "ajax":
* - get
* - set
* - form.
*
* Possible GET parametres:
* - location
* - art
* - training
* - person
* - ...
*
* Possible POST parametres in get mode, where arrays contain numerical data:
* - area { northeast [], southwest [] }
* - filter { arts [], weekdays [] }
*
* Weekdays zero indexed, starting from Sunday.
*
* Output should always be of the following form:
*	response: [
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
*	error: string, if any
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
		else if ($count > 2 && in_array($parts['2'], $pagetypes))
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
	if ($page == 'get' && isset($_POST['area']) && is_array($_POST['area']) && isset($_POST['filter']) && is_array($_POST['filter']))
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
	else if ($page == 'set')
	{
		// Data availalable is dependant of the form used
		$map = array(
			'art' => array(
			),
			'location' => array(
			),
			'training' => array(
			),
			'person' => array(
			)
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

//print_r($out);
echo json_encode(array('response' => $out));
