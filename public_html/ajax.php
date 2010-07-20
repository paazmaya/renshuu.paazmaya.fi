<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/
/**
* Possible commands:
* - get
* - set.
*
* Possible parametres:
* - location
* - art
* - training
* - person
* - ...
*
* Output should always be of the following form:
*	response: [
*		{
			id: int
			title: string
		}
*	]
*	error: string, if any
*/

require_once './config.php';
session_start();
// http://marcgrabanski.com/articles/jquery-ajax-content-type
header('Content-type: application/json; charset=utf-8');


// Default output
$out = array(
	'error' => 'Parameters missing'
);
$page = '';
$id = 0;

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
//print_r($out);
echo json_encode($out);
