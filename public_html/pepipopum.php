<?php
/**
 * Pepipopum - Automatic PO Translation via Google Translate
 * Copyright (C)2009  Paul Dixon (lordelph@gmail.com)
 * Copyright (C)2010  Juga Paazmaya (olavic@gmail.com)
 * $Id$
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * REQUIREMENTS:
 *
 * Requires curl to perform the Google Translate API call but could
 * easily be adapted to use something else or make the HTTP call
 * natively.
 */

/**
 * Passes untranslated entries through the Google Translate
 * API and writes the transformed PO to another file
 */
class POTranslator
{
	public $debug = true;
	public $logfile = './pepipopum.debug.log';
	private $loghandle;
	
	public $languageIn = 'en';
	public $languageOut = 'fi';

    public $max_entries = 0; //for testing you can limit the number of entries processed
    private $start = 0; //timestamp when we started

	/**
	 * The translated PO data is build in this variable.
	 */
	private $translated = '';
	
    /**
     * Google API requires a referer - constructor will build a suitable default
     */
    public $referer;

    /**
	 * Define delay between Google API calls (can be fractional for sub-second delays).
     * How many seconds should we wait between Google API calls to be nice
     * to google and the server running Pepipopum? Can use a floating point
     * value for sub-second delays
     */
    public $delay = 0.25;

	/**
	 * curl resourse
	 */
	private $curl;

	/**
	 * Google Search API key
	 * http://code.google.com/apis/ajaxlanguage/documentation/reference.html#_intro_fonje
	 */
	public $apikey = 'ABQIAAAAyLIwOFKaznKcdf7DtmATHRS63tg4GPYAq5NgLkRBG-kstXlQIhR2bt33tcKswj6TjD_GOD3k-XKfcg';
	private $apiurl = 'http://ajax.googleapis.com/ajax/services/language/translate';

    public function __construct()
    {
        // Google API needs to be passed a referer
        $this->referer = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

		$this->curl = curl_init();
		curl_setopt_array($this->curl, array(
			CURLOPT_HEADER => false,
			CURLOPT_REFERER => $this->referer,
			CURLOPT_RETURNTRANSFER => true
		));
    }


    /**
     * Translates a PO file storing output in desired location.
	 * Returns the translated PO as a string or false in case it failed.
     */
    public function translate($inData)
    {
		if ($this->debug && !$this->loghandle)
		{
			$this->loghandle = fopen($this->logfile, 'a');
		}
		
		$this->process($inData);
		
		if ($this->debug && $this->loghandle)
		{
			fclose($this->loghandle);
		}
		return $this->translated;
    }
	
    /**
     * Parses input string and calls processEntry for each recgonized entry
     * and output for all other lines
     */
    public function process($inData)
    {
		$lines = explode("\n", $inData);
		
        set_time_limit(86400);
        $this->start = time();

        $msgid = $msgstr = array();
        $count = $state = 0;
		
		foreach($lines as $line)
		{
            $line = trim($line);
            $match_msgid = $match_msgstr = $match_empty = array();

			if ($this->debug)
			{
				$this->trace('<p>line: '. $line . '<br />');
				$this->trace('state: '. $state . '<br />');
			}
			
			$found_msgid = preg_match('/^msgid(\s+)"(.*)"$/', $line, $match_msgid);
			$found_msgstr = preg_match('/^msgstr(\s+)"(.*)"$/', $line, $match_msgstr);
			$found_empty = preg_match('/"(.*)"/', $line, $match_empty);
			$found_hash = preg_match('/^#/', $line);
			
			if ($this->debug)
			{
				$this->trace('found_msgid: '. $found_msgid . ', found_msgstr: '. $found_msgstr . ', found_empty: '. $found_empty . ', found_hash: ' . $found_hash . '<br />');
			}
			
			$found_msgid_pos = strpos($line, 'msgid');
			
            switch ($state)
            {
                case 0:
					//waiting for msgid
                    if ($found_msgid)
                    {
						if ($this->debug)
						{
							$this->trace('match_msgid: '. implode(', ', $match_msgid) . '<br />');
						}
                        $clean = stripcslashes($match_msgid[2]);
                        $msgid = array($clean);
                        $state = 1;
                    }
                    break;
                case 1: 
					//reading msgid, waiting for msgstr
                    if ($found_msgstr)
                    {
						if ($this->debug)
						{
							$this->trace('match_msgstr: '. implode(', ', $match_msgstr) . '<br />');
						}
                        $clean = stripcslashes($match_msgstr[2]);
                        $msgstr = array($clean);
                        $state = 2;
                    }
                    else if ($found_empty)
                    {
                        $msgid[] = stripcslashes($match_empty[1]);
                    }
                    break;
                case 2:
					//reading msgstr, waiting for blank
                    if ($found_empty)
                    {
                        $msgid[] = stripcslashes($match_empty[1]);
                    }
                    else if (empty($line) || $found_hash)
                    {
                        // We should have a complete entry
                        $this->processEntry($msgid, $msgstr); // this should add it to the output...
                        $count++;
						/*
                        if ($this->max_entries && ($count>$this->max_entries))
                        {
                            break 2;
                        }
						*/
                        $state = 0;
						$msgid = $msgstr = array();
                    }
                    break;
            }

			if ($this->debug)
			{
				$this->trace('count: ' . $count . '<br />');
				$this->trace('msgid: ' . implode(', ', $msgid) . '<br />');
				$this->trace('msgstr: ' . implode(', ', $msgstr) . '</p>');
			}

            //comment or blank line?
            if (empty($line) || $found_hash)
            {
                $this->output($line);
            }
        }
		if ($this->debug)
		{
			$this->trace('<p>Prosessing time: ' . (time() - $this->start) . ' sec</p>');
		}
    }
	
    /**
     * Performs the Google Translate API call
	 * http://code.google.com/apis/ajaxlanguage/documentation/
     */
    protected function processEntry($msgid, $msgstr)
    {
        $input = implode('', $msgid);
        $output = implode('', $msgstr);

		if ($this->debug)
		{
			$this->trace('<span style="display:block; background-color:#F4F4F4;">input: ' . $input . '<br />');
			$this->trace('output: ' . $output . '<br />');
		}
		
        if (!empty($input) && empty($output))
        {
            $q = urlencode($input);		
            $langpair = urlencode($this->languageIn . '|' . $this->languageOut);

			// http://code.google.com/apis/ajaxlanguage/documentation/reference.html#_intro_fonje
			$url = $this->apiurl . '?v=1.0&key=' . $this->apikey . '&hl=' . $this->languageIn . '&q=' . $q . '&langpair=' . $langpair;
			
			if ($this->debug)
			{
				$this->trace('url: ' . $url . '<br />');
			}
			
			curl_setopt($this->curl, CURLOPT_URL, $url);
			$result = curl_exec($this->curl);

			if ($this->debug)
			{
				$this->trace('result: ' . $result . '<br />');
			}
			/*
			{
			  "responseData" : {
				"translatedText" : the-translated-text,
				"detectedSourceLanguage"? : the-source-language
			  },
			  "responseDetails" : null | string-on-error,
			  "responseStatus" : 200 | error-code
			}
			*/

			if ($result !== false)
			{
				$data = json_decode($result);
				
				if ($this->debug)
				{
					echo '<pre>';
					print_r($data);
					echo '</pre>';
				}
				
				if (is_object($data) && is_object($data->responseData) && isset($data->responseData->translatedText))
				{
					$output = $data->responseData->translatedText;

					//Google translate mangles placeholders, lets restore them
					$output = preg_replace('/%\ss/', '%s', $output);
					$output = preg_replace('/% (\d+) \$ s/', ' %$1\$s', $output);
					$output = preg_replace('/^ %/', '%', $output);

					//have seen %1 get flipped to 1%
					if (preg_match('/%\d/', $input) && preg_match('/\d%/', $output))
					{
						$output = preg_replace('/(\d)%/', '%$1', $output);
					}

					//we also get entities for some chars
					$output = html_entity_decode($output, ENT_QUOTES, 'UTF-8');

					$msgstr = array($output);
				}
			}
			//play nice with google
			usleep($this->delay * 1000000);
        }

		if ($this->debug)
		{
			$this->trace('</span>');
		}
		
        //output entry
		$out = "msgid ";
        foreach($msgid as $part)
        {
            $part = addcslashes($part,"\r\n\"");
            $out .= "\"{$part}\"\n";
        }
        $out .= "msgstr ";
        foreach($msgstr as $part)
        {
            $part = addcslashes($part,"\r\n\"");
            $out .= "\"{$part}\"\n";
        }
        $this->output($out);
    }

    /**
     * Overriden output method writes to output file
     */
    protected function output($str)
    {
		$this->translated .= $str;
    }
	
	/**
	 * Debugging of the outgoing and incoming data.
	 */
	protected function trace($str)
	{
		echo $str . "\n";
		// or write to the log file...
		if ($this->loghandle)
		{
			fwrite($this->loghandle, $str . "\n");
		}
	}
}


function processForm()
{
    set_time_limit(86400); // Set the number of seconds a script is allowed to run

    if ($_POST['output'] == 'html')
    {
        //we output to a temporary file to allow later download
        echo '<h1>Processing PO file...</h1>';
        echo '<div id="info"></div>';
        $outfile = tempnam(sys_get_temp_dir(), 'pepipopum');
    }
    else
    {
        //output directly
        header("Content-Type:text/plain");
        $outfile = "php://output";
    }
	
	$data = file_get_contents($_FILES['pofile']['tmp_name']);

    $translator = new POTranslator();
	$translator->languageIn = 'en';
	$translator->languageOut = $_POST['language'];
    $translated = $translator->translate($data);
	
	file_put_contents($outfile, $translated);


    if ($_POST['output'] == 'html')
    {
        //show download link
        $leaf = basename($outfile);
        $name = $_FILES['pofile']['name'];

        echo "Completed - <a href=\"pepipopum.php?download=".urlencode($leaf)."&name = ".urlencode($name)."\">download your updated po file</a>";
    }
    else
    {
        //we're done
        exit;
    }
}

if (isset($_GET['download']) && isset($_GET['name']))
{
    //check download file is valid
    $file = sys_get_temp_dir().DIRECTORY_SEPARATOR.$_GET['download'];
    $ok = preg_match('/^pepipopum[A-Za-z0-9]+$/', $_GET['download']);
    $ok = $ok && file_exists($file);

    //sanitize name
    $name = preg_replace('/[^a-z0-9\._]/i', '', $_GET['name']);

    if ($ok)
    {
        header("Content-Type:text/plain");
        header("Content-Length:".filesize($file));
        header("Content-Disposition: attachment; filename=\"{$name}\"");

        readfile($file);
    }
    else
    {
        //fail
        header("HTTP/1.0 404 Not Found");
        echo "The requested pepipopum output file is not available - it may have expired. <a href=\"pepipopum.php\">Click here to generate a new one</a>.";
    }
    exit;
}

if (isset($_POST['output']) && ($_POST['output'] == 'pofile'))
{
    processForm();
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-type" content="text/html;charset=UTF-8" />
<title>Pepipopum - Translate PO file with Google Translate</title>
<style type="text/css">


body
{
    background:#eeeeee;
    margin: 0;
    padding: 0;
    text-align: center;

    font-family:Verdana,Arial,Helvetica
}

#main
{
    padding: 3em;
    margin: 1em auto 1em auto;
    width: 50em;
    border:1px solid #dddddd;
    text-align: left;
    background:white;
}

#footer
{
    text-align:right;
    font-size:8pt;
    color:#888888;
    border-top:1px solid #888888;
}

h1
{
    margin-top:0;
}

form
{
    background:#dddddd;
    padding:2em;
    margin:0 2em 0 2em;

    -moz-border-radius: 1em;
    -webkit-border-radius: 1em;
    border-radius: 1em;

    font-size:0.8em;
}

fieldset
{
    background:#cccccc;
    border:1px solid #aaaaaa;
    margin-bottom:1em;
    padding:1em;
    position:relative;

    -moz-border-radius: 0.5em;
    -webkit-border-radius: 0.5em;
    border-radius: 0.5em;

}

legend
{
    background:#aaaaaa;
    border:0;
    padding:0 1em 0 1em;
    margin-left:1em;
    color:#ffffff;

    position: absolute;
    top: -.5em;
    left: .2em;


    -moz-border-radius: 0.5em;
    -webkit-border-radius: 0.5em;
    border-radius: 0.5em;

}

</style>
</head>

<body>
<div id="main">

<?php
if (isset($_POST['output']) && ($_POST['output'] == 'html'))
{
    processForm();
}
?>

<h1>Pepipopum - Translate PO files with Google Translate</h1>

<p>PO files originate from the <a href="http://www.gnu.org/software/gettext/gettext.html">GNU gettext</a>
tools and can be generated by a wide variety of other localization tools.</p>

<p>Pepipopum allows you to upload a PO file containing English language strings in the <i>msgid</i>,
and it uses the <a href="http://code.google.com/apis/ajaxlanguage/">Google Translate API</a>
to construct a PO file containing translated equivalents in each corresponding <i>msgstr</i></p>

<p>If the PO file already contains a translation for a given msgid, it will not be translated. This
allows you to upload a proof-read PO and just get translations for any new elements.</p>

<form enctype="multipart/form-data" action="pepipopum.php" method="post">

     <fieldset>
    <legend>Input</legend>
       <div class="field">
        <div class="label"><label for="pofile">PO File</label></div>
        <div class="input"><input id="pofile" name="pofile" type="file" /></div>
        </div>
    </fieldset>

    <fieldset>
    <legend>Output options</legend>

 <div class="field">
        <div class="label"><label for="language">Target Language</label></div>
        <div class="input"><select id="language" name="language">
            <option value="af">Afrikaans</option>
            <option value="sq">Albanian</option>
            <option value="ar">Arabic</option>
            <option value="be">Belarusian</option>
            <option value="bg">Bulgarian</option>
            <option value="ca">Catalan</option>
            <option value="zh-CN">Chinese (Simplified)</option>
            <option value="zh-TW">Chinese (Traditional)</option>
            <option value="hr">Croatian</option>
            <option value="cs">Czech</option>
            <option value="da">Danish</option>
            <option value="nl">Dutch</option>
            <option value="en">English</option>
            <option value="et">Estonian</option>
            <option value="tl">Filipino</option>
            <option value="fi">Finnish</option>
            <option value="fr">French</option>
            <option value="gl">Galician</option>
            <option value="de">German</option>
            <option value="el">Greek</option>
            <option value="iw">Hebrew</option>
            <option value="hi">Hindi</option>
            <option value="hu">Hungarian</option>
            <option value="is">Icelandic</option>
            <option value="id">Indonesian</option>
            <option value="ga">Irish</option>
            <option value="it">Italian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="lv">Latvian</option>
            <option value="lt">Lithuanian</option>
            <option value="mk">Macedonian</option>
            <option value="ms">Malay</option>
            <option value="mt">Maltese</option>
            <option value="no">Norwegian</option>
            <option value="fa">Persian</option>
            <option value="pl">Polish</option>
            <option value="pt">Portuguese</option>
            <option value="ro">Romanian</option>
            <option value="ru">Russian</option>
            <option value="sr">Serbian</option>
            <option value="sk">Slovak</option>
            <option value="sl">Slovenian</option>
            <option value="es">Spanish</option>
            <option value="sw">Swahili</option>
            <option value="sv">Swedish</option>
            <option value="th">Thai</option>
            <option value="tr">Turkish</option>
            <option value="uk">Ukrainian</option>
            <option value="vi">Vietnamese</option>
            <option value="cy">Welsh</option>
            <option value="yi">Yiddish</option>
            </select>
        </div>
     </div>

     <div>
     <input id="output_po" name="output" value="pofile" type="radio"/>
     <label for="output_po">Output PO File</label>
     </div>

     <div>
     <input id="output_html" name="output" value="html" checked="checked" type="radio"/>
     <label for="output_html">Output progress meter and then provide a download link</label>
     </div>
     </fieldset>

    <div>
    <input type="submit" value="Translate File" />
    </div>

</form>

<p>You can automate translation by using a tool like <a href="http://curl.haxx.se/">cURL</a> to post a PO file and obtain
a translated result. For example:</p>

<pre>
    curl -F pofile=@<i>input-po-filename</i> \
        -F language=<i>target-language-code</i> \
        -F output=pofile
        http://pepipopum.dixo.net \
        --output <i>output-po-filename</i>

</pre>


<p>Why is called "Pepipopum"? I just invented a word which had
'po' in it and was relatively rare on Google! Pronounce it <i>pee-pie-poe-pum</i>.</p>

<p><a href="http://blog.dixo.net/2009/10/24/pepipopum-automatically-translate-po-files-with-google-translate/">Comments and suggestions</a> are welcome.</p>
<div id="footer">
<p><a href="http://blog.dixo.net/about">(c)2009 Paul Dixon</a></p>
</div>
</div>
</body>
</html>
