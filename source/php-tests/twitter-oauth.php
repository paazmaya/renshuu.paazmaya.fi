<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/

require_once './config.php';

// http://code.google.com/p/oauth-php/
require_once $cf['libdir'] . 'oauth-php/OAuthStore.php';
require_once $cf['libdir'] . 'oauth-php/OAuthRequester.php';

header('Content-Type: text/plain');

// Three legged

// 1. leg

$cf['db']['server'] = $cf['db']['address'];
$store = OAuthStore::instance('MySQL', $cf['db']);


// Get the id of the current user (must be an int)
$user_id = 1;

$cf['twitter']['server_uri'] = ''
$cf['twitter']['signature_methods'] = array('HMAC-SHA1', 'PLAINTEXT');

// Save the server in the the OAuthStore
$consumer_key = $store->updateServer($cf['twitter'], $user_id);

// 2. leg

// Fetch the id of the current user
$user_id = 1;

// Obtain a request token from the server
$token = OAuthRequester::requestRequestToken($consumer_key, $user_id);

// Callback to our (consumer) site, will be called when the user finished the authorization at the server
$callback_uri = 'http://www.mysite.com/callback?consumer_key='.rawurlencode($consumer_key).'&usr_id='.intval($user_id);

// Now redirect to the autorization uri and get us authorized
if (!empty($token['authorize_uri']))
{
    // Redirect to the server, add a callback to our server
    if (strpos($token['authorize_uri'], '?'))
    {
        $uri = $token['authorize_uri'] . '&'; 
    }
    else
    {
        $uri = $token['authorize_uri'] . '?'; 
    }
    $uri .= 'oauth_token='.rawurlencode($token['token']).'&oauth_callback='.rawurlencode($callback_uri);
}
else
{
    // No authorization uri, assume we are authorized, exchange request token for access token
   $uri = $callback_uri . '&oauth_token='.rawurlencode($token['token']);
}

header('Location: '.$uri);
exit();






// 3. leg

// Request parameters are oauth_token, consumer_key and usr_id.
$consumer_key = $_GET['consumer_key'];
$oauth_token = $_GET['oauth_token'];
$user_id = $_GET['usr_id'];

try
{
    OAuthRequester::requestAccessToken($consumer_key, $oauth_token, $user_id);
}
catch (OAuthException $e)
{
    // Something wrong with the oauth_token.
    // Could be:
    // 1. Was already ok
    // 2. We were not authorized
}


// 4th step?

// The request uri being called.
$request_uri = 'http://www.example.com/api';

// Parameters, appended to the request depending on the request method.
// Will become the POST body or the GET query string.
$params = array(
           'method' => 'ping'
     );

// Obtain a request object for the request we want to make
$req = new OAuthRequester($request_uri, 'GET', $params);

// Sign the request, perform a curl request and return the results, throws OAuthException exception on an error
$result = $req->doRequest($user_id);

// $result is an array of the form: array ('code'=>int, 'headers'=>array(), 'body'=>string)









// http://hueniverse.com/oauth/guide

print_r($cf['twitter']);

// Twitter
$options = array(
	'consumer_key' => $cf['twitter']['consumer_key'],
	'consumer_secret' => $cf['twitter']['consumer_secret']
);
/*
request_token_url' => 'http://twitter.com/oauth/request_token',
'access_token_url' => 'http://twitter.com/oauth/access_token',
'authorize_url' => 'http://twitter.com/oauth/authorize'
*/

OAuthStore::instance('2Leg', $options);




// two legged twitter
define('OAUTH_TMP_DIR', function_exists('sys_get_temp_dir') ? sys_get_temp_dir() : realpath($_ENV["TMP"])); 


$params = null;

try
{

	// Sign the request, perform a curl request and return the results, 
	// throws OAuthException2 exception on an error
	// $result is an array of the form: array ('code'=>int, 'headers'=>array(), 'body'=>string)
	$request = new OAuthRequester($cf['twitter']['request_token_url'], 'POST');
	$result = $request->doRequest(0);
	
	print_r($result);
	
	$response = $result['body'];


	parse_str($result['body'], $params);

	var_dump($response);
	
	
    $request = new OAuthRequester("https://twitter.com/statuses/user_timeline.json?user_id=paazmaya", 'GET', $params);
    $result = $request->doRequest();
	print_r($result);
}
catch(OAuthException2 $e)
{
	echo "Exception" . $e->getMessage();
}






/*



define("GOOGLE_CONSUMER_KEY", "FILL THIS"); // 
define("GOOGLE_CONSUMER_SECRET", "FILL THIS"); // 

define("GOOGLE_OAUTH_HOST", "https://www.google.com");
define("GOOGLE_REQUEST_TOKEN_URL", GOOGLE_OAUTH_HOST . "/accounts/OAuthGetRequestToken");
define("GOOGLE_AUTHORIZE_URL", GOOGLE_OAUTH_HOST . "/accounts/OAuthAuthorizeToken");
define("GOOGLE_ACCESS_TOKEN_URL", GOOGLE_OAUTH_HOST . "/accounts/OAuthGetAccessToken");

define('OAUTH_TMP_DIR', function_exists('sys_get_temp_dir') ? sys_get_temp_dir() : realpath($_ENV["TMP"]));

//  Init the OAuthStore
$options = array(
	'consumer_key' => GOOGLE_CONSUMER_KEY, 
	'consumer_secret' => GOOGLE_CONSUMER_SECRET,
	'server_uri' => GOOGLE_OAUTH_HOST,
	'request_token_uri' => GOOGLE_REQUEST_TOKEN_URL,
	'authorize_uri' => GOOGLE_AUTHORIZE_URL,
	'access_token_uri' => GOOGLE_ACCESS_TOKEN_URL
);
// Note: do not use "Session" storage in production. Prefer a database
// storage, such as MySQL.
OAuthStore::instance("Session", $options);

try
{
	//  STEP 1:  If we do not have an OAuth token yet, go get one
	if (empty($_GET["oauth_token"]))
	{
		$getAuthTokenParams = array('scope' => 
			'http://docs.google.com/feeds/',
			'xoauth_displayname' => 'Oauth test',
			'oauth_callback' => 'http://likeorhate.local/google.php');

		// get a request token
		$tokenResultParams = OAuthRequester::requestRequestToken(GOOGLE_CONSUMER_KEY, 0, $getAuthTokenParams);

		//  redirect to the google authorization page, they will redirect back
		header("Location: " . GOOGLE_AUTHORIZE_URL . "?btmpl=mobile&oauth_token=" . $tokenResultParams['token']);
	}
	else {
		//  STEP 2:  Get an access token
		$oauthToken = $_GET["oauth_token"];
		
		// echo "oauth_verifier = '" . $oauthVerifier . "'<br/>";
		$tokenResultParams = $_GET;
		
		try {
		    OAuthRequester::requestAccessToken(GOOGLE_CONSUMER_KEY, $oauthToken, 0, 'POST', $_GET);
		}
		catch (OAuthException2 $e)
		{
			var_dump($e);
		    // Something wrong with the oauth_token.
		    // Could be:
		    // 1. Was already ok
		    // 2. We were not authorized
		    return;
		}
		

		// make the docs requestrequest.
		$request = new OAuthRequester("http://docs.google.com/feeds/documents/private/full", 'GET', $tokenResultParams);
		$result = $request->doRequest(0);
		if ($result['code'] == 200) {
			var_dump($result['body']);
		}
		else {
			echo 'Error';
		}
	}
}
catch(OAuthException2 $e) {
	echo "OAuthException:  " . $e->getMessage();
	var_dump($e);
}

*/





