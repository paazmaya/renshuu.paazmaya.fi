/*jslint devel: true, windows: true, maxlen: 140 */
// http://jslint.com/

// http://javascriptweblog.wordpress.com/2010/07/26/no-more-ifs-alternatives-to-statement-branching-in-javascript/

/** Firebug console functions if they do not exist **/
(function(window) {
	if (!('console' in window) || !('firebug' in console)) {
		var names = ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'dirxml',
			'group', 'groupEnd', 'time', 'timeEnd', 'count', 'trace', 'profile', 'profileEnd'];
		var len = names.length;
		window.console = {};
		for (var i = 0; i < len; i++) {
			window.console[names[i]] = function() {};
		}
	}
})(window);

/**
 * Few small plugins which are build based on a research in the Internet
 */
(function($) {
	/**
	 * Get the inner and outer html data,
	 * that is the selected element itself including.
	 */
	$.fn.outerHtml = function() {
		var outer = null;
		if (this.length) {
			var div = $('<' + 'div style="display:none"><' + '/div>');
			var clone = $(this[0].cloneNode(false)).html(this.html()).appendTo(div);
			outer = div.html();
			div.remove();
		}
		return outer;
	};
	
	/**
	 * http://www.learningjquery.com/2007/08/clearing-form-data
	 */
	$.fn.clearForm = function() {
		return this.each(function() {
			var type = this.type, tag = this.tagName.toLowerCase();
			if (tag == 'form') {
				return $(':input',this).clearForm();
			}
			if (type == 'text' || type == 'password' || tag == 'textarea') {
				this.value = '';
			}
			else if (type == 'checkbox' || type == 'radio') {
				this.checked = false;
			}
			else if (tag == 'select') {
				this.selectedIndex = -1;
			}
		});
	};
})(jQuery);

/**
 * https://addons.mozilla.org/en-US/firefox/addon/11905/
 * https://addons.mozilla.org/en-US/firefox/addon/12632/
 */
(function($) {

	$.renshuu = {
		animSpeed: 200,
		keepAlive: 1000 * 60 * 5, // Every 5 minutes a keepalive call

		/**
		 * Default map zoom,
		 * overwritten on every zoom change event and/or by cookie
		 */
		zoom: 8,

		cookieSettings: {
			expires: 3,
			path: '/'
		},
		ajaxpoint: {
			get: '/ajax/get/',
			set: '/ajax/set/',
			form: '/ajax/form/'
		},
		geocoder: null,

		/**
		 * http://code.google.com/apis/maps/documentation/javascript/reference.html
		 */
		map: null,

		streetview: null, //StreetViewPanorama
		streetService: null,
		
		dirService: null // DirectionsService
		dirLines: [] // Polylines used by DirectionsService {polyline: line, points: [pos0, pos1]}

		// default map center will be in the most beautiful castle of Japan
		hikone: null,

		tabContentElement: '#tabcontent',
		filtersHtml: null,

		// Default filter settings. Make sure the values are always single strings.
		filterSettings: {
			arts: [],
			weekdays: ['0', '1', '2', '3', '4', '5', '6'] // all weekdays are selected by default
		},

		// Icons (css rules) to use for named menu items, prepended with "icon-"
		menuicons: {
			filters: 'equalizer',
			location: 'addressbook',
			art: 'smirk',
			user: 'womanman',
			login: 'lock',
			register: 'phone'
		},
		
		// Icon used as a background for the geocode direction
		geocodeClass: {
			none: 'denied',
			address: 'arrow3_s',
			position: 'arrow3_n'
		},
		
		// If this value is 'address' and a marker is clicked, its position will be place in the form.
		geocodeBasedOn: 'none',

		// Store temporary geocoded location markers here
		geocodeMarkers: [],
		
		// Store temporary location markers, of those existing in the backend
		locationMarkers: [],
		locationMarkersData: [],

		trainingMarkers: [], // These two should share a same index for data
		trainingMarkersData: [], // related to the other

		// The actual position where current Street View is at. Shown only when Street View is.
		streetMarker: null,

		// Marker for positioning location while in location form filling.
		locationMarker: null,

		// List of trainings which are saved for the purpose of exporting them as a list later on.
		// Only the id of the training is saved, rest of the data is available in trainingMarkersData...
		// and is copied to savedListData.
		savedList: [],
		savedListData: [],
		
		// The current locale, filled from the bottom of index.php... Something like ja_JP or sl_SI
		locale: null,
		
		// This language collection will be populated from the bottom of index.php...
		lang: null,
		
		// Weekday names as per current language. Sunday is at zero index.
		weekdays: [],
		
		// User specific data will be filled, in case logged in, via the bottom of index.php...
		userData: null,

		// Please trigger this once document is ready, thus DOM has been loaded.
		ready: function() {
			// http://www.flickr.com/photos/rekishinotabi/sets/72157618241282853/
			$.renshuu.hikone = new google.maps.LatLng(35.27655600992416, 136.25263971710206);
			
			// Remove default styling from blockUi.
			$.blockUI.defaults.css = {};

			// Check for a cookie in case the center would be some other.
			var centre = $.renshuu.hikone;
			if ($.cookie('mapCenter')) {
				var arr = $.cookie('mapCenter').split(',');
				if (arr && arr.length > 1) {
					centre = new google.maps.LatLng(parseFloat(arr[0]), parseFloat(arr[1]));
				}
				console.log('mapCenter cookie existed. arr: ' + arr);
			}

			// Would there be a zoom level set in the past?
			if ($.cookie('mapZoom')) {
				var zoom = parseInt($.cookie('mapZoom'), 10);
				if (zoom > -1 && zoom < 20) {
					$.renshuu.zoom = zoom;
				}
				console.log('mapZoom cookie existed. zoom: ' + zoom);
			}

			// Handler for the ability to toggle streetview viewing while marker click.
			if ($.cookie('showInStreetView')) {
				$('input:checkbox[name=markerstreet]').attr('checked', 'checked');
				$.renshuu.markers.showInStreetView = true;
			}

			// Set up the Google Map v3 and the Street View
			$.renshuu.mapInit(
				$('#map').get(0),
				$('#street').get(0),
				{
					center: centre
				},
				{
					enableCloseButton: true,
					visible: true
				}
			);

			// Toggle "street view position update based on the map position" setting.
			$('input:checkbox[name=markerstreet]').change(function() {
				$.renshuu.markers.showInStreetView = $(this).is(':checked');
				console.log('markerstreet change. ' + $.renshuu.markers.showInStreetView);
				$.cookie(
					'showInStreetView',
					$.renshuu.markers.showInStreetView,
					$.renshuu.cookieSettings
				);
			});

			// Triggers on individual change of the checkboxes
			$('#filtering input:checkbox').live('change', function () {
				var name = $(this).attr('name');
				var check = $(this).is(':checked');
				console.log('change. name: ' + name + ', check: ' + check);

				$.renshuu.updateFilters();
			});

			// Triggers on a click to any of the shortcuts for selection manipulation
			$('#filtering p[class^=rel_] a').live('click', function () {
				var action = $(this).attr('rel');
				var target = $(this).parent('p').attr('class');
				target = target.substr(target.indexOf('_') + 1);

				//console.log('action: ' + action + ', target: ' + target);

				// Only update filters if anything changed.
				//var changed = false;

				$('#' + target + ' input:checkbox').each(function(i, elem) {
					//console.log('each. i: ' + i + ', name: ' + $(this).attr('name') + ', checked: ' + $(this).is(':checked'));
					var checked = $(this).is(':checked');
					var tobecheck = false;
					switch(action) {
						case 'all' : $(this).attr('checked', 'checked'); break;
						case 'none' : $(this).removeAttr('checked'); break;
						case 'inverse' :
							if (checked) {
								$(this).removeAttr('checked');
							}
							else {
								$(this).attr('checked', 'checked');
							}
							break;
					}
				});
				//if (changed) {
					$.renshuu.updateFilters();
				//}
				return false;
			});

			// http://benalman.com/projects/jquery-hashchange-plugin/
			$(window).hashchange(function() {
				console.log('hashchange: ' + location.hash );
			});

			// Open external links in a new window. Perhaps copyright is the only one...
			$('a[href^="http://"]').live('click', function() {
				var href = $(this).attr('href');
				var now = new Date();
				window.open(href, now.getMilliseconds());
				return false;
			});


			// Toggle the visibility of each box
			$('.header p a').click(function() {
				var rel = $(this).attr('rel');
				var con = $(this).parent('p').parent('div').next('.content').children('.stuff');
				console.log('rel: ' + rel + ', con.length: ' + con.length);
				con.toggle($.renshuu.animSpeed);
				return false;
			});
			// Navigation to forms is done via tabs at the right
			$('#navigation a').live('click', function () {
				var href = $(this).attr('href');
				var key = href.substr(href.indexOf('#') + 1);
				console.log('#navigation a -- live click. key: ' + key);
				if (key !== 'logout') {
					$.renshuu.showTabContent(key);
				}
				else {
					// https://developer.mozilla.org/en/DOM/window.location
					window.location = '/logout';
				}
				return false;
			});

			$('#mapping .header a[rel=street]').click(function() {
				var visible = $.renshuu.streetview.getVisible();
				$.renshuu.streetview.setVisible(!visible);
				return false;
			});
			/*
			$('').click(function() {
				return false;
			});
			$('').click(function() {
				return false;
			});
			*/

			$('.modal-tools a[rel=savetolist]').live('click', function() {
				var href = $(this).attr('href');
				var id = href.split('-').pop();
				console.log('savetolist click. href: ' + href + ', id: ' + id);
				$.renshuu.addSavedList(id);
				$('.modal-tools a[rel=removefromlist][href=' + href + ']').show();
				$(this).hide();
				return false;
			});
			$('.modal-tools a[rel=removefromlist]').live('click', function() {
				var href = $(this).attr('href');
				var id = href.split('-').pop();
				console.log('removefromlist click. href: ' + href + ', id: ' + id);
				$.renshuu.removeSavedList(id);
				$('.modal-tools a[rel=savetolist][href=' + href + ']').show();
				$(this).hide();
				return false;
			});
			$('#savedlist a[rel=remove]').live('click', function() {
				var href = $(this).attr('href');
				var id = href.split('-').pop();
				console.log('#savedlist a[remove] click. href: ' + href + ', id: ' + id);
				$.renshuu.removeSavedList(id);
				return false;
			});
			$('p.login a').live('click', function() {
				var href = $(this).attr('href').substr(1);
				console.log('href: ' + href);
				$.renshuu.openAuthModal(href);
				return false;
			});

			// Note that either "insert" = 0 or "update" = id must be set in the root data...
			$('form').live('submit', function() {
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
				var rel = $(this).attr('rel').split('-'); // insert-0 or update-8
				post[rel[0]] = rel[1];

				// Change temporarily the layout of the submit button / form for visual feedback
				$('#' + id).block({ 
					message: '<div id="formfeedback"><h1 title="' + $.renshuu.lang.form.sending + '">' + $.renshuu.lang.form.sending + '</h1></div>'
				});
				
				$.post($(this).attr('action'), post, function(data, status) {
					console.log('form submit. status: ' + status);
					console.dir(data);
					var res;
					if (data.response && data.response.result) {
						res = data.response.result;
					}
					
					var classes = 'icon error icon-alert';
					var html = '<h1 title="' + res.message + '">' + res.message + '</h1>';
					if (res.title) {
						html += '<p>' + res.title + '</p>';
					}
					html += '<p><a href="#insert-0" rel="clear" title="' + $.renshuu.lang.form.createnew + '">' +
						$.renshuu.lang.form.createnew + ' / ' + $.renshuu.lang.form.clear + '</a></p>' +
						'<p><a href="#update-' + res.id + '" rel="keep" title="' + $.renshuu.lang.form.modify +
						'">' + $.renshuu.lang.form.modify + '</a></p></div>';
					
					$('#formfeedback').attr('class', classes).html(html);
					
					$('#formfeedback a[rel]').one('click', function() {
						var rel = $(this).attr('rel');
						var href = $(this).attr('href').substr(1);
						if (rel == 'clear') {
							//$('#' + id).clearForm();
							$('#' + id).get(0).reset();
						}
						$('#' + id).attr('rel', href);
						$('#' + id).unblock(); // Should destroy #formfeedback...
						return false;
					});
				}, 'json');
				
				return false;
			});

			$('form input:button[name=send]').live('click', function() {
				$(this).parents('form').first().submit();
				return false;
			});
			
			$('form input:button[name=clear]').live('click', function() {
				$(this).parents('form').first().reset();
				return false;
			});
			
			// Change icon based on geocode direction
			$('#location_form input:radio[name=geocode]').live('change', function() {
				$.renshuu.updateGeocodeSelectionIcon();
			});

			// Special care for the export settings form, in order to update its preview
			$('#export_form input, #export_form select').live('change', function(){
				$.renshuu.updateExportPreview();
			});
			// Initial load...
			$.renshuu.updateExportPreview();

			// Dragging of the modal window.
			$('h2.summary').live('mousedown', function() {
			});
			$('h2.summary').live('mouseup', function() {
			});

			// http://github.com/nje/jquery-datalink
			/*
			$('#filter_form').link($.renshuu.filterSettings, {
				arts: [],
				weekdays: [0, 1, 2, 3, 4, 5, 6]
			});
			*/


			// How about a cookie for the filter settings?
			if ($.cookie('filterArts')) {
				$.renshuu.filterSettings.arts = $.cookie('filterArts').split('.');
				console.log('$.cookie filterArts existed. $.renshuu.filterSettings.arts: ' + $.renshuu.filterSettings.arts);
			}
			if ($.cookie('filterWeekdays')) {
				$.renshuu.filterSettings.weekdays = $.cookie('filterWeekdays').split('.');
				console.log('$.cookie filterWeekdays existed. $.renshuu.filterSettings.weekdays: ' + $.renshuu.filterSettings.weekdays);
			}
			$.renshuu.applyFilters();

			// Save the initial filtering form.
			$.renshuu.filtersHtml = $('#filtering').outerHtml();
			//console.log('initial $.renshuu.filtersHtml: ' + $.renshuu.filtersHtml);

			// If the current hash is something that would make filters invisible, store them now
			console.log('on dom ready. location.hash: ' + location.hash + ', location.pathname: ' + location.pathname);
			if (location.hash !== '') {
				var found = false;
				var key = location.hash.substr(1);
				console.log('key: ' + key);
				// Check if the current hash exists in the list of forms if it was not the filter view.
				if (key == 'filters' || $.renshuu.forms.types.indexOf(key) !== -1) {
					$.renshuu.showTabContent(key);
				}
			}
			else {
				location.hash = '#filters';
				$.renshuu.showTabContent('filters');
			}
			
			// Finally, set the keepalive call
			setInterval(function() {
				$.get('/ajax/keepalive', function(data) {
					//console.log(data);
				}, 'json');
			}, $.renshuu.keepAlive);

		},

		showTabContent: function (key) {
			document.location = '#' + key;

			// Remove and add "selected" class
			$('#navigation li').removeClass('selected');
			$('#navigation li:has(a[href=#' + key + '])').addClass('selected');

			// Set icon. Initially the classes are: header icon icon-equalizer. This is the only reference to the id #right.
			// $('#navigation').parent('.header')... ?
			$('#right .header').attr('class', 'header icon icon-' + $.renshuu.menuicons[key]);

			if (key == 'filters') {
				$($.renshuu.tabContentElement).html($.renshuu.filtersHtml);
				$.renshuu.applyFilters();
			}
			else if (key == 'location') {
				$.renshuu.updateGeocodeSelectionIcon();
				// begin to show location markers...
			}
			if ($.renshuu.forms.types.indexOf(key) !== -1) {
				$.renshuu.forms.getForm(key);
			}

			if ($.renshuu.locationMarker !== null) {
				if (key == 'location') {
					var pos = $.renshuu.map.getCenter();
					$.renshuu.locationMarker.setPosition(pos);
					$.renshuu.locationMarker.setVisible(true);
					console.log('locationMarker set visible and to pos: ' + pos);
				}
				else {
					$.renshuu.locationMarker.setVisible(false);
				}
				console.log('locationMarker is now visible: ' + $.renshuu.locationMarker.getVisible());
			}
		},

		// Add a training to the list of saved trainings if it is not there yet.
		addSavedList: function (id) {
			var inx = $.renshuu.savedList.indexOf(id);
			var data = null;
			console.log('addSavedList. id: ' + id + ', inx: ' + inx);
			if (inx === -1) {
				$.renshuu.savedList.push(id);
				var len = $.renshuu.trainingMarkersData.length;
				var savedlen = $.renshuu.savedListData.length; // only for debugging
				for (var i = 0; i < len; ++i) {
					data = $.renshuu.trainingMarkersData[i];
					if (data.training.id == id) {
						console.log('addSavedList. found matching data for addition, i: ' + i);
						$.renshuu.savedListData.push(data);
						break;
					}
				}
				console.log('addSavedList. savedListData length before and after adding try: ' + savedlen + ' > ' + $.renshuu.savedListData.length);

				// Now add it to DOM... Should this be made as a table or a list? table.
				if (data !== null) {
					var tr = '<tr rel="' + id + '"><td>' + data.training.art.title + '</td><td>';
					if ($.renshuu.weekdays.length > data.training.weekday) {
						tr += $.renshuu.weekdays[data.training.weekday];
					}
					tr += '</td><td>' + data.training.starttime + ' - ' +
						data.training.endtime + '</td><td><a href="#remove-' + id +
						'" rel="remove" title="' + $.renshuu.lang.list.removeitem + ' - ' +
						data.training.weekday + '"><img src="/img/sanscons/png/green/32x32/close.png" alt="' +
						$.renshuu.lang.list.removeitem + '" /></tr>';
					console.log('inserting tr: ' + tr);
					$('#savedlist tbody').prepend(tr);
				}
			}
		},

		// Remove from list, as a counter part of adding.
		removeSavedList: function (id) {
			var inx = $.renshuu.savedList.indexOf(id);
			console.log('removeSavedList. id: ' + id + ', inx: ' + inx);
			if (inx !== -1) {
				$.renshuu.savedList.splice(inx, 1);
				var len = $.renshuu.savedListData.length;
				for (var i = 0; i < len; ++i) {
					var data = $.renshuu.savedListData[i];
					if (data.training.id == id) {
						console.log('removeSavedList. found matching data for removal, i: ' + i);
						$.renshuu.savedListData.splice(i, 1);
						break;
					}
				}
				console.log('removeSavedList. savedListData length before and after removal try: ' + len + ' > ' + $.renshuu.savedListData.length);

				// Now remove it from DOM
				$('#bottom tbody tr[rel=' + id + ']').remove();
			}
		},

		// Update filters data according to current checkbox selection.
		updateFilters: function() {
			var sets = ['arts', 'weekdays'];
			var len = sets.length;
			var lens = [];
			console.log('updateFilters. len: ' + len + ', sets: ' + sets);
			for (var i = 0; i < len; ++i) {
				var target = sets[i];
				var list = [];
				$('#' + target + ' input:checkbox').each(function(inx, elem) {
					var id = $(this).attr('name').split('_').pop();
					//console.log('updateFilters. inx: ' + inx + ', name: ' + $(this).attr('name') + ', id: ' + id + ', checked: ' + $(this).is(':checked'));
					if ($(this).is(':checked')) {
						list.push(id);
					}
				});
				lens.push(list.length);
				$.renshuu.filterSettings[target] = list;
				//console.log('updateFilters. target: ' + target + ' = ' + list);
			}

			// Make sure any of the selections was not empty
			if (lens.indexOf(0) == -1) {
				$.renshuu.updateTrainings();
			}

			// Cookie is updated every time
			$.cookie(
				'filterArts',
				$.renshuu.filterSettings.arts.join('.'),
				$.renshuu.cookieSettings
			);
			$.cookie(
				'filterWeekdays',
				$.renshuu.filterSettings.weekdays.join('.'),
				$.renshuu.cookieSettings
			);
		},

		// This applies the current filter settings to the html in the dom
		applyFilters: function() {
			var sets = ['arts', 'weekdays']; // for in object gives extra data, thus defining these here
			var len = sets.length; // Should be 2
			for (var i = 0; i < len; ++i) {
				var target = sets[i];
				var list = $.renshuu.filterSettings[target];
				console.log('applyFilters. target: ' + target + ', list: ' + list);
				if (list) {
					$('#' + target + ' input:checkbox').each(function(i, elem) {
						var rel = $(this).attr('name').split('_').pop();
						var inx = list.indexOf(rel);
						//console.log('applyFilters. i: ' + i + ', rel: ' + rel + ', inx: ' + inx);
						if (inx === -1) {
							$(this).removeAttr('checked');
						}
						else {
							$(this).attr('checked', 'checked');
						}
					});
				}
			}
		},

		/**
		 * http://www.jlpt.jp/samples/forlearners.html
		 */
		updateTrainings: function() {
			var bounds = $.renshuu.map.getBounds();
			var ne = bounds.getNorthEast();
			var sw = bounds.getSouthWest();
			var para = {
				area: {
					northeast: [ne.lat(), ne.lng()],
					southwest: [sw.lat(), sw.lng()]
				},
				filter: $.renshuu.filterSettings
			};

			$.renshuu.markers.clearMarkers($.renshuu.trainingMarkers);
			$.renshuu.trainingMarkersData = [];

			$.post($.renshuu.ajaxpoint.get, para, function(data, status) {
				//console.dir(data);
				if (data.response && data.response.result) {
					var res = data.response.result;
					var len = res.length;
					for (var i = 0; i < len; ++i) {
						$.renshuu.markers.createTrainingMarker(res[i]);
					}
				}
				else {
					console.log('Seems AJAX failed. ' + status);
				}
			}, 'json');
		},
		
		/**
		 * If current tab view is in the location or training,
		 * show training place locations.
		 * As opposed to trainings.
		 */
		updateLocations: function() {
			var bounds = $.renshuu.map.getBounds();
			var ne = bounds.getNorthEast();
			var sw = bounds.getSouthWest();
			var para = {
				area: {
					northeast: [ne.lat(), ne.lng()],
					southwest: [sw.lat(), sw.lng()]
				}
			};
			$.renshuu.markers.clearMarkers($.renshuu.locationMarkers);
			$.renshuu.locationMarkersData = [];
			
			$.post($.renshuu.ajaxpoint.get + 'location', para, function(data, status) {
				console.dir(data);
				if (data.response && data.response.result) {
					var res = data.response.result;
					var len = res.length;
					for (var i = 0; i < len; ++i) {
						$.renshuu.markers.createLocationMarker(res[i]);
					}
				}
				else {
					console.log('Seems AJAX failed. ' + status);
				}
			}, 'json');
		},

		/** 
		 * http://code.google.com/apis/maps/documentation/staticmaps/
		 */ 
		updateExportPreview: function() {
			var url = 'http://maps.google.com/maps/api/staticmap?';
			var values = ['sensor=false'];
			var fields = ['maptype', 'language', 'format', 'zoom', 'size'];
			var items = $('#export_form input, #export_form select');
			var len = fields.length;
			// Should there be additional checks for allowed values...
			for (var i = 0; i < len; ++i) {				
				var field = fields[i];
				var val = '';
				if (items.filter('select[name=' + field + ']').size() > 0) {
					val = items.filter('select[name=' + field + ']').val();
				}
				else {
					val = items.filter('input[name=' + field + ']').val();
				}
				//console.log('val: ' + val);
				values.push(field + '=' + val);					
			}
			url += values.join('&');
			// marker requires special attention
			url += '&markers=color:' + $('#export_form input[name=color]').val() +
				'|label:' + $('#export_form input[name=label]').val() + '|' +
				$.renshuu.hikone.lat() + ',' +$.renshuu.hikone.lng();

			//console.log('updateExportPreview. url: ' + url);

			// perhaps there could be some animation to show that something happened...
			$('#exportpreview').attr('src', url);
		},

		/**
		 * Show the given position in the Street View. 
		 * Once visibility set, the opening is taken care of by its event handler.
		 */
		showStreetView: function(position) {
			$.renshuu.streetview.setPosition(position);
			$.renshuu.streetview.setVisible(true);
		},
		
		/**
		 * http://getfirebug.com/wiki/index.php/Firebug_Extensions
		 * http://getfirebug.com/wiki/index.php/Console_API
		 */
		openAuthModal: function(key) {
			console.group('openAuthModal');
			
			// ...
			
			console.groupEnd();
		},

		/**
		 * Initiate the following tools in Google Maps:
		 * - Maps
		 * - StreetViewPanorama
		 * - Geocoder
		 * - StreetViewService
		 */
		mapInit: function(map_element, street_element, map_options, street_options) {
			$.renshuu.geocoder = new google.maps.Geocoder();
			$.renshuu.streetService = new google.maps.StreetViewService();

			// http://code.google.com/apis/maps/documentation/javascript/reference.html#MapOptions
			var opts = {
				center: $.renshuu.hikone,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				mapTypeControl: true,
				mapTypeControlOptions: {
					position: google.maps.ControlPosition.TOP_LEFT,
					style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
				},
				navigationControl: true,
				navigationControlOptions: {
					position: google.maps.ControlPosition.TOP_LEFT,
					style: google.maps.NavigationControlStyle.SMALL
				},
				scaleControl: true,
				scaleControlOptions: {
					position: google.maps.ControlPosition.BOTTOM,
					style: google.maps.ScaleControlStyle.DEFAULT
				},
				zoom: $.renshuu.zoom
			};

			opts = $.extend(true, {}, opts, map_options);
			$.renshuu.map = new google.maps.Map(map_element, opts);

			$.renshuu.streetview = new google.maps.StreetViewPanorama(street_element, street_options);


			// The marker which can be dragged on a spot which is should be revealed in Street View
			$.renshuu.streetMarker = $.renshuu.markers.createMarker(
				$.renshuu.map.getCenter(), 'Street View', $.renshuu.pins.getPinStar('glyphish_eye'), true
			);

			// Marker draggin overrides the Street View position and makes it visible if hidden.
			google.maps.event.addListener($.renshuu.streetMarker, 'dragend', function() {
				var pos = $.renshuu.streetMarker.getPosition();
				console.log('streetMarker dragend. pos: ' + pos);
				$.renshuu.streetview.setPosition(pos);
				if (!$.renshuu.streetview.getVisible()) {
					$.renshuu.streetview.setVisible(true);
				}
			});

			// This is a bit tricky as the position changes twice in a row
			// when it is first set by the marker position and then by itself
			google.maps.event.addListener($.renshuu.streetview, 'position_changed', function() {
				var posS = $.renshuu.streetview.getPosition();
				var posM = $.renshuu.streetMarker.getPosition();
				console.log('streetview position_changed. posS: ' + posS + ', posM: ' + posM);
				if (posS && !posS.equals(posM)) {
					console.log('streetview position_change positions do not equal, thus setting marker to streetview position.');
					$.renshuu.streetMarker.setPosition(posS);
				}
			});

			// When Street View is set visible, the position for it should have been set before, thus its position is the one that is used for the marker.
			google.maps.event.addListener($.renshuu.streetview, 'visible_changed', function() {
				var posS = $.renshuu.streetview.getPosition();
				var posM = $.renshuu.streetMarker.getPosition();
				var bounds = $.renshuu.map.getBounds();
				var visible = $.renshuu.streetview.getVisible();

				console.log('streetview visible_changed. visible: ' + visible + ', posS: ' + posS + ', posM: ' + posM);

				if (visible) {
					$(street_element).slideDown();
				}
				else {
					$(street_element).slideUp();
				}
				/*
				if (!bounds.contains(posS)) {
					posS = $.renshuu.map.getCenter();
				}
				*/
				if (posS === undefined) {
					posS = $.renshuu.map.getCenter();
				}
				$.renshuu.streetMarker.setPosition(posS);
				$.renshuu.streetMarker.setVisible(visible);
				//$('#street:hidden').slideDown($.renshuu.animSpeed);
			});

			$.renshuu.map.setStreetView($.renshuu.streetview);

			//var icon = $.renshuu.pins.getBubble('glyphish_paperclip', 'Select+position');
			var icon = $.renshuu.pins.getPinStar('glyphish_paperclip', '5E0202', '05050D', 'pin_sright');
			//var icon = 'http://chart.apis.google.com/chart?chst=d_bubble_icon_text_small&chld=glyphish_paperclip|bbtl|Select+position|B7B529|05050D';
			console.log('Setting up locationMarker with opts.center: ' + opts.center.toString() + ', icon: ' + icon);
			$.renshuu.locationMarker = $.renshuu.markers.createMarker(
				opts.center, 'Choose position', icon, true
			);

			google.maps.event.addListener($.renshuu.locationMarker, 'drag', function(event) {
				// update position info in the form
				var pos = $.renshuu.locationMarker.getPosition();
				$('input[name=latitude]').val(pos.lat());
				$('input[name=longitude]').val(pos.lng());
			});
			google.maps.event.addListener($.renshuu.locationMarker, 'dragstart', function(event) {
				// This event is fired when the user starts dragging the marker.
			});
			google.maps.event.addListener($.renshuu.locationMarker, 'dragend', function(event) {
				// geocode current position if the form setting allows.
				// propably should geocode anyway, and only until a click on those appearing marker the address would be filled...
				if ($('input[name=geocode][value=position]').is(':checked')) {
					var pos = $.renshuu.locationMarker.getPosition();
					$.renshuu.data.geocodePosition(pos);
				}
			});
			$.renshuu.locationMarker.setVisible(false);

			$.renshuu.callbacks.initiate();

			$(window).resize(function() {
				google.maps.event.trigger($.renshuu.map, 'resize');
				google.maps.event.trigger($.renshuu.streetview, 'resize');
			});
		},

		/**
		 * http://code.google.com/apis/maps/documentation/javascript/reference.html#StreetViewService
		 * getPanoramaByLocation(latlng:LatLng, radius:number, callback:function(StreetViewPanoramaData, StreetViewStatus):void))
		 */
		getPanorama: function(pos, radius) {
			if (!radius) {
				radius = 100; // Metres
			}
			$.renshuu.streetService.getPanoramaByLocation(pos, radius, function(data, status) {
				console.log('getPanorama. status: ' + status);
			});
		},
		
		/**
		 * Set the icon next to the radio buttons in the location form
		 */
		updateGeocodeSelectionIcon: function() {
			if ($('#location_form').size() > 0) {
				var val = $('#location_form input:radio[name=geocode]:checked').val();
				console.log('updateGeocodeSelectionIcon. val: ' + val);
				$('#location_form .radioset').attr('class', 'radioset').addClass('icon-' + $.renshuu.geocodeClass[val]); // remove icon-* and add icon-*
				$.cookie(
					'locationGeocode',
					val,
					$.renshuu.cookieSettings
				);
				$.renshuu.geocodeBasedOn = val;
			}
		}
	};

	/*
	Marker data from the backend.
	data: {
		training: {
			id: 0,
			art: {
				id: 0,
				title: ''
			},
			weekday: 0,
			starttime: 0,
			endtime: 0
		},
		location: {
			id: 0,
			latitude: 0.0,
			longitude: 0.0,
			title: '',
			url: '',
			address: ''
		},
		person: {
			id: 0,
			title: '',
			contact: ''
		}
	}
	*/
	$.renshuu.markers = {

		// As per marker double click, show its position in Street View
		showInStreetView: false,

		// http://code.google.com/apis/maps/documentation/javascript/reference.html#Marker
		clearMarkers: function(list) {
			var len = list.length;
			for (var i = 0; i < len; ++i) {
				var marker = list[i];
				// "If map is set to null, the marker will be removed."
				marker.setMap(null);
			}
			list = [];
		},

		createTrainingMarker: function(data) {
			var icon = $.renshuu.pins.getLetter(data.training.art.title.substr(0, 1), '0E3621', '05050D');
			var pos = new google.maps.LatLng(data.location.latitude, data.location.longitude);
			var marker = $.renshuu.markers.createMarker(pos, data.training.art.title + ' / ' + data.location.title, icon, false);

			google.maps.event.addListener(marker, 'click', function(event) {
				// This event is fired when the marker icon was clicked.
				var pos = marker.getPosition();
				console.log('training marker. click - ' + marker.title + ', pos: ' + pos);
				// Show the blockUi over map with the details
				$.renshuu.markers.showInfo(marker);
			});

			var len = $.renshuu.trainingMarkers.push(marker);
			$.renshuu.trainingMarkersData[len - 1] = data;
		},
		
		createLocationMarker: function(data) {
			var icon = $.renshuu.pins.getBubble('glyphish_flag', data.location.title, '0E3621', '05050D');
			var pos = new google.maps.LatLng(data.location.latitude, data.location.longitude);
			var marker = $.renshuu.markers.createMarker(pos, data.location.title, icon, false);

			google.maps.event.addListener(marker, 'click', function(event) {
				// This event is fired when the marker icon was clicked.
				var pos = marker.getPosition();
				console.log('location marker. click - ' + marker.title + ', pos: ' + pos);
				// This should now fill the address in the "training" form...
			});

			var len = $.renshuu.locationMarkers.push(marker);
			$.renshuu.locationMarkersData[len - 1] = data;
		},
		
		createGeocodeMarker: function (res, i) {
			/*
			for (var j in res) {
				if (res.hasOwnProperty(j)) {
					console.log(j + ' = ' + res[j]);
				}
			}
			*/
			/*
			for (var s in res.address_components) {
				var a = res.address_components[s];
				for (var c in a) {
					console.log('address_components: ' + s + ' --\> ' + c + ' = ' + a[c]);
				}
			}
			for (var g in res.geometry) {
				console.log('geometry: ' + g + ' = ' + res.geometry[g]);
			}
			*/
			//address_components
			//geometry
			//types
			// formatted_address - not documented
			var marker = $.renshuu.markers.createMarker(
				res.geometry.location, res.formatted_address,
				$.renshuu.pins.getLetter(i + 1), false);
			// Right click will be used for deleting...
			google.maps.event.addListener(marker, 'rightclick', function(event) {
				$.renshuu.data.removeGeoMarker(marker);
			});
			google.maps.event.addListener(marker, 'click', function(event) {
				// This event is fired when the marker is right clicked on.
				var title = marker.getTitle();
				var pos = marker.getPosition();
				console.log('clicking geocode marker. title: ' + title + ', pos: ' + pos);
				if ($.renshuu.geocodeBasedOn == 'position') {
					$('input[name=address]').val(title);
				}
				else if ($.renshuu.geocodeBasedOn == 'address') {
					$('input[name=latitude]').val(pos.lat());
					$('input[name=longitude]').val(pos.lng());
				}
			});

			return marker;
		},

		createMarker: function(pos, title, icon, drag) {
			// http://code.google.com/apis/maps/documentation/javascript/reference.html#MarkerOptions
			if (!icon) {
				icon = $.renshuu.pins.getIcon();
			}
			if (drag === null) {
				drag = false;
			}
			console.log('createMarker. pos: ' + pos + ', title: ' + title + ', drag: ' + drag);
			var marker = new google.maps.Marker({
				position: pos,
				title: title,
				map: $.renshuu.map,
				draggable: drag,
				icon: icon
			});

			google.maps.event.addListener(marker, 'dblclick', function(event) {
				// This event is fired when the marker icon was double clicked.
				console.log('marker. dblclick - ' + marker.title);
				console.log('showInStreetView: ' + $.renshuu.markers.showInStreetView);
				if ($.renshuu.markers.showInStreetView) {
					$.renshuu.showStreetView(marker.getPosition());
				}
			});
			google.maps.event.addListener(marker, 'mouseout', function(event) {
				// This event is fired when the mouse leaves the area of the marker icon.
			});
			google.maps.event.addListener(marker, 'mouseover', function(event) {
				// This event is fired when the mouse enters the area of the marker icon.
			});
			/*
			google.maps.event.addListener(marker, 'position_changed', function() {
				// This event is fired when the marker position property changes.
				console.log('marker. position_changed - ' + marker.title);
			});
			*/
			google.maps.event.addListener(marker, 'rightclick', function(event) {
				// This event is fired when the marker is right clicked on.
			});

			return marker;
		},

		// http://malsup.com/jquery/block/
		showInfo: function(marker) {
			var inx = $.renshuu.trainingMarkers.indexOf(marker);
			console.log('showInfo. marker.title: '+ marker.title + ', inx: ' + inx);
			var data;
			if (inx !== -1) {
				data = $.renshuu.trainingMarkersData[inx];
			}

			if (data) {
				console.log('showInfo. data. ' + data);
				var info = $.renshuu.markers.buildInfoWindow(data);
				$('#map').block({ 
					message: info
				});
				$('.modal-close').one('click', function() {
					$('#map').unblock();
					return false;
				});
			}
		},

		buildInfoWindow: function(data) {
			/*
			Marker data from the backend.
			data: {
				training: {
					id: 0,
					art: {
						id: 0,
						title: ''
					},
					weekday: 0,
					starttime: 0,
					endtime: 0
				},
				location: {
					id: 0,
					latitude: 0.0,
					longitude: 0.0,
					title: '',
					url: '',
					address: ''
				},
				person: {
					id: 0,
					title: '',
					contact: ''
				}
			}
			*/
			var lang = $.renshuu.lang.modal;
			var info = '<div class="modal-info vevent">';
			if (data.training && data.training.art && data.training.art.id && data.training.art.title) {
				info += '<h2 class="summary" rel="art-' + data.training.art.id + '">' +
					'<a href="#training-' + data.training.id + '" class="modal-close uid icon-close" title="' +
					data.training.art.title + '">' + data.training.art.title + '</a></h2>';
			}
			if (data.training && data.training.id && data.training.weekday) {
				info += '<p class="modal-time" rel="training-' + data.training.id + '">';
				if ($.renshuu.weekdays.length > data.training.weekday) {
					info += $.renshuu.weekdays[data.training.weekday];
				}
				if (data.training.starttime && data.training.endtime) {
					info += '<span class="dtstart" title="' + data.training.starttime + '">' +
						data.training.starttime + '</span>-<span class="dtend" title="' + 
						data.training.endtime + '">' + data.training.endtime + '</span>';
				}
				info += '</p>';
			}

			if (data.person && data.person.id && data.person.title) {
				info += '<p class="modal-contact" rel="person-' + data.person.id + '">' + data.person.title;
				if (data.person.contact) {
					info += ' (' + data.person.contact + ')';
				}
				info += '</p>';
			}
			if (data.location && data.location.id && data.location.title) {
				info += '<p class="modal-location" rel="location-' + data.location.id + '">' + data.location.title;
				if (data.location.url) {
					info += '<a href="' + data.location.url + '" title="' +
						data.location.title + '">' + data.location.url + '</a>';
				}
				info += '</p>';
			}
			if (data.location && data.location.latitude && data.location.longitude) {
				info += '<address class="geo">';
				if (data.location.address) {
					info += data.location.address;
				}
				info += '<span><abbr class="latitude" title="' + data.location.latitude + '">' +
					$.renshuu.data.deg2dms(data.location.latitude, true) + '</abbr>' +
					'<abbr class="longitude" title="' + data.location.longitude + '">' +
					$.renshuu.data.deg2dms(data.location.longitude, false) + '</abbr></span>' +
					'</address>';
			}
			if (data.training && data.training.id) {
				info += '<p class="modal-tools">';
				info += '<a href="#training-' + data.training.id + '" title="' + lang.savetolist +
					'" rel="savetolist">' + lang.savetolist + '</a>';
				info += '<a href="#training-' + data.training.id + '" title="' + lang.removefromlist +
					'" rel="removefromlist" style="display:none;">' + lang.removefromlist + '</a>';
				info += '</p>';
			}
			info += '</div>';

			console.log('buildInfoWindow. info. ' + info);
			//$(info).appendTo('body');
			return info;
		}
	};

	$.renshuu.data = {
		// http://en.wikipedia.org/wiki/Geographic_coordinate_conversion
		deg2dms: function(degfloat, isLatitude) {
			var letter = '';
			if (isLatitude) {
				letter = 'NS';
			}
			else {
				letter = 'EW';
			}
			if (degfloat < 0) {
				degfloat = Math.abs(degfloat);
				letter = letter.substr(1, 1);
			}
			else {
				letter = letter.substr(0, 1);
			}

			//console.log('deg_to_dms. degfloat: ' + degfloat);

			var deg = Math.floor(degfloat);
			var minfloat = 60 * (degfloat - deg);
			//console.log('deg_to_dms. minfloat: ' + minfloat);
			var min = Math.floor(minfloat);
			//console.log('deg_to_dms. min: ' + min);
			var secfloat = 60 * (minfloat - min);
			//console.log('deg_to_dms. secfloat: ' + secfloat);
			secfloat = Math.round( secfloat );

			if (secfloat == 60) {
				min = min + 1;
				secfloat = 0;
			}
			if (min == 60) {
				deg = deg + 1;
				min = 0;
			}
			//W 87°43'41"

			return (deg + '° ' + min + "' " + secfloat + '" ' + letter);
		},

		geocodePosition: function(pos) {
			// http://code.google.com/apis/maps/documentation/javascript/reference.html#Geocoder
			// Clear earlier geocode markers
			$.renshuu.data.removeAllGeoMarkers();
			$.renshuu.geocoder.geocode(
				{ location: pos, language: 'ja' },
				function(results, status) {
					if (results) {
						var len = Math.min(3, results.length);
						// Max three results
						for (var i = 0; i < len; ++i) {
							// http://code.google.com/apis/maps/documentation/javascript/reference.html#GeocoderResult
							var marker = $.renshuu.markers.createGeocodeMarker(results[i], i);
							$.renshuu.geocodeMarkers.push(marker);

							console.log('---- result ' + i);

						}
						$('input[name=address]').val(results[0].formatted_address);
					}
					else {
						$('input[name=address]').val('Cannot determine address at this location.');
					}
				}
			);
		},

		removeGeoMarker: function(marker) {
			var inx = $.renshuu.geocodeMarkers.indexOf(marker);
			console.log('rightclicking thus removing marker with title: ' + marker.getTitle() + ', inx: ' + inx);
			if (inx !== -1) {
				$.renshuu.geocodeMarkers.splice(inx, 1);
			}
			marker.setMap(null);
		},

		removeAllGeoMarkers: function() {
			var len = $.renshuu.geocodeMarkers.length;
			while (len > 0) {
				len--;
				var marker = $.renshuu.geocodeMarkers[len];
				$.renshuu.geocodeMarkers.splice(len, 1);
				marker.setMap(null);
			}
			$.renshuu.geocodeMarkers = [];
		}
	};

	$.renshuu.callbacks = {
		updateZoomCookie: function() {
			var zoom = $.renshuu.map.getZoom();
			$.cookie(
				'mapZoom',
				zoom,
				$.renshuu.cookieSettings
			);
			$.renshuu.zoom = zoom;
		},
		updateCenterCookie: function() {
			var center = $.renshuu.map.getCenter();
			$.cookie(
				'mapCenter',
				center.lat() + ',' + center.lng(),
				$.renshuu.cookieSettings
			);
		},

		initiate: function() {
			var callbacks = $.renshuu.callbacks;
			var map = $.renshuu.map;
			google.maps.event.addListener(map, 'bounds_changed', callbacks.bounds_changed);
			google.maps.event.addListener(map, 'center_changed', callbacks.center_changed);
			//google.maps.event.addListener(map, 'maptypeid_changed', callbacks.maptypeid_changed);
			//google.maps.event.addListener(map, 'mousemove', callbacks.mousemove);
			//google.maps.event.addListener(map, 'mouseout', callbacks.mouseout);
			//google.maps.event.addListener(map, 'mouseover', callbacks.mouseover);
			//google.maps.event.addListener(map, 'rightclick', callbacks.rightclick);
			google.maps.event.addListener(map, 'zoom_changed', callbacks.zoom_changed);
		},
		bounds_changed: function() {
			// This event is fired when the viewport bounds have changed
			if (location.hash == '#location' || location.hash == '#training') {
				$.renshuu.updateLocations();
			}
		},
		center_changed: function() {
			// This event is fired when the map center property changes.
			$.renshuu.callbacks.updateCenterCookie();
		},
		maptypeid_changed: function() {
			// This event is fired when the mapTypeId property changes.
		},
		mousemove: function(event) {
			// This event is fired whenever the user's mouse moves over the map container.
		},
		mouseout: function(event) {
			// This event is fired when the user's mouse exits the map container.
		},
		mouseover: function(event) {
			// This event is fired when the user's mouse enters the map container.
		},
		projection_changed: function() {
			// This event is fired when the projection has changed.
		},
		rightclick: function(event) {
			// This event is fired when the DOM contextmenu event is fired on the map container.
		},
		zoom_changed: function() {
			// This event is fired when the map zoom property changes.
			$.renshuu.callbacks.updateZoomCookie();
		}
	};

	// http://code.google.com/apis/chart/docs/gallery/dynamic_icons.html#icon_list
	$.renshuu.pins = {
		// MarkerImage(url:string, size?:Size, origin?:Point, anchor?:Point, scaledSize?:Size)
		getMarkerImage: function(image, size, origin, anchor) {
			console.log('getMarkerImage. image: ' + image + ', size: ' + size + ', origin: ' + origin + ' , anchor: ' + anchor);
			return new google.maps.MarkerImage(
				'http://chart.apis.google.com/chart?' + image, size, origin, anchor, size
			);
		},

		getIcon: function(icon, color) { // 21, 34
			if (!icon) {
				icon = 'fire';
			}
			if (!color) {
				color = 'ADDE63';
			}
			// http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=fire|ADDE63
			return $.renshuu.pins.getMarkerImage(
				'chst=d_map_pin_icon&chld=' + icon + '|' + color
			);
		},

		getLetter: function(letter, fill, color) {
			if (!letter) {
				letter = '場';
			}
			if (!fill) {
				fill = 'ADDE63';
			}
			if (!color) {
				color = '05050D';
			}
			// http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=場|ADDE63|05050D
			return $.renshuu.pins.getMarkerImage(
				'chst=d_map_pin_letter&chld=' + encodeURI(letter) + '|' + fill + '|' + color
			);
		},

		// type can be only one of the two [pin_sright, pin_sleft], othervise size mismatches.
		getPinStar: function(icon, fill, star, type) {
			if (!icon) {
				icon = 'glyphish_compass';
			}
			if (!fill) {
				fill = 'F9FBF7';
			}
			if (!star) {
				star = '5E0202';
			}
			if (!type) {
				type = 'pin_sright';
			}
			var size = new google.maps.Size(23, 33);
			var origin = new google.maps.Point(0, 0);
			var anchor = new google.maps.Point(0, 33);
			if (type == 'pin_sleft') {
				anchor = new google.maps.Point(23, 33);
			}
			// http://chart.apis.google.com/chart?chst=d_map_xpin_icon&chld=pin_star|glyphish_compass|F9FBF7|ADDE63
			// http://chart.apis.google.com/chart?chst=d_map_xpin_icon&chld=pin_sright|glyphish_compass|F9FBF7|ADDE63
			return $.renshuu.pins.getMarkerImage(
				'chst=d_map_xpin_icon&chld=' + type + '|' + icon + '|' + fill + '|' + star, size, origin, anchor
			);
		},

		getBubble: function(icon, text, fill, color, type) {
			if (!icon) {
				icon = 'glyphish_paperclip';
			}
			if (!text) {
				text = 'Select+position';
			}
			if (!fill) {
				fill = 'B7B529';
			}
			if (!color) {
				color = '05050D';
			}
			if (!type) {
				type = 'bbtl';
			}
			var size = new google.maps.Size(41, 42);
			var origin = new google.maps.Point(0, 0);
			var anchor = new google.maps.Point(0, 0);
			// http://chart.apis.google.com/chart?chst=d_bubble_icon_text_small&chld=glyphish_paperclip|bbtl|Select+position|B7B529|05050D
			return $.renshuu.pins.getMarkerImage(
				'chst=d_bubble_icon_text_small&chld=' + icon + '|' + encodeURI(text) + '|' +
				type + '|' + fill + '|' + color, size, origin, anchor
			);
		},

		gYellowIcon: function() { return $.renshuu.pins.getIcon('glyphish_target', 'F9FBF7'); },
		gRedIcon: function() { return $.renshuu.pins.getIcon('star', 'CC2233'); },
		gBlueIcon: function() { return $.renshuu.pins.getIcon('snow', '2233CC'); }
	};


	$.renshuu.forms = {

		// Save the earlierly fetched form elements with callbacks once set.
		cache: {},

		types: ['art', 'location', 'training', 'person', 'user', 'login', 'register'],

		// Seven types available: art, location, training, person, user, login, register
		getForm: function(type) {
			if ($.renshuu.forms.cache[type])
			{
				$.renshuu.forms.showForm(type);
			}
			else
			{
				$.post($.renshuu.ajaxpoint.form + type, function(data, status) {
					//console.dir(data);
					if (data.response && data.response.form)
					{
						$.renshuu.forms.setForm(data.response.form, type);
						$.renshuu.forms.showForm(type);
					}
				}, 'json');
			}
		},

		// form contains the form element with the requested input fields.
		setForm: function(form, type) {

			// http://code.drewwilson.com/entry/autosuggest-jquery-plugin
			$(form).find('input[name=location]').autoSuggest(
				$.renshuu.ajaxpoint.get + 'location', {
					startText: $.renshuu.lang.suggest.location,
					selectedItemProp: 'id',
					searchObjProps: 'title'
				}
			);
			$(form).find('input[name=art]').autoSuggest(
				$.renshuu.ajaxpoint.get + 'art', {
					minChars: 2,
					matchCase: false,
					startText: $.renshuu.lang.suggest.art,
					selectedItemProp: 'name',
					selectedValuesProp: 'id',
					searchObjProps: 'name',
					queryParam: '/',
					selectionLimit: 2,
					//selectionClick: function(elem){ elem.fadeTo("slow", 0.33); },
					//selectionAdded: function(elem){ elem.fadeTo("slow", 0.33); },
					//selectionRemoved: function(elem){ elem.fadeTo("fast", 0, function(){ elem.remove(); }); },
					resultClick: function(data){
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
					text: $.renshuu.lang.validate.minlength
				},


				requiredfield: {
					pattern: /(^(\s)+$)|(^$)/,
					type: 'warning',
					text: $.renshuu.lang.validate.requiredfield
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


			$.renshuu.forms.cache[type] = form;
		},

		showForm: function(type) {
			var form = $.renshuu.forms.cache[type];
			$(form).attr('rel', 'insert-0'); // Always empty and ready to insert a new.
			$($.renshuu.tabContentElement).contents().detach(); // clean but save
			$($.renshuu.tabContentElement).html(form);
			
			// If location form is used, check the possible cookie.
			if (type == 'location' && $.cookie('locationGeocode')) {
				$('#location_form input:radio[name=geocode]').removeAttr('checked');
				$('#location_form input:radio[name=geocode][value=' + $.cookie('locationGeocode') + ']').attr('checked', 'checked');
			}
			else if (type == 'user') {
				// Data should be prefilled in "$.renshuu.userData" object.
				$.renshuu.forms.fillUserData();
			}
		},
		
		// User data binding
		fillUserData: function() {
			var userData = $.renshuu.userData;
			if (userData) {
				$('#profile_form input[name=email]').val(userData.email);
				$('#profile_form input[name=title]').val(userData.name);
				$('#profile_form input[name=email]').val(userData.email);
			}
		}
	};


})(jQuery);