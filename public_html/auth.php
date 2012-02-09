<?php
/*******************
RENSHUU.PAAZMAYA.COM
http://creativecommons.org/licenses/by-nc-sa/3.0/
*******************/
/**
* Authentication when it is done elsewhere, such as via OAuth in Twitter...
*
* This page is used in a modal window for receiving and sending data between
* consumer (this web site) and provider (others, like twitter or facebook).
*
* Those services which require slightly different parametres to set, differing
* from stantard OpenID, have their independent "page" option.
*/

require './config.php';
require './locale.php';

header('Content-type: text/plain; charset=utf-8');


// Default logging data
$out = array(
	'error' => 'Parameters missing'
);

$page = '';
$pages = array('facebook', 'google', 'oauth', 'openid', 'twitter');

if ($_SERVER['SERVER_NAME'] == '192.168.1.37')
{
	$out['post'] = $posted;
	$out['get'] = $getted;
}

// This should always be set anyhow due to mod_rewrite...
if (isset($getted['page']))
{
	$parts = explode('/', strtolower($getted['page']));
	$count = count($parts);
	if ($count > 1 && $parts['0'] = 'auth' && in_array($parts['1'], $pages))
	{
		$page = $parts['1'];

	}
	else
	{
		// We are in the harms way...
	}
}

print_r($posted);
print_r($getted);

/*
if ($page == 'twitter')
{


	require $cf['libdir'] . 'oauth/OAuth.php';

	// Twitter
	$options = array(
		'consumer_key' => $cf['twitter']['consumer_key'],
		'consumer_secret' => $cf['twitter']['consumer_secret']
	);
}
else if ($page == 'openid' || $page == 'google')
{
	require $cf['libdir'] . 'LightOpenID.php';
	$openid = new LightOpenID;
	
	// http://openid.net/2010/03/09/ntt-docomo-is-now-an-openid-provider/
	// docomo ID <--> i-mode ID
	
	try {
		if (!isset($getted['openid_mode']))
		{
			if ((isset($posted['openid_identifier']) && $posted['openid_identifier'] != '') || $page == 'google')
			{
				if ($page == 'google')
				{
					$openid->identity = 'https://www.google.com/accounts/o8/id';
				}
				else 
				{
					$openid->identity = $posted['openid_identifier'];
				}
				
				header('Location: ' . $openid->authUrl());
				exit();
			}
			
			?>
				<form action="/auth/openid" method="post">
					OpenID: <input type="text" name="openid_identifier" /> <button>Submit</button>
				</form>
				<a href="/auth/google" title="Login with Google">Login with Google</a>
			<?php
		}
		else if ($getted['openid_mode'] == 'cancel')
		{
			echo 'User has canceled authentication!';
		} 
		else
		{
			echo 'User ' . ($openid->validate() ? $openid->identity . ' has' : 'has not') . ' logged in.';
		}
	} 
	catch(ErrorException $error) 
	{
		echo $error->getMessage();
	}


}


*/



