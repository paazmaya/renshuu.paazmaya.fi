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
		$.blockUI.defaults.css.width = '50%';

		$('form').on('submit', function () {
			renshuuForms.submitForm($(this));
			return false;
		});

		// Geocode 
		$('form input:button[name="search"]').on('click', function () {
			console.log('Why not do some geocoding? TODO');
			return false;
		});

		$('#profile_form input[name="email"]').val(renshuuMain.userEmail);
		$('#profile_form input[name="title"]').val(renshuuMain.userName);

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

		// Change icon based on geocode direction
		$('#location_form input:radio[name="geocode"]').on('change', function () {
			renshuuForms.updateGeocodeSelectionIcon();
		});
		if (localStorage.getItem('locationGeocode')) {
			$('#location_form input:radio[name="geocode"]').removeAttr('checked');
			$('#location_form input:radio[name="geocode"][value="' + localStorage.getItem('locationGeocode') + '"]').attr('checked', 'checked');
		}
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
		console.dir(serialized);

		var len = serialized.length;
		var items = {};
		for (var i = 0; i < len; ++i) {
			items[serialized[i].name] = serialized[i].value;
		}
		// http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2
		$form.find(':disabled').each(function () {
			items[$(this).attr('name')] = $(this).val();
		});
		var post = { items: items };
		var ref = $form.data('ref'); // 0 = inserting new, any other = update
		var key = $form.data('key'); // insert or update
		post[key] = ref;

		// Change temporarily the layout of the submit button / form for visual feedback
		
		$form.block({
			message: '<div id="formfeedback">' + $('#sendingTemplate').render() + '</div>'
		});
		
		// Just once, removed after
		$('#formfeedback a').live('click', function () {
			var dattr = $(this).data(); // the data that came via response
			console.dir(dattr);
			
			if (dattr.action == 'clear') {
				$form.get(0).reset();
			}
			else if (dattr.action == 'keep') {
			}
			$form.data('ref', dattr.ref);
			$form.data('key', dattr.key);

			$('#formfeedback a').die('click');
			$form.unblock(); // Should destroy #formfeedback...
			return false;
		});
		
		// When this AJAX call returns, it will replace the content of the above created div.
		$.post($form.attr('action'), post, function (data, status) {
			console.log('form submit. status: ' + status);
			console.dir(data);
			if (data.error) {
			}
			else {
				renshuuForms.afterSubmission(data);
			}
		}, 'json');

		console.groupEnd();
	},
	
	/**
	 * After submitting a form, and once the data has been received at the back end,
	 * there might be a need to touch the DOM based on insert or update action.
	 */
	afterSubmission: function (data) {
		console.group('afterSubmission');
		
		// Insert/update the new data to any related lists...
		if (data.type == 'art') {
			var filterarts = $('#filter_arts input[name="art_' + data.result.id + '"]');
			var selectarts = $('select[name="art"] option[value="' + data.result.id + '"');
			console.log('filterarts.size: ' + filterarts.size() + ', selectarts.size: ' + selectarts.size());
			if (filterarts.size() == 1 || selectarts.size() == 1) {
				// update
				var checkbox = filterarts.outerHtml();
				filterarts.parent('label').html(checkbox + data.result.title); // works
				selectarts.each(function () {
					$(this).html(data.result.title);
				});
			}
			else {
				// insert		
				$('#filter_arts').prepend($('#unorderedTemplate').render(data.result)); // filter list
				$('select[name="art"] > option:first-child').after($('#selectTemplate').render(data.result)); // select option
			}
		}
		else if (data.type == 'location' || data.type == 'person') {
			var select = $('select[name="' + data.type + '"] > option[value="' + data.result.id + '"');
			console.log('select.size: ' + select.size());
			if (select.size() == 1) {
				// update
				select.each(function () {
					$(this).html(data.result.title);
				});
			}
			else {
				// insert
				$('select[name="' + data.type + '"] > option:first-child').after($('#selectTemplate').render(data.result)); // select option
			}
		}
		else if (data.type == 'training') {
			// add to the map
		}
		else if (data.type == 'profile') {
		}

		$('#formfeedback').attr('class', 'icon icon-alert');

		$('#formfeedback').html($('#feedbackTemplate').render(data.result));

		console.groupEnd();
	},

	/**
	 * Set the icon next to the radio buttons in the location form
	 */
	updateGeocodeSelectionIcon: function () {
		console.group('updateGeocodeSelectionIcon');
		if ($('#location_form').size() > 0) {
			var val = $('#location_form input:radio[name="geocode"]:checked').val();
			console.log('val: ' + val);
			$('#location_form .radioset').attr('class', 'radioset').addClass('icon-' + renshuuMain.geocodeClass[val]); // remove icon-* and add icon-*
			localStorage.setItem('locationGeocode', val);
			renshuuMap.geocodeBasedOn = val;
		}
		console.groupEnd();
	}
};

