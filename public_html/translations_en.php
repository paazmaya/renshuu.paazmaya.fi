<?php
/*******************
RENSHUU.PAAZMAYA.COM
*******************/
$lang = array();


/*
zero indexed, starting from sunday
*/
$lang['weekdays'] = array('日曜日', '月?曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日');

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
				'label' => 'Auto fill',
				'type' => 'checkbox',
				'name' => 'addr_autofill',
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
				'class' => 'numeric'
			),
			array(
				'label' => 'End time',
				'type' => 'text',
				'name' => 'endtime',
				'class' => 'numeric'
			),
			array(
				'label' => 'Duration (minutes)',
				'type' => 'text',
				'name' => 'duration',
				'class' => 'numeric',
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
			'send' => 'Send Martial art',
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
				'type' => 'checkbox',
				'name' => 'answer',
				'class' => 'numeric',
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
				'type' => 'checkbox',
				'name' => 'answer',
				'class' => 'numeric',
				'after' => ' (making sure you are a real person)'
			)
		)
	)
);


