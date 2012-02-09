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
    const VERSION = '0.8.20120209';
	
	/**
	 * Domain for gettext
	 */
	const GT_DOMAIN = 'renshuuSuruToki';
	
	/**
	 * Configuration loaded from config.php
	 */
	public $config;
	
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
	function __construct($config)
	{
		$this->config = $config;
		$this->setupSession();
		$this->setupLocale();
		$this->setupPDO();
		
		$this->helper = new RenshuuHelper();
		
	}
	
	private function setupPDO()
	{
		
		// SQLite 3 via PDO
		// http://php.net/pdo
		try
		{
			$this->pdo = new PDO('sqlite:' . realpath($this->config['db']['address']));
			/*
			$this->pdo = new PDO(
				'mysql:dbname=' . $this->config['db']['database'] . ';host=' . $this->config['db']['address'] . ';port=' . $this->config['db']['port'] . ';charset=UTF-8',
				$this->config['db']['username'],
				$this->config['db']['password']
			);
			*/
			/*
			$this->pdo = new PDO(
				'pgsql:dbname=' . $this->config['db']['database'] . ';host=' . $this->config['db']['address'] . ';port=' . $this->config['db']['port'] . ';charset=UTF-8',
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
			!isset($_SESSION['userid']) || 
			!isset($_SESSION['username']) || 
			!isset($_SESSION['email']))
		{
			$_SESSION['lang'] = 'en';
			$_SESSION['access'] = 0;
			$_SESSION['browser'] = sha1($_SERVER['HTTP_USER_AGENT'] . session_id());
			$_SESSION['userid'] = 0;
			$_SESSION['username'] = '';
			$_SESSION['email'] = '';
		}
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