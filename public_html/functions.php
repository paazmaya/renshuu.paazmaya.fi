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
