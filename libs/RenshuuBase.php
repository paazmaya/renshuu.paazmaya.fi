<?php
/*******************
RENSHUU.PAAZMAYA.COM
http://creativecommons.org/licenses/by-nc-sa/3.0/
*******************/

require 'RenshuuHelper.php';


/**
 * All the other Renshuu classed should extend this one.
 */
class RenshuuBase
{
    /**
     * What is the version of this class?
     */
    const VERSION = '0.8.20120221';
	
	/**
	 * Domain for gettext
	 */
	const GT_DOMAIN = 'renshuuSuruToki';
	
	/**
	 * Configuration loaded from config.php
	 */
	public $config;

	/**
	 * Translated language arrays
	 */
	public $lang;
	
	/**
	 * Database connection, initiated in constructor.
	 */
	public $pdo;
	
	/**
	 * Cleaned version of $_GET
	 */
	public $getted;	
	
	/**
	 * Cleaned version of $_POST
	 */
	public $posted;
	
	/**
	 * Instance of RenshuuHelper.
	 */
	public $helper;

	/**
	 * Constructor takes care of having database connection available
	 */
	function __construct($config, $lang)
	{
		$this->config = $config;
		$this->lang = $lang;
		
		$this->setupSession();
		$this->setupLocale();
		$this->setupPDO();
		
		// Clean the possible incoming data.
		if (isset($_GET) && is_array($_GET))
		{
			$this->getted = $this->cleanerlady($_GET);
		}
		// Same for post.
		if (isset($_POST) && is_array($_POST))
		{
			$this->posted = $this->cleanerlady($_POST);
		}
		
		$this->helper = new RenshuuHelper();
		$this->helper->pdo = $this->pdo;
	}

	/**
	 * Encode HTML entities for a block of text
	 *
	 * @param	string	$str
	 * @return	string
	 */
	public function htmlenc($str)
	{
		return htmlentities(trim($str), ENT_QUOTES, 'UTF-8');
	}

	/**
	 * Decode HTML entities from a block of text
	 *
	 * @param	string	$str
	 * @return	string
	 */
	public function htmldec($str)
	{
		return html_entity_decode(trim($str), ENT_QUOTES, 'UTF-8');
	}

	/**
	 * A function for get/post variables cleanup
	 * 
	 * INPUT_GET, INPUT_POST, INPUT_COOKIE, INPUT_SERVER, or INPUT_ENV
	 * filter_input_array(); // should be used to sanitate the incoming data
	 *
	 * @param array $dirty
	 * @return array
	 */
	public function cleanerlady($dirty)
	{
		$clean = array();
		foreach ($dirty as $key => $val)
		{
			// Clean the key by taking white space out.
			$key = preg_replace('/\s/', '', $key);
			if (is_array($val))
			{
				$clean[$key] = $this->cleanerlady($val);
			}
			else
			{
				$clean[$key] = $this->htmlenc($val);
			}
		}
		return $clean;
	}

	/**
	 * Converts a block of text to be suitable for the use in URI.
	 *
	 * @param	string	$str
	 * @return string
	 */
	public function urize($str)
	{
		$str = mb_strtolower($str, 'UTF-8');
		$str = $this->htmldec($str);
		$str = str_replace(array(' ', ',', '@', '$', '/', '\\', '&', '!', '='), '-', $str);
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
	 * http://php.net/pdo
	 */
	private function setupPDO()
	{
		
		try
		{
			//$this->pdo = new PDO($this->config['db']['type'] . ':' . realpath($this->config['db']['address']));
			
			$this->pdo = new PDO(
				$this->config['db']['type'] . ':dbname=' . $this->config['db']['database'] . ';host=' . $this->config['db']['address'] . ';port=' . $this->config['db']['port'],
				$this->config['db']['username'],
				$this->config['db']['password'],
				array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8')
			);
			
			/*
			$this->pdo = new PDO(
				'pgsql:dbname=' . $this->config['db']['database'] . ';host=' . $this->config['db']['address'] . ';port=' . $this->config['db']['port'] . ';charset=utf-8',
				$this->config['db']['username'],
				$this->config['db']['password']
			);
			*/
		}
		catch (PDOException $error)
		{
			exit('PDO Connection failed: ' . $error->getMessage());
		}
		$this->pdo->query('SET CHARACTER SET utf8');
		$this->pdo->query('SET NAMES utf8');

		/* ?
		SET NAMES utf8 COLLATE utf8_swedish_ci;
		SET CHARACTER SET utf8;
		*/
	}
	
	/**
	 * Check for session variables.
	 */
	private function setupSession()
	{
		session_name('RE');
		session_start();

		if (!isset($_SESSION['lang']) || 
			!array_key_exists($_SESSION['lang'], $this->config['languages']) ||
			!isset($_SESSION['access']) || 
			!isset($_SESSION['browser']) || 
			!isset($_SESSION['username']) || 
			!isset($_SESSION['email']))
		{
			$_SESSION['lang'] = 'en';
			$_SESSION['access'] = 0;
			$_SESSION['browser'] = sha1($_SERVER['HTTP_USER_AGENT'] . session_id());
			$_SESSION['username'] = '';
			$_SESSION['email'] = '';
		}
		
		
		// For testing purposes...
		$_SESSION['access'] = bindec(1111111111);
		$_SESSION['username'] = 'Juga Paazmaya';
		$_SESSION['email'] = 'olavic@gmail.com';
	}
	
	/**
	 * Translation is looking for in ../../locale/en/LC_MESSAGES/renshuuSuruToki.mo
	 */
	private function setupLocale()
	{
		
		// Gettext related settings.
		// http://php.net/manual/en/function.gettext.php
		$localisedlang = $this->config['languages'][$_SESSION['lang']] . '.UTF-8';
		putenv('LANGUAGE=' . $localisedlang);
		putenv('LC_ALL=' . $localisedlang);

		$locales = array(
			$this->config['languages'][$_SESSION['lang']] . '.UTF-8',
			$this->config['languages'][$_SESSION['lang']] . '.utf-8',
			$this->config['languages'][$_SESSION['lang']] . '.UTF8',
			$this->config['languages'][$_SESSION['lang']] . '.utf8',
			$this->config['languages'][$_SESSION['lang']] . '.ISO-8859-15',
			$this->config['languages'][$_SESSION['lang']] . '.iso-8859-15',
			$this->config['languages'][$_SESSION['lang']] . '.iso885915',
			$this->config['languages'][$_SESSION['lang']] . '.ISO-8859-1',
			$this->config['languages'][$_SESSION['lang']] . '.iso-8859-1',
			$this->config['languages'][$_SESSION['lang']] . '.iso88591',
			$this->config['languages'][$_SESSION['lang']],
			$_SESSION['lang']
		);
		setlocale(LC_ALL, $locales);
		bindtextdomain(self::GT_DOMAIN, realpath($this->config['localedir']));
		bind_textdomain_codeset(self::GT_DOMAIN, 'UTF-8');
		textdomain(self::GT_DOMAIN);
	}
	
	

}