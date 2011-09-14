<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/
/*
Localisation / Internalisation.

GNU gettext is designed to minimize the impact of internationalization on program sources, 
keeping this impact as small and hardly noticeable as possible. 
Internationalization has better chances of succeeding if it is very light weighted, 
or at least, appear to be so, when looking at program sources.

With the following commands greate the .po file needed which in turn is copied
and after being translated, transformed to .mo file.
"xgettext" will look for strings contained in a function call to "gettext".
Remember to change the header information of the PO template file (.pot) and
set Content-Type=UTF-8. Content-Transfer-Encoding should always be 8bit.

http://www.gnu.org/software/gettext/manual/gettext.html

xgettext \
--default-domain=renshuuSuruToki \
--indent \
--sort-output \
--no-wrap \
--language=PHP \
--from-code=UTF-8 \
--copyright-holder="Jukka Paasonen" \
--package-name=RENSHUU.PAAZMAYA.COM \
--package-version=0.8.20110912 \
--strict \
--debug \
index.php locale.php

"C:\Program Files\Poedit\bin\xgettext.exe" --default-domain=renshuuSuruToki --indent --sort-output --no-wrap --language=PHP --from-code=UTF-8 --copyright-holder="Jukka Paasonen" --package-name=RENSHUU.PAAZMAYA.COM --package-version=0.8.20110912 --strict --debug index.php locale.php

mv renshuuSuruToki.po renshuuSuruToki.pot

Locale should appear from the po file...
msgfmt --strict --check --verbose -o renshuuSuruToki.mo renshuuSuruToki.po

"C:\Program Files\Poedit\bin\msgfmt.exe" --strict --check --verbose -o renshuuSuruToki.mo renshuuSuruToki.po


The msgmerge program merges two Uniforum style .po files together. 
The def.po file is an existing PO file with translations which will be taken over to the newly 
created file as long as they still match; comments will be preserved, but extracted comments and 
file positions will be discarded. The ref.pot file is the last created PO file with up-to-date 
source references but old translations, or a PO Template file (generally created by xgettext); 
any translations or comments in the file will be discarded, however dot comments and 
file positions will be preserved. 
Where an exact match cannot be found, fuzzy matching is used to produce better results. 

msgmerge -U renshuuSuruToki.po renshuuSuruToki.pot

"C:\Program Files\Poedit\bin\msgmerge.exe" -U locale\fi\LC_MESSAGES\renshuuSuruToki.po locale\renshuuSuruToki.po




http://www.php.net/manual/en/function.sprintf.php
* % - a literal percent character. No argument is required.
* b - the argument is treated as an integer, and presented as a binary number.
* c - the argument is treated as an integer, and presented as the character with that ASCII value.
* d - the argument is treated as an integer, and presented as a (signed) decimal number.
* e - the argument is treated as scientific notation (e.g. 1.2e+2). 
	  The precision specifier stands for the number of digits after the decimal point since PHP 5.2.1. 
	  In earlier versions, it was taken as number of significant digits (one less).
* E - like %e but uses uppercase letter (e.g. 1.2E+2).
* u - the argument is treated as an integer, and presented as an unsigned decimal number.
* f - the argument is treated as a float, and presented as a floating-point number (locale aware).
* F - the argument is treated as a float, and presented as a floating-point number (non-locale aware).
	  Available since PHP 4.3.10 and PHP 5.0.3.
* g - shorter of %e and %f.
* G - shorter of %E and %f.
* o - the argument is treated as an integer, and presented as an octal number.
* s - the argument is treated as and presented as a string.
* x - the argument is treated as an integer and presented as a hexadecimal number (with lowercase letters).
* X - the argument is treated as an integer and presented as a hexadecimal number (with uppercase letters).


*/

/**
 * Site wide title and other meta data
 */
$lang = array(
	'title' => gettext('training times and locations'),
	'description' => gettext('In order to find the martial art trainings interesting for the user, this service offers the filters for searching through the community driven International database of martial art trainings.')
);



/**
 * Weekday list.
 * Zero indexed, starting from Sunday.
 */
$lang['weekdays'] = array(
	gettext('Sunday'), 
	gettext('Monday'), 
	gettext('Tuesday'),
	gettext('Wednesday'), 
	gettext('Thursday'),
	gettext('Friday'), 
	gettext('Saturday')
);

/*
FORMS

No need to define those properties which are defaults as described below.
Required items are: label, type, name, and both items in the buttons.
Only non empty values will be used.

'' => array(
	'legend' => gettext(''),
	'info' => gettext(''),
	'buttons' => array(
		'send' => gettext(''),
		'clear' => gettext('') If empty, no button will be shown
	),
	'items' => array(
		array(
			'label' => gettext(''), label text before the element
			'type' => '', input types or select
			'name' => '', name of the field
			'class' => '' style class
			'disabled' => false, disabled="disabled" will be written if true
			'after' => gettext(''), text after the element but before the label closes
			'value' => gettext(''), value of the input element if any
			'options' => array() options used in the case of select: value => visible text
		)
	),
	'links' => array(
		'twitter' => gettext('Login via your Twitter account')
	)
)

 * @see http://developers.whatwg.org/the-input-element.html#attr-input-type
*/
$lang['forms'] = array(
	'art' => array(
		'legend' => gettext('Art'),
		'info' => gettext('Add a martial art to the arts listed'),
		'buttons' => array(
			'send' => gettext('Send Martial art'),
			'clear' => gettext('Clear')
		),
		'items' => array(
			array(
				'label' => gettext('Name'),
				'type' => 'text',
				'name' => 'title'
			),
			array(
				'label' => gettext('URI'),
				'type' => 'text',
				'name' => 'uri'
			)
		)
	),
	'location' => array(
		'legend' => gettext('Location'),
		'info' => gettext('Add a location to the available locations'),
		'buttons' => array(
			'send' => gettext('Send Location'),
			'clear' => gettext('Clear')
		),
		'items' => array(
			array(
				'label' => gettext('Title'),
				'type' => 'text',
				'name' => 'title'
			),
			array(
				'label' => gettext('URI'),
				'type' => 'url',
				'name' => 'uri'
			),
			array(
				'label' => gettext('Info'),
				'type' => 'text',
				'name' => 'info'
			),
			array(
				'label' => gettext('Address(if any)'),
				'type' => 'text',
				'name' => 'address'
			),
			array(
				'label' => gettext('Geocode'),
				'type' => 'radio',
				'name' => 'geocode',
				'options' => array(
					'none' => gettext('none'),
					'address' => gettext('address'),
					'position' => gettext('position')
				),
				'after' => gettext(' (address from map position)')
			),
			array(
				'label' => gettext('Latitude'),
				'type' => 'number',
				'name' => 'latitude',
				'disabled' => true
			),
			array(
				'label' => gettext('Longitude'),
				'type' => 'number',
				'name' => 'longitude',
				'disabled' => true
			)
		)
	),
	'training' => array(
		'legend' => gettext('Training'),
		'info' => gettext('Add a training event on the selected martial art'),
		'buttons' => array(
			'send' => gettext('Send Training'),
			'clear' => gettext('Clear')
		),
		'items' => array(
			array(
				'label' => gettext('Title'),
				'type' => 'text',
				'name' => 'title'
			),
			array(
				'label' => gettext('Location'),
				'type' => 'text',
				'name' => 'location'
			),
			array(
				'label' => gettext('Weekday'),
				'type' => 'select',
				'name' => 'weekday',
				'options' => array()
			),
			array(
				'label' => gettext('Occurance'),
				'type' => 'text',
				'name' => 'occurance'
			),
			array(
				'label' => gettext('Start time'),
				'type' => 'text',
				'name' => 'starttime',
				'class' => 'short'
			),
			array(
				'label' => gettext('End time'),
				'type' => 'text',
				'name' => 'endtime',
				'class' => 'short'
			),
			array(
				'label' => gettext('Duration (minutes)'),
				'type' => 'number',
				'name' => 'duration',
				'class' => 'short',
				'disabled' => true
			),
			array(
				'label' => gettext('Art'),
				'type' => 'select',
				'name' => 'art',
				'options' => array()
			)
		)
	),
	'person' => array(
		'legend' => gettext('Person'),
		'info' => gettext('Add a person to the people list that is used for teachers and contacts'),
		'buttons' => array(
			'send' => gettext('Send Person'),
			'clear' => gettext('Clear')
		),
		'items' => array(
			array(
				'label' => gettext('Name'),
				'type' => 'text',
				'name' => 'title'
			),
			array(
				'label' => gettext('Art'),
				'type' => 'text',
				'name' => 'art'
			),
			array(
				'label' => gettext('Contact'),
				'type' => 'text',
				'name' => 'contact'
			),
			array(
				'label' => gettext('Info'),
				'type' => 'text',
				'name' => 'info'
			)
		)
	),
	'login' => array(
		'legend' => gettext('Login'),
		'info' => gettext('After logging in, the features of this site will be enriched'),
		'buttons' => array(
			'send' => gettext('Login')
		),
		'items' => array(
			array(
				'label' => gettext('E-mail'),
				'type' => 'email',
				'name' => 'email',
				'required' => true
			),
			array(
				'label' => gettext('Password'),
				'type' => 'text',
				'name' => 'password',
				'required' => true
			),
			array(
				'label' => gettext('How much is 2 + 3'), // always total 5
				'type' => 'text',
				'class' => 'short',
				'name' => 'answer',
				'after' => gettext(' (making sure you are a real person)')
			)
		),
		'links' => array(
			'facebook' => gettext('Login via Facebook account'),
			'openid' => gettext('Login with OpenID'),
			'twitter' => gettext('Login via Twitter account')
		)
	),
	'user' => array(
		'legend' => gettext('Profile'),
		'info' => gettext('Please keep your personal profile up to date and relevant'),
		'buttons' => array(
			'send' => gettext('Update profile')
		),
		'items' => array(
			array(
				'label' => gettext('E-mail'),
				'type' => 'email',
				'name' => 'email'
			),
			array(
				'label' => gettext('Full name'),
				'type' => 'text',
				'name' => 'title'
			),
			array(
				'label' => gettext('Password'),
				'type' => 'text',
				'name' => 'password',
				'after' => gettext(' (fill if you wish to change, else leave empty)')
			)
		)
	),
	'register' => array(
		'legend' => gettext('Register'),
		'info' => gettext('Registration to this site enables to use all the features'),
		'buttons' => array(
			'send' => gettext('Register user'),
			'clear' => gettext('Clear')
		),
		'items' => array(
			array(
				'label' => gettext('E-mail'),
				'type' => 'email',
				'name' => 'email'
			),
			array(
				'label' => gettext('Full name'),
				'type' => 'text',
				'name' => 'title'
			),
			array(
				'label' => gettext('Password'),
				'type' => 'text',
				'name' => 'password'
			),
			array(
				'label' => gettext('How much is 3 + 2'), // always total 5
				'type' => 'text',
				'class' => 'short',
				'name' => 'answer',
				'after' => gettext(' (making sure you are a real person)')
			)
		)
	),
	'export' => array(
		'legend' => gettext('Export settings'),
		'info' => gettext('Set here the properties for the output of your list of saved trainings'),
		'buttons' => array(
			'send' => gettext('Update settings')
		),
		'items' => array(
			array(
				'label' => gettext('Map type'),
				'type' => 'select',
				'name' => 'maptype',
				'options' => array(
					'roadmap' => gettext('Roadmap'),
					'satellite' => gettext('Satellite'),
					'hybrid' => gettext('Hybdid (roadmap & satellite)'),
					'terrain' => gettext('Terrain')
				)
			),
			array(
				'label' => gettext('Language'),
				'type' => 'select',
				'name' => 'language',
				'options' => array(
					'en' => gettext('English (British)'),
					'fi' => gettext('Finnish')
					'fr' => gettext('French'),
					'it' => gettext('Italian'),
					'ja' => gettext('Japanese'),
					'sl' => gettext('Slovenian')
				)
			),
			array(
				'label' => gettext('Image format'),
				'type' => 'select',
				'name' => 'format',
				'options' => array(
					'png8' => 'png 8-bit',
					'png32' => 'png 32-bit',
					'gif' => 'gif',
					'jpg' => 'jpeg',
					'jpg-baseline' => 'jpeg baseline'
				)
			),
			array(
				'label' => gettext('Zoom level'),
				'type' => 'text',
				'name' => 'zoom',
				'class' => 'short',
				'after' => gettext(' (0...16)'),
				'value' => gettext('14')
			),
			array(
				'label' => gettext('Image size'),
				'type' => 'text',
				'name' => 'size',
				'class' => 'short',
				'after' => gettext(' (Width x Height)'),
				'value' => gettext('300x300')
			),
			array(
				'label' => gettext('Colour'),
				'type' => 'text',
				'name' => 'color',
				'class' => 'short',
				'after' => gettext(' (hex value or a string)'),
				'value' => gettext('0x55FF55')
			),
			array(
				'label' => gettext('Label'),
				'type' => 'text',
				'name' => 'label',
				'class' => 'short',
				'after' => gettext(' (one character only)'),
				'value' => gettext('X')
			)
		)
	)
);



/**
 * Bottom area table for saved items which then can be exported as a list with static maps.
 */
$lang['savedtable'] = array(
	'summary' => gettext('A list of saved trainings'),
	'caption' => gettext('A list of saved trainings'),
	'thead' => array (
		'art' => gettext('Martial art'),
		'weekday' => gettext('Weekday'),
		'time' => gettext('Time'),
		'remove' => gettext('Remove')
	),
	'tbody' => array() // needed for creating an empty tbody where items are filled
);


/**
 * Shortcut links for selecting inverse, all or nothing of the checkboxes.
 */
$lang['selectionshortcuts'] = array(
	'all' => gettext('Select all'),
	'none' => gettext('Select none'),
	'inverse' => gettext('Inverse selection')
);

/**
 * Links for navigation at the right side of the page.
 */
$lang['navigation'] = array(
	'filters' => array(
		'title' => gettext('Map filters'),
		'text' => gettext('filters'),
		'access' => 0
	),
	'training' => array(
		'title' => gettext('Training creation'),
		'text' => gettext('training'),
		'access' => 8
	),
	'location' => array(
		'title' => gettext('Location creation'),
		'text' => gettext('location'),
		'access' => 16
	),
	'art' => array(
		'title' => gettext('Martial art addition'),
		'text' => gettext('art'),
		'access' => 32
	),
	'user' => array(
		'title' => gettext('Profile editing'),
		'text' => gettext('profile'),
		'access' => 1
	),
	'login' => array(
		'title' => gettext('Login'),
		'text' => gettext('login'),
		'access' => 0
	),
	'register' => array(
		'title' => gettext('Register'),
		'text' => gettext('register'),
		'access' => 0
	),
	'logout' => array(
		'title' => gettext('Logout'),
		'text' => gettext('logout'),
		'access' => 1
	)
);
