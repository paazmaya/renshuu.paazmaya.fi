<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/
$lang = array(
	'language' => 'en'
);


/*
zero indexed, starting from sunday
*/
$lang['weekdays'] = array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

/*
FORMS

No need to define those properties which are defaults as described below.
Required items are: label, type, name, and both items in the buttons.
Only non empty values will be used.

'' => array(
	'legend' => '',
	'info' => '',
	'buttons' => array(
		'send' => '',
		'close' => '' If empty, no button will be shown
	),
	'items' => array(
		array(
			'label' => '', label text before the element
			'type' => '', input types or select
			'name' => '', name of the field
			'class' => '' style class
			'disabled' => false, disabled="disabled" will be written if true
			'after' => '', text after the element but before the label closes
			'value' => '', value of the input element if any
			'options' => array() options used in the case of select: value => visible text
		)
	)
)
*/
$lang['forms'] = array(
	'art' => array(
		'legend' => 'Art',
		'info' => '',
		'buttons' => array(
			'send' => 'Send Martial art',
			'close' => 'Close'
		),
		'items' => array(
			array(
				'label' => 'Name',
				'type' => 'text',
				'name' => 'title'
			),
			array(
				'label' => 'URI',
				'type' => 'text',
				'name' => 'uri'
			)
		)
	),
	'location' => array(
		'legend' => 'Location',
		'info' => '',
		'buttons' => array(
			'send' => 'Send Location',
			'close' => 'Close'
		),
		'items' => array(
			array(
				'label' => 'Title',
				'type' => 'text',
				'name' => 'title'
			),
			array(
				'label' => 'URI',
				'type' => 'text',
				'name' => 'uri'
			),
			array(
				'label' => 'Info',
				'type' => 'text',
				'name' => 'info'
			),
			array(
				'label' => 'Address(if any)',
				'type' => 'text',
				'name' => 'address'
			),
			array(
				'label' => 'Geocode',
				'type' => 'radio',
				'name' => 'geocode',
				'options' => array(
					'none' => 'none',
					'address' => 'address',
					'position' => 'position'
				),
				'after' => ' (address from map position)'
			),
			array(
				'label' => 'Latitude',
				'type' => 'text',
				'name' => 'latitude',
				'disabled' => true
			),
			array(
				'label' => 'Longitude',
				'type' => 'text',
				'name' => 'longitude',
				'disabled' => true
			)
		)
	),
	'training' => array(
		'legend' => 'Training',
		'info' => '',
		'buttons' => array(
			'send' => 'Send Martial art',
			'close' => 'Close'
		),
		'items' => array(
			array(
				'label' => 'Title',
				'type' => 'text',
				'name' => 'title'
			),
			array(
				'label' => 'Location',
				'type' => 'text',
				'name' => 'location'
			),
			array(
				'label' => 'Weekday',
				'type' => 'select',
				'name' => 'weekday',
				'options' => array()
			),
			array(
				'label' => 'Occurance',
				'type' => 'text',
				'name' => 'occurance'
			),
			array(
				'label' => 'Start time',
				'type' => 'text',
				'name' => 'starttime',
				'class' => 'short'
			),
			array(
				'label' => 'End time',
				'type' => 'text',
				'name' => 'endtime',
				'class' => 'short'
			),
			array(
				'label' => 'Duration (minutes)',
				'type' => 'text',
				'name' => 'duration',
				'class' => 'short',
				'disabled' => true
			),
			array(
				'label' => 'Art',
				'type' => 'select',
				'name' => 'art',
				'options' => array()
			)
		)
	),
	'person' => array(
		'legend' => 'Person',
		'info' => '',
		'buttons' => array(
			'send' => 'Send Martial art',
			'close' => 'Close'
		),
		'items' => array(
			array(
				'label' => 'Name',
				'type' => 'text',
				'name' => 'title'
			),
			array(
				'label' => 'Art',
				'type' => 'text',
				'name' => 'art'
			),
			array(
				'label' => 'Contact',
				'type' => 'text',
				'name' => 'contact'
			),
			array(
				'label' => 'Info',
				'type' => 'text',
				'name' => 'info'
			)
		)
	),
	'login' => array(
		'legend' => 'Login',
		'info' => '',
		'buttons' => array(
			'send' => 'Login',
			'close' => 'Close'
		),
		'items' => array(
			array(
				'label' => 'E-mail',
				'type' => 'text',
				'name' => 'email'
			),
			array(
				'label' => 'Password',
				'type' => 'text',
				'name' => 'password'
			),
			array(
				'label' => 'How much is 2 + 3',
				'type' => 'text',
				'class' => 'short',
				'name' => 'answer',
				'after' => ' (making sure you are a real person)'
			)
		)
	),
	'profile' => array(
		'legend' => 'Profile',
		'info' => '',
		'buttons' => array(
			'send' => 'Update profile',
			'close' => 'Close'
		),
		'items' => array(
			array(
				'label' => 'E-mail',
				'type' => 'text',
				'name' => 'email'
			),
			array(
				'label' => 'Full name',
				'type' => 'text',
				'name' => 'title'
			),
			array(
				'label' => 'Password',
				'type' => 'text',
				'name' => 'password'
			),
			array(
				'label' => 'How much is 5 - 3',
				'type' => 'text',
				'class' => 'short',
				'name' => 'answer',
				'after' => ' (making sure you are a real person)'
			)
		)
	),
	'export' => array(
		'legend' => 'Export settings',
		'info' => 'Set here the properties for the output of your list of saved trainings',
		'buttons' => array(
			'send' => 'Update settings'
		),
		'items' => array(
			array(
				'label' => 'Map type',
				'type' => 'select',
				'name' => 'maptype',
				'options' => array(
					'roadmap' => 'Roadmap',
					'satellite' => 'Satellite',
					'hybrid' => 'Hybdid (roadmap & satellite)',
					'terrain' => 'Terrain'
				)
			),
			array(
				'label' => 'Language',
				'type' => 'select',
				'name' => 'language',
				'options' => array(
					'ja' => 'Japanese',
					'en' => 'English',
					'fi' => 'Finnish'
				)
			),
			array(
				'label' => 'Image format',
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
				'label' => 'Zoom level',
				'type' => 'text',
				'name' => 'zoom',
				'class' => 'short',
				'after' => ' (0...16)',
				'value' => '14'
			),
			array(
				'label' => 'Image size',
				'type' => 'text',
				'name' => 'size',
				'class' => 'short',
				'after' => ' (WxH)',
				'value' => '300x300'
			),
			array(
				'label' => 'Colour',
				'type' => 'text',
				'name' => 'color',
				'class' => 'short',
				'after' => ' (hex value or a string)',
				'value' => '0x55FF55'
			),
			array(
				'label' => 'Label',
				'type' => 'text',
				'name' => 'label',
				'class' => 'short',
				'after' => ' (one character only)',
				'value' => 'X'
			)
		)
	)
);



/**
 * Bottom area table for saved items which then can be exported as a list with static maps.
 */
$lang['savedtable'] = array(
	'summary' => 'A list of saved trainings',
	'caption' => 'A list of saved trainings',
	'thead' => array (
		'art' => 'Martial art',
		'weekday' => 'Weekday',
		'time' => 'Time',
		'remove' => 'Remove'
	),
	'tbody' => array() // needed for creating an empty tbody where items are filled
);


/**
 * Shortcut links for selecting inverse, all or nothing of the checkboxes.
 */
$lang['selectionshortcuts'] = array(
	'all' => 'Select all',
	'none' => 'Select none',
	'inverse' => 'Inverse selection'
);

/**
 * Links for navigation at the right side of the page.
 */
$lang['navigation'] = array(
	'filters' => array(
		'title' => 'Map filters',
		'text' => 'filters',
		'access' => 0
	),
	'location' => array(
		'title' => 'Location creation',
		'text' => 'location',
		'access' => 0
	),
	'art' => array(
		'title' => 'Martial art addition',
		'text' => 'art',
		'access' => 0
	),
	'profile' => array(
		'title' => 'Profile editing',
		'text' => 'profile',
		'access' => 0
	),
	'login' => array(
		'title' => 'Login',
		'text' => 'login',
		'access' => 0
	)
);


/**
 * Items needed for the index, which are not within the scope of any other set.
 */
$lang['index'] = array(
	'header' => array(
		'map' => 'Training locations',
		'streetview' => 'Street View',
		'savedlist' => 'Saved list',
		'export' => 'Export settings'
	),
	'' => 'toggle SV',
	'' => 'Google Maps V3',
	'' => 'Google Maps Street View',
	'' => '',
);
