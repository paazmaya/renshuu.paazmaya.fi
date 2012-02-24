<?php
/*******************
RENSHUU.PAAZMAYA.COM
http://creativecommons.org/licenses/by-nc-sa/3.0/
*******************/

require_once 'LightOpenID.php';

/**
 * Handle authentication without any output, just redirection.
 */
class RenshuuAuth
{
	/**
	 * Service provider name:
	 *  google, yahoo...
	 * Key in $this->lang['loginlist']
	 */
	public $provider = '';
	
	/**
	 * Configuration of the API keys, etc.
	 */
	private $config;
	
	/**
	 * Database connection.
	 */
	private $pdo;
	
	/**
	 * Language strings.
	 */
	private $lang;
	
	/**
	 *
	 */
	function __construct($config, $pdo, $lang)
	{
		$this->config = $config;
		$this->pdo = $pdo;
		$this->lang = $lang;
	}
	
	/**
	 * Redirect to the service provider web site for login.
	 */
	public function goToProvider()
	{
		$provider = $this->lang['loginlist'][$this->provider];
		
        $openid = new LightOpenID('renshuu.paazmaya.com');	
	
		$openid->returnUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/login/' . $this->provider;
		$openid->required = array(
			'contact/email',
			'namePerson/first',
			'namePerson/last'
		);
		$openid->identity = $provider['href'];

		header('Location: ' . $openid->authUrl());
	}

	/**
	 * Service provider returns the user here.
	 */
	public function returningProvider()
	{
        $openid = new LightOpenID('renshuu.paazmaya.com');	

		if ($openid->mode)
		{
			$attr = $openid->getAttributes();

			if ($openid->validate())
			{
				$_SESSION['email'] = $attr['contact/email'];
				$_SESSION['username'] = $attr['namePerson/first'] . ' ' . $attr['namePerson/last'];
				$_SESSION['identity'] = $openid->identity;
				
				// Check if the email has already existing access rights
			
				$sql = 'SELECT title, email, access FROM renshuu_user WHERE email = \'' . $_SESSION['email'] . '\'';
				$run = $this->pdo->query($sql);
				if ($run->rowCount() > 0)
				{
					$res = $run->fetch(PDO::FETCH_ASSOC);
					
					// So there was data, just login and use the site
					$_SESSION['username'] = $res['title'];
					$_SESSION['access'] = intval($res['access']); // use as binary
				}
				else
				{
					// Insert
					$sql = 'INSERT INTO renshuu_user (title, email, identity, modified, access) VALUES (\'' . 
						$attr['namePerson/first'] . ' ' . $attr['namePerson/last'] . '\', \'' . 
						$attr['contact/email'] . '\', \'' . $openid->identity . '\', ' . time() . ', 1)';
					$run = $this->pdo->query($sql);
					$_SESSION['access'] = 1;
					
					// Should you send an email telling about new user?
				}
			}

			header('Location: http://' . $_SERVER['HTTP_HOST']);
		}
	}
/*
		case 'facebook':
		social_connect_verify_signature( $_REQUEST[ 'social_connect_access_token' ], $sc_provided_signature, $redirect_to );
		$fb_json = json_decode( sc_curl_get_contents("https://graph.facebook.com/me?access_token=" . $_REQUEST[ 'social_connect_access_token' ]) );
		$sc_provider_identity = $fb_json->{ 'id' };
		$sc_email = $fb_json->{ 'email' };
		$sc_first_name = $fb_json->{ 'first_name' };
		$sc_last_name = $fb_json->{ 'last_name' };
		$sc_profile_url = $fb_json->{ 'link' };
		$sc_name = $sc_first_name . ' ' . $sc_last_name;
		$user_login = strtolower( $sc_first_name.$sc_last_name );
		break;
*/
}
