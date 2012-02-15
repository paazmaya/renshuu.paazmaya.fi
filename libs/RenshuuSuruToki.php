<?php
/*******************
RENSHUU.PAAZMAYA.COM
http://creativecommons.org/licenses/by-nc-sa/3.0/
*******************/

require 'RenshuuBase.php';

class RenshuuSuruToki extends RenshuuBase
{

	/**
	 * Local javascript files should reside in public_html/js/..
	 */
	public $scripts = array(
		'jquery.js', // 1.7.1 (2011-11-03), http://jquery.com/

		'jquery.tmpl.js', // 1.0.0pre (2011-06-10), https://github.com/jquery/jquery-tmpl
		'jquery.datalink.js', // 1.0.0pre (2011-06-01), https://github.com/jquery/jquery-datalink

		'jquery.ui.core.js', // 1.8.16 (2011-08-18), http://jqueryui.com/
		'jquery.ui.widget.js',
		'jquery.ui.position.js',
		'jquery.ui.datepicker.js', // depends ui.core
		'jquery.ui.mouse.js', // depends ui.widget
		'jquery.ui.tabs.js', // depends ui.core and ui.widget
		'jquery.ui.button.js', // depends ui.core and ui.widget
		'jquery.ui.draggable.js', // depends ui.core, ui.mouse and ui.widget
		'jquery.ui.resizable.js', // depends ui.core, ui.mouse and ui.widget
		'jquery.ui.dialog.js', // depends ui.core, ui.widget, ui.button, ui.draggable, ui.mouse, ui.position and ui.resizable

		'ui.timepickr.js', // contains jquery.utils, jquery.strings

		'jquery.outerhtml.js', //
		
		'jquery.timepicker.js', //
		'jquery-ui-timepicker-addon.js', // 0.9.6 (2011-07-20), http://trentrichardson.com/examples/timepicker/
		'jquery.clockpick.js', // 1.2.9 (2011-01-09), http://www.jnathanson.com/index.cfm?page=jquery/clockpick/ClockPick
		'jquery.inputnotes-0.6.js', // 0.6 ()
		
		'jquery.blockUI.js', // 2.39 (2011-05-23), http://malsup.com/jquery/block/
		
		'jquery.clickoutside.js', // (2010-02-17), http://www.stoimen.com/blog/2010/02/17/clickoutside-jquery-plugin/

		'renshuu-map.js',
		'renshuu-markers.js',
		'renshuu-forms.js',
		'renshuu-pins.js',
		'renshuu-export.js',
		'renshuu-main.js',
	);

	/**
	 * Stylesheets that should be in public_html/css/...
	 */
	public $styles = array(
		'common.css',
		//'public.css',
		'main.css',

		'jquery.ui.button.css',
		'jquery.ui.core.css',
		'jquery.ui.datepicker.css',
		'jquery.ui.dialog.css',
		'jquery.ui.rezisable.css',
		'jquery.ui.tabs.css',

		'jquery-ui-timepicker-addon.css',
		'jquery.clockpick.css',
		'ui.timepickr.css',
		'autoSuggest.css'
	);

	/**
	 * HTML5 templates are here
	 */
	public $templateDir;

	/**
	 * public_html
	 */
	public $htmlDir;

	/**
	 * Two character language code
	 */
	public $language = 'en';

	/**
	 *
	 */
	private $gzipped;

	/**
	 * Constructor takes care of having database connection available
	 */
	function __construct($config, $lang)
	{
		parent::__construct($config, $lang);

		header('Content-type: text/html; charset=utf-8');

		$this->templateDir = realpath(__DIR__ . '/../templates') . '/';

		$this->removeUnwantedUrl();


		// What should be done is to create one javascript file of the local files and minify it followed by gzipping.
		//$this->minify('js', $this->scripts);

		// Same thing for cascaded style sheet, in public_html/css/..
		//$this->minify('css', $this->styles);

		// Append with gzip if supported.
		$this->gzipped = ''; //'.gz';

		$this->handleUrl();
	}

	/**
	 * Remove unwanted items from the URL
	 */
	public function removeUnwantedUrl()
	{

		// Remove www from the url and redirect.
		if (substr($_SERVER['HTTP_HOST'], 0, 3) == 'www')
		{
			$go = 'http://' . substr($_SERVER['HTTP_HOST'], 4) . $_SERVER['REQUEST_URI'];
			header('HTTP/1.1 301 Moved Permanently');
			header('Location: ' . $go);
			exit();
		}

		// Clear out of the session ids.
		if (isset($getted['RE']))
		{
			$url = preg_replace('/?RE=[^&]+/', '', $_SERVER['REQUEST_URI']);
			$url = preg_replace('/&RE=[^&]+/', '', $url);
			header('HTTP/1.1 301 Moved Permanently');
			header('Location: http://' . $_SERVER['HTTP_HOST'] . $url);
			exit();
		}
	}

	/**
	 * Handle redirection of the given url.
	 */
	public function handleUrl()
	{

		// As per .htaccess, all requests are redirected to index.php with one GET variable.
		if (isset($this->getted['page']) && strlen($this->getted['page']) > 0)
		{
			$url = '';
			$getted['page'] = strtolower($this->getted['page']);

			// Try to login the user if so requested
			// TODO: OpenID
			if ($this->getted['page'] == 'login')
			{
				if (isset($this->posted['email']) && $this->posted['email'] != '' &&
					isset($this->posted['password']) && $this->posted['password'] != '')
				{
					$sql = 'SELECT id, name, email, access FROM renshuu_user WHERE email = \'' .
						$this->posted['email'] . '\' AND access > 0';
					$run = $this->pdo->query($sql);
					if ($run->columnCount() > 0)
					{
						$res = $run->fetch(PDO::FETCH_ASSOC);
						$_SESSION['userid'] = intval($res['id']);
						$_SESSION['email'] = $res['email'];
						$_SESSION['username'] = $res['name'];
						$_SESSION['access'] = intval($res['access']); // use as binary

						$url = '/#profile';
					}
					else
					{
						$url = '/#login';
					}
				}
			}
			else if (strlen($this->getted['page']) == 2 && array_key_exists($this->getted['page'], $this->config['languages']))
			{
				$_SESSION['lang'] = $this->getted['page'];
				$url = '/';
			}
			else
			{
				$url = '/#' . $this->urize($this->getted['page']);
				header('HTTP/1.1 301 Moved Permanently');
			}
			
			header('Location: http://' . $_SERVER['HTTP_HOST'] . $url);
			exit();
		}
	}

	/**
	 * Create HTML5 head with doctype etc from a template
	 */
	public function createHead()
	{
		$out = file_get_contents($this->templateDir . 'head.html');

		$stylesheetmain = '';
		foreach ($this->styles as $style)
		{
			$stylesheetmain .= '<link type="text/css" href="/css/' . $style . '" rel="stylesheet" />';
		}
		
		$list = array(
			'lang' => $this->language, // $_SESSION['lang']
			'title' => $this->config['title'] . ' | ' . $this->lang['title'],
			'description' => $this->lang['description'],
			//'stylesheetmain' => '/css/' . $this->config['minified'] . $this->gzipped . '.css',
			'stylesheetmain' => $stylesheetmain,
			'stylesheeticon' => '/css/iconset-' . $this->config['iconset'] . '.css',
		);

		//mixed str_replace ( mixed $needle , mixed $replace , mixed $haystack [, int &$count ] )
		foreach ($list as $key => $value)
		{
			$out = str_replace('##' . $key . '##', $value, $out);
		}

		return $out;
	}
	
	/**
	 * Create public HTML5 body from a template.
	 * #_# eguals a gettext call.
	 */
	public function createBodyPublic()
	{
		$out = file_get_contents($this->templateDir . 'body-public.html');
		
		$copyright = '<div id="copyright">
			<p><a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/deed.' . $_SESSION['lang'] . '"
				title="Creative Commons - Attribution-ShareAlike 3.0 Unported - License">' . gettext('License information') . '</a></p>
			<p>RenshuuSuruToki version ' . self::VERSION . '</p>
			</div>';

		$list = '<nav id="loginlist"><ul>';
		foreach ($this->lang['loginlist'] as $type => $item)
		{
			$list .= '<li>';
			$list .= '<a href="' . $item['href'] . '" title="' . $item['title'] . '" class="' . $type . '">';
			$list .= '<img src="/img/hand-drawn-social/' . $type . '-64x64.png" alt="' . $item['title'] . '" />';
			$list .= '</a>';
			$list .= '</li>';
		}
		$list .= '</ul></nav>';
		
		$list = array(
			'loginlist' => $list,
			'copyright' => $copyright
		);
		
		foreach ($list as $key => $value)
		{
			$out = str_replace('##' . $key . '##', $value, $out);
		}

		$out = preg_replace_callback(
			'/#_#(.*)#_#/',
			create_function(
				'$matches',
				'return gettext($matches[1]);'
			),
			$out
		);
		
		return $out;

	}

	/**
	 * Create HTML5 body from a template.
	 * #_# eguals a gettext call.
	 */
	public function createBodyLoggedin()
	{
		$out = file_get_contents($this->templateDir . 'body.html');

		$artlist = '<ul id="arts">';
		// Filter based on the user access if any...
		$sql = 'SELECT id, title FROM renshuu_art ORDER BY title';
		$run = $this->pdo->query($sql);
		while($res = $run->fetch(PDO::FETCH_ASSOC))
		{
			$artlist .= '<li><label><input type="checkbox" name="art_' . $res['id'] . '" /> ' . $res['title'] . '</label></li>';
		}
		$artlist .= '</ul>';

		$weekdaylist = '<ul>';
		// Zero index Sunday.
		foreach($this->lang['weekdays'] as $key => $val)
		{
			$weekdaylist .= '<li title="' . $val . '"><label><input type="checkbox" name="day_' . $key . '" checked="checked" /> ' . $val . '</label></li>';
		}
		$weekdaylist .= '</ul>';

		$copyright = '<div id="copyright">
			<p><a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/deed.' . $_SESSION['lang'] . '"
				title="Creative Commons - Attribution-ShareAlike 3.0 Unported - License">' . gettext('License information') . '</a></p>
			<p>RenshuuSuruToki version ' . self::VERSION . '</p>
			</div>';

		$list = array(
			'leftnavigation' => $this->helper->createNavigation($this->lang['navigation']['left'], $_SESSION['access']),
			'rightnavigation' => $this->helper->createNavigation($this->lang['navigation']['right'], $_SESSION['access']),
			'artshortcuts' => $this->helper->createSelectionShortcuts('rel_arts', $this->lang['selectionshortcuts']),
			'artlist' => $artlist,
			'weekdayshortcuts' => $this->helper->createSelectionShortcuts('rel_weekdays', $this->lang['selectionshortcuts']),
			'weekdaylist' => $weekdaylist,
			'exportform' => $this->helper->createForm('export', $this->lang['forms']['export']),
			'staticmap' => $this->helper->createStaticMapUrl(),
			'copyright' => $copyright,
			
			'saved_table' => $this->helper->createTable($this->lang['savedtable']),
			
			'form_training' => $this->helper->createForm('training', $this->lang['forms']['training']),
			'form_location' => $this->helper->createForm('location', $this->lang['forms']['location']),
			'form_art' => $this->helper->createForm('art', $this->lang['forms']['art']),
			'form_person' => $this->helper->createForm('person', $this->lang['forms']['person']),
			'form_profile' => $this->helper->createForm('profile', $this->lang['forms']['profile']),
		);

		foreach ($list as $key => $value)
		{
			$out = str_replace('##' . $key . '##', $value, $out);
		}

		$out = preg_replace_callback(
			'/#_#(.*)#_#/',
			create_function(
				'$matches',
				'return gettext($matches[1]);'
			),
			$out
		);

		// Javascript section

		// http://code.google.com/apis/maps/documentation/javascript/basics.html#Versioning
		$out .= $this->helper->scriptElement('http://maps.google.com/maps/api/js?v=' . $this->config['gmapsver'] . '&amp;sensor=false&amp;language=' . $_SESSION['lang']);
		//$out .= scriptElement($this->config['minified'] . $this->gzipped . '.js');

		foreach($this->scripts as $js)
		{
			$out .= $this->helper->scriptElement($js);
		}

		// Add localisation to the date picker
		$out .= $this->helper->scriptElement('jquery.ui.datepicker-' . ($_SESSION['lang'] == 'en' ? 'en-GB' : $_SESSION['lang']) . '.js');


		// Translations and user data if any...
		$out .= '<script type="text/javascript">' . "\n";
		$out .= '$(document).ready(function() {' . "\n";
		$out .= ' renshuuMain.locale = "' . $this->config['languages'][$_SESSION['lang']] . '";' . "\n";

		// Translations based on the current locale
		$jslang = array(
			'license' => gettext('License information'),
			'form' => array(
				'createnew' => gettext('Create new'),
				'clear' => gettext('Clear'),
				'modify' => gettext('Modify current'),
				'sending' => gettext('Sending data')
			),
			'list' => array(
				'removeitem' => gettext('Remove this item from the list')
			),
			'modal' => array(
				//'' => gettext(''),
				'savetolist' => gettext(' Save to list'),
				'removefromlist' => gettext('Remove from list')
			),
			'suggest' => array(
				//'' => gettext(''),
				//'' => gettext(''),
				'art' => gettext('Type an art name'),
				'location' => gettext('Type a location name')
			),
			'validate' => array(
				//'' => gettext(''),
				'requiredfield' => gettext('This field is required!'),
				'minlength' => gettext('Minimum password length is 5 characters')
			)
		);
		$out .= ' renshuuMain.lang = ' . json_encode($jslang) . ';' . "\n"; // JSON_FORCE_OBJECT

		// List weekday localisations. Sunday is at 0 index
		$out .= ' renshuuMain.weekdays = ' . json_encode($this->lang['weekdays']) . ';' . "\n";

		// User specific data in case they would be logged in. Used for prefilling the forms.
		$out .= ' renshuuMain.userData = {';
		$out .= '  loggedIn: ' . ($_SESSION['access'] > 1 ? 'true' : 'false') . ',';
		$out .= '  name: "' . $_SESSION['username'] . '",';
		$out .= '  email: "' . $_SESSION['email'] . '"';
		$out .= ' };' . "\n";

		// Now that the final variables have been set, it is ok to initiate the site.
		$out .= ' renshuuMain.ready();' . "\n";

		// http://twitter.com/#!/cowboy/status/42753115878989824
		//$out .= ' (function n(e){e.eq(0).fadeIn(99,function(){n(e.slice(1))})})($(":visible").hide()) ' . "\n";

		$out .= '});' . "\n";
		$out .= '</script>';

		// http://www.w3.org/html/logo/#the-technology
		/*
		$out .= '<a href="http://www.w3.org/html/logo/">';
		$out .= '<img src="http://www.w3.org/html/logo/badge/html5-badge-h-css3-device-semantics-storage.png" 
			width="229" height="64" alt="HTML5 Powered with CSS3 / Styling, Device Access, Semantics, and Offline
			&amp; Storage" title="HTML5 Powered with CSS3 / Styling, Device Access, Semantics, and Offline &amp; Storage">';
		$out .= '</a>';
		*/
	
		if (!$this->config['isdevserver'])
		{
			$out .= file_get_contents($this->templateDir . 'google-analytics.html');
		}
		
		$out .= '</body>';
		$out .= '</html>';

		return $out;
	}

	/**
	 *
	 */
	public function createIconsCSSFile()
	{
		// -----------------
		// Create iconset css file
		$iconcss = '@charset "UTF-8";' . "\n";
		$iconcss .= '/*******************' . "\n";
		$iconcss .= 'RENSHUU.PAAZMAYA.COM' . "\n" . 'http://creativecommons.org/licenses/by-nc-sa/3.0/' . "\n";
		$iconcss .= '*******************/' . "\n";
		$iconcss .= '/*' . "\n";
		$iconcss .= $this->config['iconset'] . "\n";
		$iconcss .= '*/' . "\n";
		$iconcss .= $this->helper->generateCssRule('.icon', array(
			'background-repeat' => 'no-repeat',
			'background-attachment' => 'scroll',
			'background-position' => '1em center'
		));

		$items = array(
			'add', 'addressbook', 'alert', 'arrow1_se', 'arrow3_n', 'arrow3_s', 'calendar', 'cellphone', 'check',
			'close', 'comment', 'denied', 'document', 'edit', 'equalizer', 'lock', 'loop', 'mail',
			'newwindow', 'phone', 'reload', 'save', 'search', 'smirk', 'time', 'tools',
			'trash', 'window', 'womanman', 'zoomin', 'zoomout'
		);
		$iconcss .= $this->helper->generateIconCssRules($this->config['iconset'], '16x16', 'green', $items);

		file_put_contents($this->htmlDir . '/css/iconset-' . $this->config['iconset'] . '.css', $iconcss);

	}

	/**
	 * Send email to the given address with the given content.
	 * Sends a blind copy to the sender address.
	 *
	 * @param string $toMail	Email address of the recipient
	 * @param string $toName	Name of the recipient
	 * @param string $subject	Subject of the mail
	 * @param string $message	Text format of the mail
	 * @return boolean	True if the sending succeeded
	 */
	public function sendEmail($toMail, $toName, $subject, $message)
	{
		require_once $this->config['libdir'] . 'phpmailer/class.phpmailer.php';

		$mail = new PHPMailer();

		// For testing purposes...
		$mail->SMTPDebug = true;
		$mail->SMTPDebugFile = $this->config['email']['log'];

		$mail->IsSMTP();
		$mail->Host = $this->config['email']['smtp'];
		$mail->SMTPAuth = true;
		$mail->Username = $this->config['email']['address'];
		$mail->Password = $this->config['email']['password'];

		$sender = $this->config['title'] . ' - renshuu.paazmaya.com';
		//mb_internal_encoding('UTF-8');
		$sender = mb_encode_mimeheader($sender, 'UTF-8', 'Q');


		$mail->SetFrom($this->config['email']['address'], $sender);

		$mail->Version = self::VERSION;

		$mail->AddAddress($toMail, $toName);
		$mail->AddBCC($this->config['email']['address'], $mail->FromName);
		//Content-Language

		$mail->WordWrap = 50;
		$mail->AddAttachment($this->htmlDir . '/img/favicon64x64.png');
		$mail->IsHTML(false);

		$signature = "\n\n-------------------\nRenshuuSuruToki\nhttp://renshuu.paazmaya.com/\nv" . self::VERSION;

		$mail->Subject = $subject;
		$mail->Body = $message . $signature;

		return $mail->Send();
		// $mail->ErrorInfo;
	}

	/**
	 * http://www.icanlocalize.com/tools/php_scanner
	 * http://www.php.net/manual/en/function.bind-textdomain-codeset.php
	 */
	private function languageInit()
	{
		// set the LANGUAGE environmental variable
		// This one for some reason makes a difference FU@#$%^&*!CK
		// and when combined with bind_textdomain_codeset allows one
		// to set locale independent of server locale setup!!!
		if ( false == putenv("LANGUAGE=" . $this->language ) )
		{
			echo sprintf("Could not set the ENV variable LANGUAGE = %s", $this->language);
		}

		// set the LANG environmental variable
		if ( false == putenv("LANG=" . $this->language ) )
		{
			echo sprintf("Could not set the ENV variable LANG = %s", $this->language);
		}

		// if locales are not installed in locale folder, they will not
		// get set! This is usually in /usr/lib/locale
		// Also, the backup language should always be the default language
		// because of this...see the NOTE in the class description

		// Try first what we want but with the .utf8, which is what the locale
		// setting on most systems want (and is most compatible
		// Then just try the standard lang encoding asked for, and then if
		// all else fails, just try the default language
		// LC_ALL is said to be used, but it has nasty usage in some languages
		// in swapping commas and periods! Thus try LC_MESSAGE if on one of
		// those systems.
		// It is supposedly not defined on WINDOWS, so am including it here
		// for possible uncommenting if a problem is shown
		//
		// if (!defined('LC_MESSAGES')) define('LC_MESSAGES', 6);
		// yes, setlocale is case-sensitive...arg
		$locale_set = setlocale(LC_ALL, $this->language . ".utf8",
										$this->language . ".UTF8",
										$this->language . ".utf-8",
										$this->language . ".UTF-8",
										$this->language,
										CC_LANG);
		// if we don't get the setting we want, make sure to complain!
		if ( ( $locale_set != $this->language && CC_LANG == $locale_set) || empty($locale_set) )
		{
			echo sprintf("Tried: setlocale to '%s', but could only set to '%s'.", $this->language, $locale_set);
		}

		$bindtextdomain_set = bindtextdomain($this->domain,
								  CC_LANG_LOCALE . "/" . $this->_locale_pref );
		if ( empty($bindtextdomain_set) )
		{
			echo sprintf("Tried: bindtextdomain, '%s', to directory, '%s', " .
					"but received '%s'",
					self::GT_DOMAIN, CC_LANG_LOCALE . "/" . $this->_locale_pref,
					$bindtextdomain_set) ;
		}
		bind_textdomain_codeset(self::GT_DOMAIN, "UTF-8");
		$textdomain_set = textdomain(self::GT_DOMAIN);
		if ( empty($textdomain_set) )
		{
			echo sprintf("Tried: set textdomain to '%s', but got '%s'", self::GT_DOMAIN, $textdomain_set);
		}
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
	private function minify($type, $files)
	{
		// Are there newer source files than the single output file?
		$newerexists = false;

		// Return value will be this
		$wrote = false;

		// Keep log of what has happened and how much the filesizes were reduced.
		$dateformat = 'Y-m-d H:i:s';
		$log = '';

		// Function failed on a mismatching parametre?
		$fail = false;
		if ($type == 'js')
		{
			//require_once $this->config['libdir'] . 'jsmin.php';
			require_once $this->config['libdir'] . 'minify/Minify/JS/ClosureCompiler.php';
		}
		else if ($type == 'css')
		{
			require_once $this->config['libdir'] . 'minify/Minify/CSS/Compressor.php';
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
					$log .= date($dateformat) . ' src: ' . $src . ', size: ' . filesize($src) . "\n";

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
						$log .= date($dateformat) . ' des: ' . $des . ', size: ' . filesize($des) . "\n";
					}
					$data[] = '/* ' . $file . ' */' . "\n" . $min;
				}
			}

			$outfile = realpath('./' . $type) . '/' . $this->config['minified'] . '.' . $type;
			$outfilegz = realpath('./' . $type) . '/' . $this->config['minified'] . '.gz.' . $type;
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
				$log .= date($dateformat) . ' outfile: ' . $outfile . ', size: ' . $bytecount . "\n";

				if ($bytecount !== false)
				{
					$gz = gzopen($outfilegz, 'wb9');
					gzwrite($gz, $alldata);
					gzclose($gz);
					$wrote = true;
					$log .= date($dateformat) . ' outfilegz: ' . $outfilegz . ', size: ' . filesize($outfilegz) . "\n";
				}
			}
		}

		file_put_contents($this->config['minifylog'], $log, FILE_APPEND);

		return $wrote;
	}


}

