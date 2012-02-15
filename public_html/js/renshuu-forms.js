/**
 * Renshuu Forms
 */
var renshuuForms = {
	
	/**
	 * Form types
	 */
	types: ['art', 'location', 'training', 'person', 'profile'],
	
	/**
	 * Event listener setup
	 */
	init: function() {

		// Note that either "insert" = 0 or "update" = id must be set in the root data...
		$('form').live('submit', function () {
			renshuuForms.submitForm($(this));
			return false;
		});

		$('form input:button[name="send"]').live('click', function () {
			$(this).parents('form').first().submit();
			return false;
		});

		$('form input:button[name="clear"]').live('click', function () {
			$(this).parents('form').first().reset();
			return false;
		});
		
		// Change icon based on geocode direction
		$('#location_form input:radio[name="geocode"]').live('change', function () {
			renshuuForms.updateGeocodeSelectionIcon();
		});

		// Special care for the export settings form, in order to update its preview
		$('#export_form input, #export_form select').live('change', function (){
			renshuuMain.updateExportPreview();
		});
		
		// Initial load...
		//renshuuMain.updateExportPreview();
	},
	
	/**
	 * Form submission via AJAX
	 */
	submitForm: function($form) {
		console.group('submitForm');
		
		var id = $form.attr('id');
		console.log('submit. id: ' + id);
		
		// http://api.jquery.com/serializeArray/
		var serialized = $form.serializeArray();
		console.log('serialized: ' + serialized);

		var len = serialized.length;
		var items = {};
		for (var i = 0; i < len; ++i) {
			items[serialized[i].name] = serialized[i].value;
		}
		var post = { items: items };
		var ref = $form.data('ref'); // 0 = inserting new, any other = update
		var key = $form.data('key'); // insert or update
		post[key] = ref;

		// Change temporarily the layout of the submit button / form for visual feedback
		/*
		$('#' + id).block({
			message: '<div id="formfeedback"><h1 title="' +
				renshuuMain.lang.form.sending + '">' +
				renshuuMain.lang.form.sending + '</h1></div>'
		});
		*/
		// When this AJAX call returns, it will replace the content of the above created div.
		$.post($form.attr('action'), post, function (data, status) {
			console.log('form submit. status: ' + status);
			console.dir(data);
			var res = {};
			if (data.response && data.response.result) {
				res = data.response.result;
			}

			var classes = 'icon error icon-alert';
			$('#formfeedback').attr('class', classes);

			$('#feedbackTemplate').tmpl(res).replaceAll('#formfeedback');

			$('#formfeedback a[rel]').one('click', function () {
				var dattr = $(this).data();		
				if (dattr.action == 'clear') {
					$('#' + id).get(0).reset();
				}
					
				$('#' + id).data('ref', dattr.ref);
				$('#' + id).data('key', dattr.key);
	
				$('#' + id).unblock(); // Should destroy #formfeedback...
				return false;
			});
		}, 'json');
		
		console.groupEnd();
	},

	/**
	 * Form contains the form element with the requested input fields.
	 * @see http://code.drewwilson.com/entry/autosuggest-jquery-plugin
	 */
	setForm: function (type) {
		var form = '#' + type + '_form';
		
		// Always empty and ready to insert a new.
		$(form).data('ref', 0);
		$(form).data('key', 'insert');

		// If location form is used, check the possible cookie.
		if (type == 'location' && localStorage.getItem('locationGeocode')) {
			$(form + ' input:radio[name="geocode"]').removeAttr('checked');
			$(form + ' input:radio[name="geocode"][value="' + localStorage.getItem('locationGeocode') + '"]').attr('checked', 'checked');
		}
		else if (type == 'profile') {
			// Data should be prefilled in "renshuuMain.userData" object.
			var userData = renshuuMain.userData;
			if (userData) {
				$(form + ' input[name="email"]').val(userData.email);
				$(form + ' input[name="title"]').val(userData.name);
			}
		}

		// http://fredibach.ch/jquery-plugins/inputnotes.php
		/*
		$(form).find('input[name="title"]').inputNotes({
			config: {
				containerTag: 'ul',
				noteTag: 'li'
			},
			minlength: {
				pattern: /^(.){0,4}$/i,
				type: 'info',
				text: renshuuMain.lang.validate.minlength
			},

			requiredfield: {
				pattern: /(^(\s)+$)|(^$)/,
				type: 'warning',
				text: renshuuMain.lang.validate.requiredfield
			},

			email: {
				pattern: /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+$/,
				type: 'info',
				text: 'Yes, that\'s a valid email address!'
			}
		});

		*/


		// http://code.google.com/p/jquerytimepicker/
		$(form).find('input[name="starttime"]').timePicker();

		// http://www.jnathanson.com/index.cfm?page=jquery/clockpick/ClockPick
		$(form).find('input[name="endtime"]').clockpick();
	},

	/**
	 * Set the icon next to the radio buttons in the location form
	 */
	updateGeocodeSelectionIcon: function () {
		console.group('updateGeocodeSelectionIcon');
		if ($('#location_form').length > 0) {
			var val = $('#location_form input:radio[name="geocode"]:checked').val();
			console.log('val: ' + val);
			$('#location_form .radioset').attr('class', 'radioset').addClass('icon-' + renshuuMain.geocodeClass[val]); // remove icon-* and add icon-*
			localStorage.setItem(
				'locationGeocode',
				val
			);
			renshuuMain.geocodeBasedOn = val;
		}
		console.groupEnd();
	}
};