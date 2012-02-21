<?php
/*******************
RENSHUU.PAAZMAYA.COM
http://creativecommons.org/licenses/by-nc-sa/3.0/
*******************/
/**
* Possible commands as the first part of the url after "ajax":
* - get		Get public data while not logged in
* - set		Accessable only when logged in
* - keepalive	Used for keeping the session alive.
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
* Output JSON will contain "error" item in case such should have occurred.
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
* As for the "set" mode, the output is simply to return the id and the title
* for the data which was successfuly inserted. In any other case "error" will be present.
*	result: { id: 0, title: '', message: '' }
*
* In the case of an update, the "set" mode is used, where a post parametre will reveal
* the need for an update.
*	'update' => existing_id
*
*
* Weekdays are zero indexed, starting from Sunday as in the Japanese calendar.
*/

require 'RenshuuBase.php';

/**
 * Handle everything that is called via AJAX
 */
class RenshuuAjax extends RenshuuBase
{

	/**
	 * Default output
	 */
	private $out = array(
		'error' => 'Parameters missing'
	);

	/**
	 * One of the values available in $pages
	 */
	private $page = '';

	/**
	 * page must be one of these.
	 * /ajax/*
	 */
	private $pages = array(
		'get',
		'set',
		'keepalive'
	);

	/**
	 * art/location/training/person + profile
	 * Maybe one of the $pagetypes, if url is build that way.
	 */
	private $pagetype = '';

	/**
	 * Possible pagetypes for get and set.
	 * @example /ajax/get/art
	 * @example /ajax/set/savelist
	 */
	private $pagetypes = array(
		'art', 
		'location', 
		'training', 
		'person', 
		'profile',
		'savelist'
	);

	/**
	 * In case the $page is 'get', then there might come some filters in $posted.
	 */
	private $getfilter = '';

	/**
	 *
	 */
	function __construct($config, $lang)
	{
		parent::__construct($config, $lang);

		// http://marcgrabanski.com/articles/jquery-ajax-content-type
		header('Content-type: application/json; charset=utf-8');

		if ($this->config['isdevserver'])
		{
			$this->out['post'] = $this->posted;
			$this->out['get'] = $this->getted;
		}
		
		if ($_SESSION['access'] > 0)
		{
			if ($this->checkPage())
			{
				$this->createOutput();
			}
			else
			{
				// Failed to pass the checks
				$this->out['errorInfo'] = 'Wrong line at the passport control';
			}

			$this->out['type'] = $this->pagetype;
		}
		else
		{
			$this->out['errorInfo'] = 'Not logged in';
		}
		
		$this->out['created'] = date($this->config['datetime']);

		echo json_encode($this->out);

	}

	/**
	 * Check if the request makes sense and set properties of this call accordingly
	 */
	private function checkPage()
	{
		$passcheck = false;

		// This should always be set anyhow due to mod_rewrite...
		if (isset($this->getted['page']))
		{
			// parts must be: ajax, one of $pages [, one of $pagetypes ]
			$parts = explode('/', strtolower($this->getted['page']));
			$count = count($parts);
			
			if ($count > 1 && $parts['0'] = 'ajax' && in_array($parts['1'], $this->pages))
			{
				$this->page = $parts['1'];

				if ($this->page == 'get' || $this->page == 'keepalive')
				{
					$passcheck = true;
				}

				if ($count > 2 && in_array($parts['2'], $this->pagetypes))
				{
					$this->pagetype = $parts['2'];
					$passcheck = true;

					// Since here, should there be a keyword for filtering the results available?
					if ($this->page == 'get' && $count > 3)
					{
						$this->getfilter = trim($parts['3']);
					}
				}
			}
			else
			{
				// We are in the harms way...
			}
		}
		return $passcheck;
	}

	/**
	 *
	 */
	private function createOutput()
	{

		// Check for map boundaries, used in two place, for getting trainings and locations.
		$area_existed = false;
		if (isset($this->posted['area']) && is_array($this->posted['area']))
		{
			$area = array(
				'ne_lat' => 0,
				'ne_lng' => 0,
				'sw_lat' => 0,
				'sw_lng' => 0
			);

			if (isset($this->posted['area']['northeast']['0']) && is_numeric($this->posted['area']['northeast']['0']))
			{
				$area['ne_lat'] = floatval($this->posted['area']['northeast']['0']);
			}
			if (isset($this->posted['area']['northeast']['1']) && is_numeric($this->posted['area']['northeast']['1']))
			{
				$area['ne_lng'] = floatval($this->posted['area']['northeast']['1']);
			}
			if (isset($this->posted['area']['southwest']['0']) && is_numeric($this->posted['area']['southwest']['0']))
			{
				$area['sw_lat'] = floatval($this->posted['area']['southwest']['0']);
			}
			if (isset($this->posted['area']['southwest']['1']) && is_numeric($this->posted['area']['southwest']['1']))
			{
				$area['sw_lng'] = floatval($this->posted['area']['southwest']['1']);
			}
			$area_existed = true;
		}

		/*
		array(
			'get' => 'pageGetFilter',
			'get' => 'pageGetLocation',
			'get' => 'pageGet',
			'set' => 'pageSet',
			'keepalive' => 'pageKeepAlive'
		);
		*/
		// In get mode, the parametres should always be set, thus the limit can be set already here without a failsafe.
		if ($this->page == 'get' && $this->pagetype == '' && $area_existed && 
			isset($this->posted['filter']) && is_array($this->posted['filter']))
		{
			$this->pageGetFilter($area);
		}
		else if ($this->page == 'get' && $this->pagetype == 'location' && $area_existed)
		{
			$this->pageGetLocation($area);
		}
		else if ($this->pagetype == 'savelist')
		{
			// page can be set of get
			$this->pageSavelist();
		}		
		else if ($this->page == 'get' && $this->pagetype != '')
		{
			$this->pageGet();
		}
		else if ($this->page == 'set')
		{
			$this->pageSet();
		}
		else if ($this->page == 'keepalive')
		{
			$this->pageKeepAlive();
		}
	}
	
	/**
	 * 
	 */
	private function pageGetFilter($area)
	{
		$arts = array();
		if (isset($this->posted['filter']['arts']) && is_array($this->posted['filter']['arts']))
		{
			$arts = $this->posted['filter']['arts'];
		}

		$weekdays = array();
		if (isset($this->posted['filter']['weekdays']) && is_array($this->posted['filter']['weekdays']))
		{
			$weekdays = $this->posted['filter']['weekdays'];
		}

		$art = '';
		if (count($arts) > 0)
		{
			$art = ' AND A.art IN (' . implode(', ', $arts) . ')';
		}

		$weekday = '';
		if (count($weekdays) > 0)
		{
			$weekday = ' AND A.weekday IN (' . implode(', ', $weekdays) . ')';
		}

		$position = 'B.latitude > ' . $area['sw_lat'] . ' AND B.latitude < ' . $area['ne_lat'] .
			' AND B.longitude > ' . $area['sw_lng'] . ' AND B.longitude < ' . $area['ne_lng'];
		$from = 'FROM renshuu_training A LEFT JOIN renshuu_location B ON A.location = B.id
			LEFT JOIN renshuu_art C ON A.art = C.id
			LEFT JOIN renshuu_person D ON D.id = A.person';

		$sql = 'SELECT A.id AS trainingid, A.art AS artid, C.title AS artname, A.weekday, A.starttime, A.endtime,
			B.id AS locationid, B.latitude, B.longitude, B.title AS locationname, B.address,
			D.id AS personid, D.title AS personname, D.contact ' . $from . '
			WHERE ' . $position . $art . $weekday;
		$results = array();
		$run =  $this->pdo->query($sql);
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
						'address' => $res['address'],
					),
					'person' => array(
						'id' => $res['personid'],
						'title' => $res['personname'],
						'contact' => $res['contact']
					)
				);
			}
			unset($this->out['error']);
			$this->out['result'] = $results;
		}
		else
		{
			if ($this->config['isdevserver'])
			{
				$this->out['errorInfo'] = $this->pdo->errorInfo();
			}
		}
		if ($this->config['isdevserver'])
		{
			$this->out['sql'] = $sql;
		}
	}
	
	/**
	 * 
	 */
	private function pageGetLocation($area)
	{
		$position = 'B.latitude > ' . $area['sw_lat'] . ' AND B.latitude < ' . $area['ne_lat'] .
			' AND B.longitude > ' . $area['sw_lng'] . ' AND B.longitude < ' . $area['ne_lng'];
		$from = 'FROM renshuu_location B';

		$sql = 'SELECT B.id AS locationid, B.latitude, B.longitude, B.title AS locationname, ' .
			'B.address ' . $from . ' WHERE ' . $position;
		$results = array();
		$run =  $this->pdo->query($sql);
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
						'address' => $res['address'],
					)
				);
			}
			unset($this->out['error']);
			$this->out['result'] = $results;
		}
		else
		{
			if ($this->config['isdevserver'])
			{
				$this->out['errorInfo'] = $this->pdo->errorInfo();
			}
		}
		if ($this->config['isdevserver'])
		{
			$this->out['sql'] = $sql;
		}
	}
	
	/**
	 * Get or set training item to the saved list of the current user.
	 */
	private function pageSavelist()
	{
		// There must be posted training ID if page is "set"
		if ($this->page == 'set' && isset($this->posted['training']) && is_numeric($this->posted['training']) && isset($this->posted['action']))
		{
			$training = intval($this->posted['training']);
			$sql = '';
			
			// There also should be "action" which is either "save" or "delete"
			if ($this->posted['action'] == 'save')
			{
				$sql = 'INSERT INTO renshuu_list (user, training, added) VALUES (' .
					'(SELECT id FROM renshuu_user WHERE email = \'' . $_SESSION['email'] . '\'), ' . 
					$training . ', ' . time() . ')';
			}
			else if ($this->posted['action'] == 'delete')
			{
				$sql = 'DELETE FROM renshuu_list WHERE training = ' . $training . 
					' AND user = (SELECT id FROM renshuu_user WHERE email = \'' . $_SESSION['email'] . '\') LIMIT 1';
			}
			
			if ($sql != '')
			{
				$run = $this->pdo->query($sql);
				if ($run)
				{
					$this->out['affected'] = $run->rowCount();
				}
				else
				{
					if ($this->config['isdevserver'])
					{
						$this->out['errorInfo'] = $this->pdo->errorInfo();
					}
				}
			}
		}
		else if ($this->page == 'get')
		{
			// get the whole list of saved items
			/*
			<tr id="saved-{{=training.id}}">
				<td>{{=training.art.title}}</td>
				<td>{{=weekDay}}</td>
				<td>{{=training.starttime}} - {{=training.endtime}}</td>
				<td><a href="#remove-{{=training.id}}" title="##tmpl_removeitem## - {{=training.weekday}}">
					<img src="/img/sanscons/png/green/32x32/close.png" alt="##tmpl_removeitem##" />
				</a></td>
			</tr>
			*/
			$sql = 'SELECT T.*, A.title AS arttitle FROM renshuu_list L, renshuu_user U, renshuu_training T LEFT JOIN renshuu_art A ON T.art = A.id WHERE L.user = U.id AND U.email = \'' . 
				$_SESSION['email'] . '\' AND T.id = L.training ORDER BY L.added DESC';
			$run = $this->pdo->query($sql);
			if ($run)
			{
				$results = array();
				while($res = $run->fetch(PDO::FETCH_ASSOC))
				{
					$results[] = array(
						'training' => array(
							'id' => $res['id'],
							'art' => array(
								'title' => $res['arttitle'],
							),
							'starttime' => $res['starttime'],
							'endtime' => $res['endtime'],
							'weekday' => $res['weekday'],
						),
						'weekDay' => $this->lang['weekdays'][$res['weekday']]
					);
					
				}
				unset($this->out['error']);
				$this->out[$this->pagetype] = $results;
			}
			else
			{
				if ($this->config['isdevserver'])
				{
					$this->out['errorInfo'] = $this->pdo->errorInfo();
				}
			}
		}
		
		if ($this->config['isdevserver'])
		{
			$this->out['sql'] = $sql;
		}
	}
	
	/**
	 * 
	 */
	private function pageGet()
	{
		// If art id is not set, then fetch all the trainings...
		$where_art = '';
		if (isset($this->posted['art']) && is_numeric($this->posted['art']))
		{
			$where_art = ' WHERE art = ' . intval($this->posted['art']);
		}
		$queries = array(
			'art' => 'SELECT id, title FROM renshuu_art ORDER BY title',
			'location' => 'SELECT id, title FROM renshuu_location ORDER BY title',
			'training' => 'SELECT id, title FROM renshuu_training ORDER BY title' . $where_art,
			'person' => 'SELECT id, title FROM renshuu_person ORDER BY title'
		);

		$sql = $queries[$this->pagetype];
		$results = array();
		$run = $this->pdo->query($sql);
		if ($run)
		{
			while($res = $run->fetch(PDO::FETCH_ASSOC))
			{
				$results[] = array(
					'id' => $res['id'],
					'title' => $res['title']
				);
			}
			unset($this->out['error']);
			$this->out[$this->pagetype] = $results;
		}
		else
		{
			if ($this->config['isdevserver'])
			{
				$this->out['errorInfo'] = $this->pdo->errorInfo();
			}
		}
		if ($this->config['isdevserver'])
		{
			$this->out['sql'] = $sql;
		}
	}
	
	/**
	 * 
	 */
	private function pageSet()
	{
		// Data availalable is dependant of the form used
		// Key in the form matches the value of the table row name.
		// The object named after the $this->pagetype should include the data that is to be updated.
		// Keys should match the ones used in $map below, available in $this->posted['items'] as an array.
		$map = array(
			'art' => array(
				'title',
				'url'
			),
			'location' => array(
				'title',
				'info',
				'address',
				'latitude',
				'longitude'
			),
			'training' => array(
				'location',
				'art',
				'weekday',
				'occurance',
				'starttime',
				'endtime'
			),
			'person' => array(
				'title',
				'art',
				'contact',
				'info',
			),
			'profile' => array(
				'email',
				'password'
			)
		);
		$always = $map[$this->pagetype];
		
		// Are all the posted keys set which are needed for that type?
		$trimmed = array();
		$missing = array();
		foreach($always as $item)
		{
			if (isset($this->posted['items'][$item]))
			{
				$trimmed[$item] = $this->posted['items'][$item];
			}
			else
			{
				$missing[] = $item;
			}
		}
		if (!isset($this->posted['update']) && !isset($this->posted['insert']))
		{
			$missing[] = 'main parametre';
		}

		if (count($missing) == 0)
		{
			$sql = '';
			$message = '';

			// Each of the given tables have a field for modified time
			$trimmed['modified'] = time();
			$keys = implode(', ', array_keys($trimmed));
			$values = '\'' . implode('\', \'', array_values($trimmed)) . '\'';			

			// This should include the id of that item which is currently being updated.
			if (isset($this->posted['update']) && is_numeric($this->posted['update']))
			{
				$id = intval($this->posted['update']);

				$sets = array();
				foreach($trimmed as $key => $val)
				{
					$sets[] = $key . ' = \'' . $val . '\'';
				}

				// http://sqlite.org/lang_update.html
				$sql = 'UPDATE renshuu_' . $this->pagetype . ' SET ' . implode(', ', $sets) . ' WHERE id = ' . $id;
				$message = 'Given ' . $this->pagetype . ' updated...';
			}
			else if (isset($this->posted['insert']) && $this->posted['insert'] == '0')
			{
				// Value of "insert" should be 0

				// http://sqlite.org/lang_insert.html
				$sql = 'INSERT INTO renshuu_' . $this->pagetype . ' (' . $keys . ') VALUES (' . $values . ')';
				$message = 'New ' . $this->pagetype . ' created...';
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
			
			// For testing only...
			if ($this->config['isdevserver'])
			{
				$this->out['sql_build'] = array(
					'keys' => $keys,
					'values' => $values,
					'sql' => $sql
				);
			}

			if ($sql != '')
			{
				$affected = $this->pdo->exec($sql);
				$this->out['errorInfo'] = $this->pdo->errorInfo();

				if (isset($this->posted['insert']))
				{
					try
					{
						$id = $this->pdo->lastInsertId();
					}
					catch (PDOException $error)
					{
						$this->out['errorInfo'] = $this->pdo->errorInfo();
					}
				}
				
				$title = '';
				switch ($this->pagetype)
				{
					case 'training': $title = $trimmed['art'] . ' - ' . $trimmed['weekday']; break; // TODO: these are IDs...
					case 'person': 
					case 'location': 
					case 'profile': 
					case 'art': $title = $trimmed['title']; break;
				}

				$this->out['result'] = array(
					'id' => $id,
					'title' => $title,
					'message' => $message
				);
				unset($this->out['error']);
			}
		}
		else
		{
			$this->out['error'] = 'Missing: ' . implode(', ', $missing);
		}
	}
	
	
	/**
	 * 
	 */
	private function pageKeepAlive()
	{
		$this->out['keepalive'] = time();
		unset($this->out['error']);
	}
}

