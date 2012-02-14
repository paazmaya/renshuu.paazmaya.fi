/**
 * Renshuu Forms
 */
var renshuuForms = {
	
	/**
	 * Save the earlierly fetched form elements with callbacks once set.
	 */
	cache: {},

	/**
	 * Form types
	 */
	types: ['art', 'location', 'training', 'person', 'user', 'login'],
	
	/**
	 * Event listener setup
	 */
	init: function() {
		

		// Note that either "insert" = 0 or "update" = id must be set in the root data...
		$('form').live('submit', function () {
			var id = $(this).attr('id');
			console.log('submit. id: ' + id);
			if (id === 'login_form') {
				return true;
			}
			// http://api.jquery.com/serializeArray/
			var serialized = $(this).serializeArray();
			console.log('form submit. serialized: ' + serialized);

			var len = serialized.length;
			var items = {};
			for (var i = 0; i < len; ++i) {
				items[serialized[i].name] = serialized[i].value;
			}
			var post = { items: items };
			var ref = $(this).data('ref'); // 0 = inserting new, any other = update
			var key = $(this).data('key'); // insert or update
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
			$.post($(this).attr('action'), post, function (data, status) {
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

			return false;
		});

		$('form input:button[name=send]').live('click', function () {
			$(this).parents('form').first().submit();
			return false;
		});

		$('form input:button[name=clear]').live('click', function () {
			$(this).parents('form').first().reset();
			return false;
		});
		
		// Change icon based on geocode direction
		$('#location_form input:radio[name=geocode]').live('change', function () {
			renshuuMain.updateGeocodeSelectionIcon();
		});

		// Special care for the export settings form, in order to update its preview
		$('#export_form input, #export_form select').live('change', function (){
			renshuuMain.updateExportPreview();
		});
		
		// Initial load...
		//renshuuMain.updateExportPreview();
	},

	/**
	 * Six types available: art, location, training, person, user, login
	 * @see
	 */
	getForm: function (type) {
		if (renshuuForms.cache[type]) {
			renshuuForms.showForm(type);
		}
		else {
			$.post('/ajax/form/' + type, function (data, status) {
				//console.dir(data);
				if (data.response && data.response.form) {
					renshuuForms.setForm(data.response.form, type);
					renshuuForms.showForm(type);
				}
			}, 'json');
		}
	},

	/**
	 * Form contains the form element with the requested input fields.
	 * @see http://code.drewwilson.com/entry/autosuggest-jquery-plugin
	 */
	setForm: function (form, type) {

		$(form).find('input[name=location]').autoSuggest(
			'/ajax/get/' + 'location', {
				startText: renshuuMain.lang.suggest.location,
				selectedItemProp: 'id',
				searchObjProps: 'title'
			}
		);
		$(form).find('input[name=art]').autoSuggest(
			'/ajax/get/' + 'art', {
				minChars: 2,
				matchCase: false,
				startText: renshuuMain.lang.suggest.art,
				selectedItemProp: 'name',
				selectedValuesProp: 'id',
				searchObjProps: 'name',
				queryParam: '/',
				selectionLimit: 2,
				//selectionClick: function (elem){ elem.fadeTo("slow", 0.33); },
				//selectionAdded: function (elem){ elem.fadeTo("slow", 0.33); },
				//selectionRemoved: function (elem){ elem.fadeTo("fast", 0, function (){ elem.remove(); }); },
				resultClick: function (data){
					for (var i in data.attributes) {
						console.log('resultClick - ' + i + ' = ' + data.attributes[i]);
					}
				}
			}
		);



		// http://fredibach.ch/jquery-plugins/inputnotes.php
		/*
		$(form).find('input[name=title]').inputNotes({
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
		$(form).find('input[name=starttime]').timePicker();

		// http://www.jnathanson.com/index.cfm?page=jquery/clockpick/ClockPick
		$(form).find('input[name=endtime]').clockpick();

		$(form).find('fieldset').corner();


		renshuuForms.cache[type] = form;
	},

	/**
	 * Set the icon next to the radio buttons in the location form
	 */
	updateGeocodeSelectionIcon: function () {
		console.group('updateGeocodeSelectionIcon');
		if ($('#location_form').length > 0) {
			var val = $('#location_form input:radio[name=geocode]:checked').val();
			console.log('val: ' + val);
			$('#location_form .radioset').attr('class', 'radioset').addClass('icon-' + renshuuMain.geocodeClass[val]); // remove icon-* and add icon-*
			localStorage.setItem(
				'locationGeocode',
				val
			);
			renshuuMain.geocodeBasedOn = val;
		}
		console.groupEnd();
	},

	/**
	 *
	 * @see
	 */
	showForm: function (type) {
		var form = renshuuForms.cache[type];
		// Always empty and ready to insert a new.
		$(form).data('ref', 0);
		$(form).data('key', 'insert');
		$(renshuuMain.tabContentElement).contents().detach(); // clean but save
		$(renshuuMain.tabContentElement).html(form);

		// If location form is used, check the possible cookie.
		if (type == 'location' && localStorage.getItem('locationGeocode')) {
			$('#location_form input:radio[name=geocode]').removeAttr('checked');
			$('#location_form input:radio[name=geocode][value=' + localStorage.getItem('locationGeocode') + ']').attr('checked', 'checked');
		}
		else if (type == 'user') {
			// Data should be prefilled in "renshuuMain.userData" object.
			renshuuForms.fillUserData();
		}
	},

	/**
	 * User data binding
	 * @see
	 */
	fillUserData: function () {
		var userData = renshuuMain.userData;
		if (userData) {
			$('#profile_form input[name=email]').val(userData.email);
			$('#profile_form input[name=title]').val(userData.name);
			$('#profile_form input[name=email]').val(userData.email);
		}
	}
};