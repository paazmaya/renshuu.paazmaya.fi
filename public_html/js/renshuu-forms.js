/**
 * Renshuu Forms
 */
var renshuuForms = {
	
	// Save the earlierly fetched form elements with callbacks once set.
	cache: {},

	types: ['art', 'location', 'training', 'person', 'user', 'login'],

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
	 *
	 * @see
	 */
	showForm: function (type) {
		var form = renshuuForms.cache[type];
		$(form).attr('rel', 'insert-0'); // Always empty and ready to insert a new.
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