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

