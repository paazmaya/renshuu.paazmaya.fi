<?php
/*******************
RENSHUU.PAAZMAYA.COM
http://creativecommons.org/licenses/by-nc-sa/3.0/
*******************/

/**
 * Plenty of functions for doing stuff that does not need any external info, except database
 */
class RenshuuHelper
{
	/**
	 * Shortcut to the database connection created in RenshuuBase
	 */
	public $pdo;
	
	/**
	 *
	 */
	function __construct()
	{
		// Nothing for now...
	}

	/**
	 * <nav><ul>
	 *   <li><a href="#location" title="">location</a></li>
	 *   <li><a href="#art" title="">art</a></li>
	 *   <li><a href="#profile" title="">profile</a></li>
	 *   <li><a href="#login" title="">login</a></li>
	 * </ul></nav>
	 *
	 * @param array $data = 'filters' => array(
	 * 		'title' => '',
	 * 		'text' => '',
	 * 		'image' => '',
	 * 		'access' => 0
	 * 	)
	 * @param int $access Current access level of the user, used as binary
	 * @return string As shown above
	 */
	public function createNavigation($data, $access = 0)
	{
		$out = '<nav><ul>';
		foreach($data as $key => $val)
		{
			if ($val['access'] & $access)
			{
				$out .= '<li><a href="#' . $key . '" title="' . $val['title'] . '">';
				$out .= '<img src="/img/bitcons/png/brown/32x32/' . $val['image'] . '" alt="' . $val['text'] . '" />';
				$out .= '</a></li>';
			}
		}
		$out .= '</ul></nav>';
		return $out;
	}

	/**
	 * Build an url for Google Static Maps.
	 * Defaults to: http://maps.google.com/maps/api/staticmap?sensor=false&maptype=roadmap&language=ja&format=png8&zoom=14&size=300x300&markers=color:0x55FF55|label:X|35.276556,136.252639
	 *
	 * @see http://code.google.com/apis/maps/documentation/staticmaps/
	 * @param array $items
	 * @return string URL
	 */
	public function createStaticMapUrl($items = null)
	{
		$out = 'http://maps.google.com/maps/api/staticmap?';
		$options = array(
			'maptype' => 'roadmap',
			'language' => 'ja',
			'format' => 'png8',
			'sensor' => 'false',
			//'center' => '0,0', // Marker will set the center anyhow..
			'zoom' => '14',
			'size' => '300x300',
			'markers' => 'color:0x55FF55|label:X|35.276556,136.252639' // hikone castle
		);

		// Just to avoid additional checking in the loop
		if (!isset($items))
		{
			$items = array();
		}

		$values = array();
		foreach($options as $key => $val)
		{
			if (isset($items[$key]) && $items[$key] != '')
			{
				$val = $items[$key];
			}
			$values[] = $key . '=' . $val;
		}
		$out .= implode('&amp;', $values); //htmlentities(, ENT_QUOTES, 'UTF-8');
		return $out;
	}

	/**
	 * Generates an css rule in a human readable format (minifier exists).
	 *
	 * @param string $selector .icon-add
	 * @param array $properties 'background-image' => 'url(/img/bitcons/png/green/16x16/add.png)'
	 * @return string .icon-add { background-image: url(/img/bitcons/png/green/16x16/add.png); }
	 */
	public function generateCssRule($selector, $properties)
	{
		$out = $selector . ' {' . "\n";
		foreach($properties as $key => $val)
		{
			$out .= "\t" . $key . ' : ' . $val . ';' . "\n";
		}
		$out .= '}' . "\n";
		return $out;
	}

	/**
	 * Generate the rules for icons.
	 *
	 * @param string $type bitcons or sanscons
	 * @param string $size 16x16, 32x32 or 64x64
	 * @param string $color blue, brown, cyan, green, magenta, orange, ...
	 * @param array $items [add, close, ...]
	 * @return string Long pile of rules prepended with "icon-"
	 */
	public function generateIconCssRules($type, $size, $color, $items)
	{
		$url = '/img/' . $type . '/png/' . $color . '/' . $size . '/';
		$out = '';
		$rules = array();

		foreach($items as $item)
		{
			$rules[] = $this->generateCssRule('.icon-' . $item, array('background-image' => 'url(' . $url . $item . '.png)'));
		}

		$out .= implode("\n", $rules);

		return $out;
	}


	/**
	 * Get an element to include the given javascript file eith from local "js" folder or if
	 * prepended with "http", from external source.
	 *
	 * @param	string	$src
	 * @return 	string
	 */
	public function scriptElement($src)
	{
		if (substr($src, 0, 4) != 'http')
		{
			$src = '/js/' . $src;
		}
		return '<script type="text/javascript" src="' . $src . '"></script>';
	}

	/**
	 * A form which is then send via AJAX back and forth between client and server.
	 *
	 * @param string $id
	 * @param array $data
	 * @param string $action
	 * @return string form element containing the requested inputs
	 * @see http://www.alistapart.com/articles/forward-thinking-form-validation/
	 */
	public function createForm($id, $data, $action = null)
	{
		if (!isset($id) || $id == '' || !isset($data) || !is_array($data))
		{
			return null;
		}

		if (!isset($action))
		{
			$action = '/ajax/set/' . $id;
		}

		$out = '<form id="' . $id . '_form" action="' . $action . '" method="post" data-ref="0" data-key="insert"';
		if (isset($data['enctype']) && $data['enctype'] != '')
		{
			$out .= ' enctype="' . $data['enctype'] . '"';
		}
		$out .= '>';
		
		$out .= '<fieldset>';
		if (isset($data['legend']) && $data['legend'] != '')
		{
			$out .= '<legend>' . $data['legend'] . '</legend>';
		}
		if (isset($data['info']) && $data['info'] != '')
		{
			$out .= '<p class="form-info">' . $data['info'] . '</p>';
		}

		$len = count($data['items']);
		for ($i = 0; $i < $len; $i++)
		{
			$item = $data['items'][$i];

			if ($item['type'] == 'radio')
			{
				$out .= '<p><span class="label"><span>' . $item['label'] . ':</span>';
				if (isset($item['options']) && is_array($item['options']) && count($item['options']) > 0)
				{
					$out .= '<span class="radioset">';
					foreach($item['options'] as $k => $v)
					{
						$out .= '<label><input type="radio" name="' . $item['name'] . '" value="' . $k . '" />' . $v . '</label>';
					}
					$out .= '';
				}
			}
			else if ($item['type'] == 'button')
			{
				$out .= '<p>';
				$out .= '<label><span>&nbsp;</span>';
				$out .= '<input class="button" type="button" name="' . $item['name'] . '" value="' . $item['label'] . '" />';
			}
			else
			{
				$out .= '<p><label><span>' . $item['label'] . ':</span>';
				if ($item['type'] == 'select')
				{
					$out .= '<select ';
				}
				else if ($item['type'] == 'textarea')
				{
					$out .= '<textarea ';
				}
				else
				{
					$out .= '<input type="' . $item['type'] . '" ';
				}
				$out .= 'name="' . $item['name'] . '"';

				if (isset($item['class']) && $item['class'] != '')
				{
					$out .= ' class="' . $item['class'] . '"';
				}
				
				if (isset($item['disabled']) && $item['disabled'])
				{
					$out .= ' disabled="disabled"';
				}

				// http://developers.whatwg.org/common-input-element-attributes.html#the-placeholder-attribute
				if (isset($item['placeholder']) && $item['placeholder'] != '')
				{
					$out .= ' placeholder="' . $item['placeholder'] . '"';
				}

				// http://developers.whatwg.org/common-input-element-attributes.html#attr-input-required
				if (isset($item['required']) && $item['required'])
				{
					$out .= ' required="required"';
				}
				
				if (isset($item['autofocus']) && $item['autofocus'])
				{
					$out .= ' autofocus="autofocus"';
				}

				if ($item['type'] == 'select')
				{
					$out .= '>';
					$out .= '<option value=""></option>'; // perhaps needs an option to be opt out?
					if (isset($item['options']))
					{
						if (is_array($item['options']) && count($item['options']) > 0)
						{
							foreach($item['options'] as $k => $v)
							{
								$out .= '<option value="' . $k . '">' . $v . '</option>';
							}
						}
						else if (is_string($item['options']) && strlen($item['options']) > 0)
						{
							$run = $this->pdo->query($item['options']);
							while ($res = $run->fetch(PDO::FETCH_NUM))
							{
								$out .= '<option value="' . $res['0'] . '">' . $res['1'] . '</option>';
							}
						}
					}
					$out .= '</select>';
				}
				else if ($item['type'] == 'textarea')
				{
					$out .= '>';

					if (isset($item['value']) && $item['value'] != '')
					{
						$out .= $item['value'];
					}
					$out .= '</textarea>';
				}
				else
				{
					if (isset($item['value']) && $item['value'] != '')
					{
						$out .= ' value="' . $item['value'] . '"';
					}
					
					if (isset($item['checked']) && $item['checked'])
					{
						$out .= ' checked="checked"';
					}
					
					// Remember to define the given listat the bottom
					if (isset($item['list']) && $item['list'] != '')
					{
						$out .= ' list="' . $item['list'] . '"';
					}
					$out .= ' />';
				}
			}

			if (isset($item['after']) && $item['after'] != '')
			{
				$out .= '<span class="after">' . $item['after'] . '</span>';
			}

			if ($item['type'] == 'radio')
			{
				$out .= '</span></p>';
			}
			else
			{
				$out .= '</label></p>';
			}
		}
		if (isset($data['lists']) && is_array($data['lists']))
		{
			foreach($data['lists'] as $k => $v)
			{
				$out .= '<datalist id="' . $k . '">';
				$run = $this->pdo->query($v);
				while ($res = $run->fetch(PDO::FETCH_NUM))
				{
					$out .= '<option value="' . $res['0'] . '" />';
				}
				$out .= '</datalist>';
			}
		}
		if (isset($data['buttons']) && is_array($data['buttons']))
		{
			$out .= '<p>';
			foreach($data['buttons'] as $button)
			{
				$out .= '<input class="button" type="' . $button['type'] . '" name="' . $button['name'] . '" value="' . $button['value'] . '" />';
			}
			$out .= '</p>';
		}
		if (isset($data['links']) && is_array($data['links']))
		{
			foreach($data['links'] as $k => $v)
			{
				$out .= '<p class="login login-' . $k . '"><a href="#' . $k . '" title="' . $v . '">' . $v . '</a></p>';
			}
		}
		$out .= '</fieldset></form>';

		return $out;
	}

	/**
	 * Create a table structure to be used for saving items from the map for later printing.
	 *
	 * <table summary="">
	 * 	<caption></caption>
	 * 	<thead>
	 * 		<tr>
	 * 			<th>Art</th>
	 * 			<th>Weekday</th>
	 * 			<th>Time</th>
	 * 		</tr>
	 * 	</thead>
	 * 	<tbody>
	 * 		<tr>
	 * 			<td></td>
	 * 		</td>
	 * 	</tbody>
	 * </table>
	 *
	 *
	 * @param array $data = array(
	 * 	'summary' => '',
	 * 	'caption' => '',
	 * 	'thead' => array (
	 * 		'art' => '',
	 * 		'weekday' => '',
	 * 		'time' => ''
	 * 	),
	 * 	'tfoot' => array(
	 * 	),
	 * 	'tbody' => array(
	 * 	)
	 * );
	 * @return string
	 */
	public function createTable($data)
	{
		$out = '<table';
		if (isset($data['id']) && $data['id'] != '')
		{
			$out .= ' id="' . $data['id'] . '"';
		}
		if (isset($data['class']) && $data['class'] != '')
		{
			$out .= ' class="' . $data['class'] . '"';
		}
		if (isset($data['summary']) && $data['summary'] != '')
		{
			$out .= ' summary="' . $data['summary'] . '"';
		}
		$out .= '>';
		if (isset($data['caption']) && $data['caption'] != '')
		{
			$out .= '<caption>' . $data['caption'] . '</caption>';
		}
		if (isset($data['thead']) && is_array($data['thead']))
		{
			$out .= '<thead><tr>';
			foreach ($data['thead'] as $td)
			{
				$out .= '<th title="' . $td . '">' . $td . '</th>';
			}
			$out .= '</tr></thead>';
		}
		if (isset($data['tfoot']) && is_array($data['tfoot']))
		{
			$out .= '<tfoot><tr>';
			foreach ($data['tfoot'] as $td)
			{
				$out .= '<td>' . $td . '</td>';
			}
			$out .= '</tr></tfoot>';
		}
		if (isset($data['tbody']) && is_array($data['tbody']))
		{
			$out .= '<tbody>';
			foreach ($data['tbody'] as $tr)
			{
				$out .= '<tr>';
				foreach ($tr as $td)
				{
					$out .= '<td>' . $td . '</td>';
				}
				$out .= '</tr>';
			}
			$out .= '</tbody>';
		}
		$out .= '</table>';

		return $out;
	}


	/**
	 * <p class="shortcuts arts">
	 * 	<a href="#all" title="Select all">Select all</a>
	 * 	<a href="#none" title="Select none">Select none</a>
	 * 	<a href="#inverse" title="Inverse selection">Inverse selection</a>
	 * </p>
	 * @param string $class shortcuts arts
	 * @param array $data = array(
	 * 		'all' => 'Select all'
	 * 		'none' => 'Select none'
	 * 		'inverse' => 'Inverse selection'
	 * 	)
	 * @return string
	 */
	public function createSelectionShortcuts($class, $data)
	{
		$out = '<p class="' . $class . '">';
		foreach ($data as $key => $val)
		{
			$out .= '<a href="#' . $key . '" title="' . $val . '">' . $val . '</a>';
		}
		$out .= '</p>';
		return $out;
	}

}
