<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/

/**
 * Encode HTML entities for a block of text
 *
 * @param	string	$str
 * @return	string
 */
function htmlenc($str)
{
	return htmlentities(trim($str), ENT_QUOTES, 'UTF-8');
}

/**
 * Decode HTML entities from a block of text
 *
 * @param	string	$str
 * @return	string
 */
function htmldec($str)
{
	return html_entity_decode(trim($str), ENT_QUOTES, 'UTF-8');
}

/**
 * Converts a block of text to be suitable for the use in URI.
 *
 * @param	string	$str
 */
function urize($str)
{
	$str = mb_strtolower($str, 'UTF-8');
	$str = htmldec($str);
	$str = str_replace(array(' ', ',', '@', '$', '/', '&', '!', '='), '-', $str);
	$str = str_replace(array('--', '---'), '-', $str);
	// a...z = ASCII table values 97...122
	$str = str_replace(array('?', '"', '\'', ':', '(', ')', '*', '[', ']', '{', '}'), '', $str);
	$str = str_replace(array('ä', 'æ', 'å'), 'a', $str);
	$str = str_replace(array('ō', 'ö', 'ø'), 'o', $str);
	$str = str_replace(array('š', 'ß'), 's', $str);
	$str = str_replace(array('ć', 'č'), 'c', $str);
	$str = str_replace(array('ž'), 'z', $str);
	$str = str_replace(array('--', '---', '----'), '-', $str);
	$str = trim($str, ' -');
	return $str;
}


/**
 * Get an element to include the given javascript file eith from local "js" folder or if
 * prepended with "http", from external source.
 *
 * @param	string	$src
 * @return 	string
 */
function scriptElement($src)
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
 * @return string form element containing the requested inputs
 */
function createForm($id, $data)
{
	if (!isset($id) || $id == '' || !isset($data) || !is_array($data))
	{
		return null;
	}
	
	$out = '<form id="' . $id . '_form" action="/ajax/set/' . $id . '" method="post">';
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
		$out .= '<p><label><span>' . $item['label'] . ':</span>';
		
		if ($item['type'] == 'select')
		{
			$out .= '<select ';
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
		
		if ($item['type'] == 'select')
		{
			$out .= '>';
			if (isset($item['options']) && is_array($item['options']) && count($item['options']) > 0)
			{
				foreach($item['options'] as $k => $v)
				{
					$out .= '<option value="' . $k . '">' . $v . '</option>';
				}
			}
		}
		else 
		{
			if (isset($item['disabled']) && $item['disabled'])
			{
				$out .= ' disabled="disabled"';
			}
			$out .= ' />';
		}
		
		if (isset($item['after']) && $item['after'] != '')
		{
			$out .= $item['after'];
		}
		
		$out .= '</label></p>';
	}
	if (isset($data['buttons']) && is_array($data['buttons']))
	{
		$out .= '<p>';
		if (isset($data['buttons']['send']) && $data['buttons']['send'] != '')
		{
			$out .= '<input type="button" name="send" value="' . $data['buttons']['send'] . '" />';
		}
		if (isset($data['buttons']['close']) && $data['buttons']['close'] != '')
		{
			$out .= '<input type="button" name="close" value="' . $data['buttons']['close'] . '" class="modal_close" />';
		}
		$out .= '</p>';
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
 */
function createTable($data)
{
	$out = '<table';
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
			$out .= '<th>' . $td . '</th>';
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
		$out .= '<tbody><tr>';
		foreach ($data['tbody'] as $td)
		{
			$out .= '<td>' . $td . '</td>';
		}
		$out .= '</tr></tbody>';
	}
	$out .= '</table>';
		
	return $out;
}


/**
 * <p class="rel_weekdays">
 * 	<a href="#" rel="all" title="Select all">Select all</a>
 * 	<a href="#" rel="none" title="Select none">Select none</a>
 * 	<a href="#" rel="inverse" title="Inverse selection">Inverse selection</a>
 * </p>
 * @param string $class rel_weekdays
 * @param array $data = array(
		'all' => 'Select all'
		'none' => 'Select none'
		'inverse' => 'Inverse selection'
	)
 */
function createSelectionShortcuts($class, $data)
{
	$out = '<p class="' . $class . '">';
	foreach ($data as $key => $val)
	{
		$out .= '<a href="#" rel="' . $key . '" title="' . $val . '">' . $val . '</a>';
	}	
	$out .= '</p>';
	return $out;
}

/**
 * Combines and minifies the given local files.
 * That is if the resulting minified file does not exist yet, 
 * nor it is not older than any of the given files.
 *
 * @param string $type	Either js or css
 * @param array $files	List of files location in the public_html/[type]/ folder
 * @return boolean True if the resulting file was updated
 */
function minify($type, $files)
{	
	global $cf;
	
	// Are there newer source files than the single output file?
	$newerexists = false;
	
	// Return value will be this
	$wrote = false;
	
	// Function failed on a mismatching parametre?
	$fail = false;
	if ($type == 'js')
	{
		//require_once $cf['libdir'] . 'jsmin.php';
		require_once $cf['libdir'] . 'minify/Minify/JS/ClosureCompiler.php';
		
	}
	else if ($type == 'css')
	{
		require_once $cf['libdir'] . 'minify/Minify/CSS/Compressor.php';
	}
	else
	{
		$fail = true;
	}
	if (!is_array($files) || count($files) == 0)
	{
		$fail = true;
	}
	
	if (!$fail) 
	{		
		$data = array();
		$mtime_newest = 0;
		foreach($files as $file)
		{
			$src = realpath('./' . $type) . '/' . $file;
			if (file_exists($src))
			{
				$minify = true;
				$mtime_src = filemtime($src);
				$p = explode('.', $file);
				// Remove suffix temporarily for the ".min" check
				if (end($p) == $type)
				{
					unset($p[count($p) - 1]);
				}
				// If the filename has a ".min" appended in the end, its content is used as such.
				if (end($p) == 'min')
				{
					$des = $src;
					$minify = false;
				}
				else
				{
					// Rebuild the name by including ".min" in the end
					$p[] = 'min';
					$p[] = $type;
					$des = realpath('./' . $type) . '/' . implode('.', $p);
				}
				
				//echo "\n" . '<!-- src: ' . $src . ', des: ' . $des . ' -->' . "\n";
				
				$min = '';
				if (file_exists($des))
				{
					$mtime_des = filemtime($des);
					//echo '<!-- mtime_src: ' . $mtime_src . ', mtime_des: ' . $mtime_des . ' -->' . "\n";
					if ($mtime_src <= $mtime_des)
					{
						$minify = false;
						$min = file_get_contents($des);
						$mtime_newest = max($mtime_des, $mtime_newest);
					}
				}
				//echo '<!-- minify: ' . $minify . ' -->' . "\n";
				
				if ($minify)
				{
					$cont = file_get_contents($src);
					if ($type == 'js')
					{
						//$min = JSMin::minify($cont);
						try
						{
							$min = Minify_JS_ClosureCompiler::minify($cont); 
						}
						catch (Exception $error)
						{
							echo $error->getMessage() . ' while src: ' . $src;
						}
					}
					else if ($type == 'css')
					{
						$min = Minify_CSS_Compressor::process($cont); 
					}
					$mtime_newest = time();
					file_put_contents($des, $min);
				}
				$data[] = '/* ' . $file . ' */' . "\n" . $min;
			}
		}
		
		$outfile = realpath('./' . $type) . '/' . $cf['minified'] . '.' . $type;
		$outfilegz = realpath('./' . $type) . '/' . $cf['minified'] . '.gz.' . $type;
		if (file_exists($outfile))
		{
			$mtime_out = filemtime($outfile);
		}
		else 
		{
			$newerexists = true;
		}
		
		if ($newerexists || $mtime_newest > $mtime_out)
		{
			$alldata = implode("\n\n", $data);
			$bytecount = file_put_contents($outfile, $alldata);
		
			if ($bytecount !== false)
			{
				$gz = gzopen($outfilegz, 'wb9');
				gzwrite($gz, $alldata);
				gzclose($gz);
				$wrote = true;
			}
		}
	}
	
	return $wrote;
}
