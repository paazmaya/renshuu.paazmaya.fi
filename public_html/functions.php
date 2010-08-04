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
function htmlent($str)
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
	$out = '<form id="' . $id . '_form" action="/' . $id . '" method="post">';
	$out .= '<fieldset><legend>' . $data['legend']. '</legend>';
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
	$out .= '<p><label><span>&nbsp;</span><input type="button" name="send" value="Send ' . $data['legend'] . '" />';
	$out .= '<input type="button" name="close" value="Close" class="modal_close" /></label></p>';
	$out .= '</fieldset></form>';
	
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
				
				echo "\n" . '<!-- src: ' . $src . ', des: ' . $des . ', minify: ' . $minify . ' -->' . "\n";
				
				$min = '';
				if (file_exists($des))
				{
					$mtime_des = filemtime($des);
					if ($mtime_src <= $mtime_des)
					{
						$minify = false;
						$min = file_get_contents($des);
						$mtime_newest = max($mtime_des, $mtime_newest);
					}
				}
				
				if ($minify)
				{
					$cont = file_get_contents($src);
					if ($type == 'js')
					{
						//$min = JSMin::minify($cont);
						$min = Minify_JS_ClosureCompiler::minify($cont); 
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
