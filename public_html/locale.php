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
--width=90 \
--language=PHP \
--from-code=UTF-8 \
--copyright-holder="Jukka Paasonen" \
--package-name=RENSHUU.PAAZMAYA.COM \
--package-version=0.8.11.452 \
--strict \
--debug \
index.php locale.php

mv renshuuSuruToki.po renshuuSuruToki.pot

msgfmt -o renshuuSuruToki.mo renshuuSuruToki.po


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

$lang = array(
	'language' => gettext('en')
);


$lang['title'] = '';
$lang['description'] = '';

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
			'type' => gettext(''), input types or select
			'name' => gettext(''), name of the field
			'class' => gettext('' style class
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
*/
$lang['forms'] = array(
	'art' => array(
		'legend' => gettext('Art'),
		'info' => gettext(''),
		'buttons' => array(
			'send' => gettext('Send Martial art'),
			'clear' => gettext('Clear')
		),
		'items' => array(
			array(
				'label' => gettext('Name'),
				'type' => gettext('text'),
				'name' => gettext('title'
			),
			array(
				'label' => gettext('URI'),
				'type' => gettext('text'),
				'name' => gettext('uri')
			)
		)
	),
	'location' => array(
		'legend' => gettext('Location'),
		'info' => gettext(''),
		'buttons' => array(
			'send' => gettext('Send Location'),
			'clear' => gettext('Clear')
		),
		'items' => array(
			array(
				'label' => gettext('Title'),
				'type' => gettext('text'),
				'name' => gettext('title')
			),
			array(
				'label' => gettext('URI'),
				'type' => gettext('text'),
				'name' => gettext('uri')
			),
			array(
				'label' => gettext('Info'),
				'type' => gettext('text'),
				'name' => gettext('info')
			),
			array(
				'label' => gettext('Address(if any)'),
				'type' => gettext('text'),
				'name' => gettext('address')
			),
			array(
				'label' => gettext('Geocode'),
				'type' => gettext('radio'),
				'name' => gettext('geocode'),
				'options' => array(
					'none' => gettext('none'),
					'address' => gettext('address'),
					'position' => gettext('position')
				),
				'after' => gettext(' (address from map position)')
			),
			array(
				'label' => gettext('Latitude'),
				'type' => gettext('text'),
				'name' => gettext('latitude'),
				'disabled' => true
			),
			array(
				'label' => gettext('Longitude'),
				'type' => gettext('text'),
				'name' => gettext('longitude'),
				'disabled' => true
			)
		)
	),
	'training' => array(
		'legend' => gettext('Training'),
		'info' => gettext(''),
		'buttons' => array(
			'send' => gettext('Send Martial art'),
			'clear' => gettext('Clear')
		),
		'items' => array(
			array(
				'label' => gettext('Title'),
				'type' => gettext('text'),
				'name' => gettext('title')
			),
			array(
				'label' => gettext('Location'),
				'type' => gettext('text'),
				'name' => gettext('location')
			),
			array(
				'label' => gettext('Weekday'),
				'type' => gettext('select'),
				'name' => gettext('weekday'),
				'options' => array()
			),
			array(
				'label' => gettext('Occurance'),
				'type' => gettext('text'),
				'name' => gettext('occurance')
			),
			array(
				'label' => gettext('Start time'),
				'type' => gettext('text'),
				'name' => gettext('starttime'),
				'class' => gettext('short')
			),
			array(
				'label' => gettext('End time'),
				'type' => gettext('text'),
				'name' => gettext('endtime'),
				'class' => gettext('short')
			),
			array(
				'label' => gettext('Duration (minutes)'),
				'type' => gettext('text'),
				'name' => gettext('duration'),
				'class' => gettext('short'),
				'disabled' => true
			),
			array(
				'label' => gettext('Art'),
				'type' => gettext('select'),
				'name' => gettext('art'),
				'options' => array()
			)
		)
	),
	'person' => array(
		'legend' => gettext('Person'),
		'info' => gettext(''),
		'buttons' => array(
			'send' => gettext('Send Martial art'),
			'clear' => gettext('Clear')
		),
		'items' => array(
			array(
				'label' => gettext('Name'),
				'type' => gettext('text'),
				'name' => gettext('title')
			),
			array(
				'label' => gettext('Art'),
				'type' => gettext('text'),
				'name' => gettext('art')
			),
			array(
				'label' => gettext('Contact'),
				'type' => gettext('text'),
				'name' => gettext('contact')
			),
			array(
				'label' => gettext('Info'),
				'type' => gettext('text'),
				'name' => gettext('info')
			)
		)
	),
	'login' => array(
		'legend' => gettext('Login'),
		'info' => gettext(''),
		'buttons' => array(
			'send' => gettext('Login')
		),
		'items' => array(
			array(
				'label' => gettext('E-mail'),
				'type' => gettext('text'),
				'name' => gettext('email')
			),
			array(
				'label' => gettext('Password'),
				'type' => gettext('text'),
				'name' => gettext('password')
			),
			array(
				'label' => gettext('How much is 2 + 3'), // always total 5
				'type' => gettext('text'),
				'class' => gettext('short'),
				'name' => gettext('answer'),
				'after' => gettext(' (making sure you are a real person)')
			)
		),
		'links' => array(
			'facebook' => gettext(''),
			'openid' => gettext(''),
			'twitter' => gettext('Login via your Twitter account')
		)
	),
	'user' => array(
		'legend' => gettext('Profile'),
		'info' => gettext(''),
		'buttons' => array(
			'send' => gettext('Update profile')
		),
		'items' => array(
			array(
				'label' => gettext('E-mail'),
				'type' => gettext('text'),
				'name' => gettext('email')
			),
			array(
				'label' => gettext('Full name'),
				'type' => gettext('text'),
				'name' => gettext('title')
			),
			array(
				'label' => gettext('Password'),
				'type' => gettext('text'),
				'name' => gettext('password'),
				'after' => gettext(' (fill if you wish to change, else leave empty)')
			)
		)
	),
	'register' => array(
		'legend' => gettext('Register'),
		'info' => gettext(''),
		'buttons' => array(
			'send' => gettext('Register user'),
			'clear' => gettext('Clear')
		),
		'items' => array(
			array(
				'label' => gettext('E-mail'),
				'type' => gettext('text'),
				'name' => gettext('email')
			),
			array(
				'label' => gettext('Full name'),
				'type' => gettext('text'),
				'name' => gettext('title')
			),
			array(
				'label' => gettext('Password'),
				'type' => gettext('text'),
				'name' => gettext('password')
			),
			array(
				'label' => gettext('How much is 3 + 2'), // always total 5
				'type' => gettext('text'),
				'class' => gettext('short'),
				'name' => gettext('answer'),
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
				'type' => gettext('select'),
				'name' => gettext('maptype'),
				'options' => array(
					'roadmap' => gettext('Roadmap'),
					'satellite' => gettext('Satellite'),
					'hybrid' => gettext('Hybdid (roadmap & satellite)'),
					'terrain' => gettext('Terrain')
				)
			),
			array(
				'label' => gettext('Language'),
				'type' => gettext('select'),
				'name' => gettext('language'),
				'options' => array(
					'ja' => gettext('Japanese'),
					'en' => gettext('English'),
					'fi' => gettext('Finnish')
				)
			),
			array(
				'label' => gettext('Image format'),
				'type' => gettext('select'),
				'name' => gettext('format'),
				'options' => array(
					'png8' => gettext('png 8-bit'),
					'png32' => gettext('png 32-bit'),
					'gif' => gettext('gif'),
					'jpg' => gettext('jpeg'),
					'jpg-baseline' => gettext('jpeg baseline')
				)
			),
			array(
				'label' => gettext('Zoom level'),
				'type' => gettext('text'),
				'name' => gettext('zoom'),
				'class' => gettext('short'),
				'after' => gettext(' (0...16)'),
				'value' => gettext('14')
			),
			array(
				'label' => gettext('Image size'),
				'type' => gettext('text'),
				'name' => gettext('size'),
				'class' => gettext('short'),
				'after' => gettext(' (WxH)'),
				'value' => gettext('300x300')
			),
			array(
				'label' => gettext('Colour'),
				'type' => gettext('text'),
				'name' => gettext('color'),
				'class' => gettext('short'),
				'after' => gettext(' (hex value or a string)'),
				'value' => gettext('0x55FF55')
			),
			array(
				'label' => gettext('Label'),
				'type' => gettext('text'),
				'name' => gettext('label'),
				'class' => gettext('short'),
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


/**
 * Lastly the items needed for javascript
 */
$lang['javascript'] = array(
	'license' => gettext('License information'),
	'' => gettext(''),
	'' => gettext(''),
	'' => gettext(''),
);