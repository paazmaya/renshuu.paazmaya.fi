<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/
/**
* Possible commands as the first part of the url after "ajax":
* - get
* - set.
*
* Possible GET parametres:
* - location
* - art
* - training
* - person
* - ...
*
* Possible POST parametres, arrays contain numerical data:
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
$page = ''; // get/set
$id = 0;

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
	if ($count > 1 && $parts['0'] = 'ajax')
	{
		$page = $parts['1'];
		
		
		if ($count > 2 && is_numeric(end($parts)))
		{
			$id = intval(end($parts));
		}
	}
}

if ($page == 'get' && isset($_POST['area']) && is_array($_POST['area']) && isset($_POST['filter']) && is_array($_POST['filter']))
{
	$ne_lat = $_POST['area']['northeast']['0'];
	$ne_lng = $_POST['area']['northeast']['1'];
	$sw_lat = $_POST['area']['southwest']['0'];
	$sw_lng = $_POST['area']['southwest']['1'];
	
	$arts = $_POST['filter']['arts'];
	$weekdays = $_POST['filter']['weekdays'];
	
	$at = array();
	foreach($arts as $a) 
	{
		$at[] = 'A.art = ' . $a;
	}
	$art = '(' . implode(' OR ', $at) . ')';
	
	$wk = array();
	foreach($weekdays as $day) 
	{
		$wk[] = 'A.weekday = ' . $day;
	}
	$weekday = '(' . implode(' OR ', $wk) . ')';
	
	$position = 'B.latitude > ' . $sw_lat . ' AND B.latitude < ' . $ne_lat . ' AND B.longitude > ' . $sw_lng . ' AND B.longitude < ' . $ne_lng;
	$from = 'FROM ren_training A LEFT JOIN ren_location B ON A.location = B.id LEFT JOIN ren_art C ON A.art = C.id';

	$sql = 'SELECT A.id AS trainingid, A.art AS artid, C.name AS artname, A.weekday, A.starttime, A.endtime, B.id AS locationid, B.latitude, B.longitude, B.name AS locationname, B.url, B.address ' . $from . ' WHERE ' . $position . ' AND ' . $art . ' AND ' . $weekday;
	$response = array();
	$run =  $link->query($sql);
	if ($run) 
	{
		while($res = $run->fetch(PDO::FETCH_ASSOC)) 
		{	
			$response[] = array(
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
		$out['response'] = $response;
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
else if ($page == 'get')
{

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
		$response = array();
		$run =  $link->query($sql . $where . $order);
		while($res = $run->fetch(PDO::FETCH_ASSOC)) 
		{	
			$response[] = $res;
		}
		$out['response'] = $response;
	}
}
*/
//print_r($out);
echo json_encode($out);
