<?php
/*******************
RENSHUU.PAAZMAYA.COM
http://creativecommons.org/licenses/by-nc-sa/3.0/
*******************/

require 'LightOpenID.php';

/**
 * Handle authentication without any output, just redirection.
 */
class RenshuuAuth
{
	/**
	 * Configuration of the API keys, etc.
	 */
	private $config;
	
	/**
	 * Database connection.
	 */
	private $pdo;
	
	/**
	 * Authentication type:
	 *  google, yahoo...
	 */
	private $authType = '';
	
	/**
	 *
	 */
	function __construct($config, $pdo)
	{
		$this->config = $config;
		$this->pdo = $pdo;
		
		$this->authType = $_GET['type'];
	}

	public function handleGoogle()
	{
        $openid = new LightOpenID('renshuu.paazmaya.com');	

        if (isset($_GET['openid_mode']))
        {
            if ($openid->mode)
            {
                $attr = $openid->getAttributes();

                if ($openid->validate())
                {
                    $_SESSION['email'] = $attr['contact/email'];
					
					// Check if the email has already existing access rights
                }
 
				header('Location: http://' . $_SERVER['HTTP_HOST']);
            }
        }
        else 
        {
            $openid->returnUrl = 'http://' . $_SERVER['HTTP_HOST'];
            $openid->required = array(
                'contact/email',
                'namePerson/first',
				'namePerson/last'
            );
            $openid->identity = 'https://www.google.com/accounts/o8/id';

            header('Location: ' . $openid->authUrl());
        }
	}


}
