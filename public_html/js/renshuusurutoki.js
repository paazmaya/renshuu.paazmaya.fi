/*jslint devel: true, windows: true, maxlen: 140 */
// http://jslint.com/

// http://jshint.com/

// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// http://javascriptweblog.wordpress.com/2010/07/26/no-more-ifs-alternatives-to-statement-branching-in-javascript/

/**
 * Please keep reading:
 *  http://code.google.com/p/gmaps-api-issues/wiki/JavascriptMapsAPIv3Changelog
 */

/**
 * Firebug console functions if they do not exist
 */
(function (window) {
	if (!('console' in window) || !('firebug' in console)) {
		var names = [
			'log', 'debug', 'info', 'warn', 'error', 'assert',
			'dir', 'dirxml', 'group', 'groupEnd', 'time',
			'timeEnd', 'count', 'trace', 'profile', 'profileEnd'
		];
		var len = names.length;
		window.console = {};
		for (var i = 0; i < len; ++i) {
			window.console[names[i]] = function () {};
		}
	}
})(window);

/**
 * Few small plugins which are build based on a research in the Internet.
 */
(function ($) {
	/**
	 * Get the inner and outer html data,
	 * that is the selected element itself including.
	 */
	$.fn.outerHtml = function () {
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
	$.fn.clearForm = function () {
		return this.each(function () {
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
(function ($) {

	$.renshuu = {
		animSpeed: 200,
		keepAlive: 1000 * 60 * 5, // Every 5 minutes a keepalive call

		/**
		 * Default map zoom,
		 * overwritten on every zoom change event and/or by cookie
		 */
		zoom: 8,

		/**
		 * Common settings for all cookies
		 */
		cookieSettings: {
			expires: 3,
			path: '/'
		},

		/**
		 * Points of contact.
		 * Use these "constants" for pointing the ajax url.
		 */
		ajaxpoint: {
			get: '/ajax/get/',
			set: '/ajax/set/',
			form: '/ajax/form/'
		},

		/**
		 * Google Maps Geocoder
		 */
		geocoder: null,

		/**
		 * http://code.google.com/apis/maps/documentation/javascript/reference.html
		 */
		map: null,

		/**
		 * google.maps.StreetViewPanorama
		 */
		streetView: null,

		/**
		 * google.maps.StreetViewService
		 * A StreetViewService object performs searches for Street View data.
		 * The reason for having it as separate variable is the possible use
		 * of other implementations.
		 */
		streetService: null,

		/**
		 * Should the Street View utilities be available?
		 */
		streetEnable: false,

		/**
		 * http://code.google.com/apis/maps/documentation/javascript/reference.html#DirectionsService
		 * The service for getting directions between two locations.
		 */
		dirService: null,

		/**
		 * Polylines used by DirectionsService to show the path on the map.
		 * Structure:
		 *  { polyline: line, points: [pos0, pos1] }
		 */
		dirLines: [],

		/**
		 * The time in milliseconds between consecutive call to the directions
		 * service (google.maps.DirectionsRequest).
		 * It shall prevent of getting google.maps.DirectionsStatus.OVER_QUERY_LIMIT
		 */
		dirRequestInterval: 1000, // 1 sec

		/**
		 * Default map center will be in the most beautiful castle of Japan,
		 * based on personal opinion.
		 */
		hikone: null,

		/**
		 * Tabs contain all the different forms.
		 */
		tabContentElement: '#tabcontent',
		
		/**
		 *
		 */
		filtersHtml: null,

		/**
		 * Default filter settings. Make sure the values are always single strings.
		 */
		filterSettings: {
			arts: [],
			weekdays: ['0', '1', '2', '3', '4', '5', '6'] // all weekdays are selected by default
		},

		/**
		 * Icons (css rules) to use for named menu items, prepended with "icon-"
		 */
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

		/**
		 * If this value is 'address' and a marker is clicked, its position will be place in the form.
		 */
		geocodeBasedOn: 'none',

		/**
		 * Store temporary geocoded location markers here.
		 * { key:"address or lat/lng that was tried to be geocoded", markers: [] }
		 */
		geocodeMarkers: [],

		/**
		 * Store temporary location markers, of those existing in the backend
		 */
		locationMarkers: [],
		locationMarkersData: [],
		
		/**
		 * trainingMarkers and trainingMarkersData should share 
		 * a same index for data related to the other.
		 */
		trainingMarkers: [],
		trainingMarkersData: [],

		/**
		 * The actual position where current Street View is at. Shown only when Street View is.
		 */
		streetMarker: null,

		/**
		 * Marker for positioning location while in location form filling.
		 */
		locationMarker: null,

		/**
		 * List of trainings which are saved for the purpose of exporting them as a list later on.
		 * Only the id of the training is saved, rest of the data is available in trainingMarkersData...
		 * and is copied to savedListData.
		 */
		savedList: [],
		savedListData: [],

		/**
		 * The current locale, filled from the bottom of index.php... Something like ja_JP or sl_SI
		 */
		locale: null,

		/**
		 * This language collection will be populated from the bottom of index.php...
		 */
		lang: null,

		/**
		 * Weekday names as per current language. Sunday is at zero index.
		 */
		weekdays: [],

		/**
		 * User specific data will be filled, in case logged in, via the bottom of index.php...
		 */
		userData: null,

		/**
		 * Please trigger this once document is ready, thus DOM has been loaded.
		 * Assumes that there exists elements with the following ids:
		 * - map
		 * - street
		 * - filtering
		 * - navigation
		 * - mapping
		 * - savedlist
		 * -
		 *
		 * Hikone Castle & Town.
		 * @see http://www.flickr.com/photos/rekishinotabi/sets/72157618241282853/
		 */
		ready: function () {
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

			// Handler for the ability to toggle streetView viewing while marker click.
			if ($.cookie('showInStreetView')) {
				$('input:checkbox[name=markerstreet]').attr('checked', 'checked');
				$.renshuu.markers.showInStreetView = true;
			}

			// Set up the Google Map v3
			$.renshuu.mapInit(
				$('#map').get(0),
				{
					center: centre
				}
			);

			// and the Street View
			if ($.renshuu.streetEnable) {
				$.renshuu.streetInit(
					$('#street').get(0),
					{
						enableCloseButton: true,
						visible: true
					}
				);
			}


			// Set up the directions service
			$.renshuu.dirService = new google.maps.DirectionsService();

			// Toggle "street view position update based on the map position" setting.
			if ($.renshuu.streetEnable) {
				$('input:checkbox[name=markerstreet]').change(function () {
					$.renshuu.markers.showInStreetView = $(this).is(':checked');
					console.log('markerstreet change. ' + $.renshuu.markers.showInStreetView);
					$.cookie(
						'showInStreetView',
						$.renshuu.markers.showInStreetView,
						$.renshuu.cookieSettings
					);
				});
			}

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

				$('#' + target + ' input:checkbox').each(function (i, elem) {
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
			$(window).hashchange(function () {
				console.log('hashchange: ' + location.hash );
			});

			// Open external links in a new window. Perhaps copyright is the only one...
			$('a[href^="http://"]').live('click', function () {
				var href = $(this).attr('href');
				var now = new Date();
				window.open(href, now.getMilliseconds());
				return false;
			});


			// Toggle the visibility of each box
			$('.header p a').click(function () {
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

			if ($.renshuu.streetEnable) {
				$('#mapping .header a[rel=street]').click(function () {
					var visible = $.renshuu.streetView.getVisible();
					$.renshuu.streetView.setVisible(!visible);
					return false;
				});
			}
			/*
			$('').click(function () {
				return false;
			});
			$('').click(function () {
				return false;
			});
			*/

			$('.modal-tools a[rel=savetolist]').live('click', function () {
				var href = $(this).attr('href');
				var id = href.split('-').pop();
				console.log('savetolist click. href: ' + href + ', id: ' + id);
				$.renshuu.addSavedList(id);
				$('.modal-tools a[rel=removefromlist][href=' + href + ']').show();
				$(this).hide();
				return false;
			});
			$('.modal-tools a[rel=removefromlist]').live('click', function () {
				var href = $(this).attr('href');
				var id = href.split('-').pop();
				console.log('removefromlist click. href: ' + href + ', id: ' + id);
				$.renshuu.removeSavedList(id);
				$('.modal-tools a[rel=savetolist][href=' + href + ']').show();
				$(this).hide();
				return false;
			});
			$('#savedlist a[rel=remove]').live('click', function () {
				var href = $(this).attr('href');
				var id = href.split('-').pop();
				console.log('#savedlist a[remove] click. href: ' + href + ', id: ' + id);
				$.renshuu.removeSavedList(id);
				return false;
			});
			$('p.login a').live('click', function () {
				var href = $(this).attr('href').substr(1);
				console.log('href: ' + href);
				$.renshuu.openAuthModal(href);
				return false;
			});

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
				var rel = $(this).attr('rel').split('-'); // insert-0 or update-8
				post[rel[0]] = rel[1];

				// Change temporarily the layout of the submit button / form for visual feedback
				$('#' + id).block({
					message: '<div id="formfeedback"><h1 title="' +
						$.renshuu.lang.form.sending + '">' +
						$.renshuu.lang.form.sending + '</h1></div>'
				});

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
				$.renshuu.updateGeocodeSelectionIcon();
			});

			// Special care for the export settings form, in order to update its preview
			$('#export_form input, #export_form select').live('change', function (){
				$.renshuu.updateExportPreview();
			});
			// Initial load...
			$.renshuu.updateExportPreview();

			// Dragging of the modal window.
			$('h2.summary').live('mousedown', function () {
			});
			$('h2.summary').live('mouseup', function () {
			});

			// https://github.com/jquery/jquery-datalink
			/*
			// this could handle all the above...
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
			setInterval(function () {
				$.get('/ajax/keepalive', function (data) {
					//console.log(data);
				}, 'json');
			}, $.renshuu.keepAlive);

		},

		/**
		 * Each tab has an individual content.
		 * @see
		 */
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

		/**
		 * Add a training to the list of saved trainings if it is not there yet.
		 * @see
		 */
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
					if (data && data.training.id == id) {
						console.log('addSavedList. found matching data for addition, i: ' + i);
						$.renshuu.savedListData.push(data);
						break;
					}
				}
				console.log('addSavedList. savedListData length before and after adding try: ' + savedlen + ' > ' + $.renshuu.savedListData.length);

				// Now add it to DOM... Should this be made as a table or a list? table.
				// Use template "savedTemplate", but this is used only one way as a template.
				// Removal is done via regular DOM removal actions.
				if (data !== null) {
					var saved = {
						id: id,
						artTitle: data.training.art.title,
						weekDayInt: data.training.weekday,
						weekDay: ($.renshuu.weekdays.length > data.training.weekday ?
							$.renshuu.weekdays[data.training.weekday] : ""),
						startTime: data.training.starttime,
						endTime: data.training.endtime,
						removeTitle: $.renshuu.lang.list.removeitem
					};
					$('#savedTemplate').tmpl(saved).prependTo('#savedlist tbody');
				}
			}
		},

		/**
		 * Remove from list, as a counter part of adding.
		 * @see
		 */
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

		/**
		 * Update filters data according to current checkbox selection.
		 * @see
		 */
		updateFilters: function () {
			var sets = ['arts', 'weekdays'];
			var len = sets.length;
			var lens = [];
			console.log('updateFilters. len: ' + len + ', sets: ' + sets);
			for (var i = 0; i < len; ++i) {
				var target = sets[i];
				var list = [];
				$('#' + target + ' input:checkbox').each(function (inx, elem) {
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

		/**
		 * This applies the current filter settings to the html in the dom
		 * @see
		 */
		applyFilters: function () {
			var sets = ['arts', 'weekdays']; // for in object gives extra data, thus defining these here
			var len = sets.length; // Should be 2
			for (var i = 0; i < len; ++i) {
				var target = sets[i];
				var list = $.renshuu.filterSettings[target];
				console.log('applyFilters. target: ' + target + ', list: ' + list);
				if (list) {
					$('#' + target + ' input:checkbox').each(function (i, elem) {
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
		 * @see http://www.jlpt.jp/samples/forlearners.html
		 */
		updateTrainings: function () {
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

			$.post($.renshuu.ajaxpoint.get, para, function (data, status) {
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
		updateLocations: function () {
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

			$.post($.renshuu.ajaxpoint.get + 'location', para, function (data, status) {
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
		 * @see http://code.google.com/apis/maps/documentation/staticmaps/
		 */
		updateExportPreview: function () {
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
		 * Draw route between two spots, while using directions service.
		 */
		drawRoute: function (pos1, pos2) {
			var reg = {
				avoidHighways: true,
				destination: pos2,
				origin: pos1,
				provideRouteAlternatives: false,
				travelMode: google.maps.DirectionsTravelMode.WALKING
			};
			// This request should not be made too often..
			// Check for $.renshuu.dirRequestInterval
			$.renshuu.dirService.route(reg, function (result, status) {
				console.log(status);
				if (result && result.routes && result.routes[0]) {
					var route = result.routes[0]; // DirectionsRoute  just one if provideRouteAlternatives == false
					var lenl = route.legs.length;
					for (var i = 0; i < lenl; ++i) {
						var leg = route.legs[i]; // DirectionsLeg  http://code.google.com/apis/maps/documentation/javascript/reference.html#DirectionsLeg
						var lens = leg.steps.length;
						for (var j = 0; j < lens; ++j) {
							var step = leg.steps[j]; // DirectionsStep
							// step.path
							// http://code.google.com/apis/maps/documentation/javascript/reference.html#DirectionsDistance
							$.renshuu.drawPath(step.start_location, step.end_location); //, step.distance.text);
						}
					}
				}
			});
		},

		/**
		 * Draw a path between two positions by using tools in Google Maps.
		 * pos1 and pos2 are type of google.maps.LatLng
		 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#LatLng
		 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#Polyline
		 */
		drawPath: function (pos1, pos2, color) {
			var opts = {
				clickable: false,
				geodesic: true,
				map: $.renshuu.map,
				path: [pos1, pos2],
				strokeColor: "#FFAA00", // html hex
				strokeOpacity: 0.5,
				strokeWeight: 2 // pixels
			};
			if (color) {
				opts.strokeColor = color;
			}
			var line = new google.maps.Polyline(opts);

			// Change the color slightly
			google.maps.event.addListener(line, 'mouseover', function () {
				var o = opts;
				o.strokeOpacity = 0.8;
				line.setOptions(o);
			});
			google.maps.event.addListener(line, 'mouseout', function () {
				line.setOptions(opts);
			});
		},

		/**
		 * Show the given position in the Street View.
		 * Once visibility set, the opening is taken care of by its event handler.
		 */
		showStreetView: function (position) {
			$.renshuu.streetView.setPosition(position);
			$.renshuu.streetView.setVisible(true);
		},

		/**
		 * http://getfirebug.com/wiki/index.php/Firebug_Extensions
		 * http://getfirebug.com/wiki/index.php/Console_API
		 */
		openAuthModal: function (key) {
			console.group('openAuthModal');

			// ...

			console.groupEnd();
		},

		/**
		 * Initiate the following tools in Google Maps:
		 * - Maps
		 * - Geocoder
		 */
		mapInit: function (elem, map_options) {
			$.renshuu.geocoder = new google.maps.Geocoder();

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
			$.renshuu.map = new google.maps.Map(elem, opts);

			//var icon = $.renshuu.pins.getBubble('glyphish_paperclip', 'Select+position');
			var icon = $.renshuu.pins.getPinStar('glyphish_paperclip', '5E0202', '05050D', 'pin_sright');
			//var icon = 'http://chart.apis.google.com/chart?chst=d_bubble_icon_text_small&chld=glyphish_paperclip|bbtl|Select+position|B7B529|05050D';
			console.log('Setting up locationMarker with opts.center: ' + opts.center.toString() + ', icon: ' + icon);
			$.renshuu.locationMarker = $.renshuu.markers.createMarker(
				opts.center, 'Choose position', icon, true
			);

			google.maps.event.addListener($.renshuu.locationMarker, 'drag', function (event) {
				// update position info in the form
				var pos = $.renshuu.locationMarker.getPosition();
				$('input[name=latitude]').val(pos.lat());
				$('input[name=longitude]').val(pos.lng());
			});
			google.maps.event.addListener($.renshuu.locationMarker, 'dragstart', function (event) {
				// This event is fired when the user starts dragging the marker.
			});
			google.maps.event.addListener($.renshuu.locationMarker, 'dragend', function (event) {
				// geocode current position if the form setting allows.
				// propably should geocode anyway, and only until a click on those appearing marker the address would be filled...
				if ($('input[name=geocode][value=position]').is(':checked')) {
					var pos = $.renshuu.locationMarker.getPosition();

					// Clear earlier geocode markers
					$.renshuu.data.removeAllGeoMarkers();

					$.renshuu.data.geocodePosition(
						{ location: pos },
						$.renshuu.data.addGeoMarkers
					);
				}
			});
			$.renshuu.locationMarker.setVisible(false);

			$.renshuu.callbacks.initiate();

			$(window).resize(function () {
				google.maps.event.trigger($.renshuu.map, 'resize');
			});
		},

		/**
		 * Initiate the following tools related to Google Street View:
		 * - StreetViewPanorama
		 * - StreetViewService
		 */
		streetInit: function (street_element, street_options) {
			$.renshuu.streetService = new google.maps.StreetViewService();
			$.renshuu.streetView = new google.maps.StreetViewPanorama(street_element, street_options);




			// The marker which can be dragged on a spot which is should be revealed in Street View
			$.renshuu.streetMarker = $.renshuu.markers.createMarker(
				$.renshuu.map.getCenter(), 'Street View', $.renshuu.pins.getPinStar('glyphish_eye'), true
			);

			// Marker draggin overrides the Street View position and makes it visible if hidden.
			google.maps.event.addListener($.renshuu.streetMarker, 'dragend', function () {
				var pos = $.renshuu.streetMarker.getPosition();
				console.log('streetMarker dragend. pos: ' + pos);
				$.renshuu.streetView.setPosition(pos);
				if (!$.renshuu.streetView.getVisible()) {
					$.renshuu.streetView.setVisible(true);
				}
			});

			// This is a bit tricky as the position changes twice in a row
			// when it is first set by the marker position and then by itself
			google.maps.event.addListener($.renshuu.streetView, 'position_changed', function () {
				var posS = $.renshuu.streetView.getPosition();
				var posM = $.renshuu.streetMarker.getPosition();
				console.log('streetView position_changed. posS: ' + posS + ', posM: ' + posM);
				if (posS && !posS.equals(posM)) {
					console.log('streetView position_change positions do not equal, thus setting marker to streetView position.');
					$.renshuu.streetMarker.setPosition(posS);
				}
			});

			// When Street View is set visible, the position for it should have been set before, thus its position is the one that is used for the marker.
			google.maps.event.addListener($.renshuu.streetView, 'visible_changed', function () {
				var posS = $.renshuu.streetView.getPosition();
				var posM = $.renshuu.streetMarker.getPosition();
				var bounds = $.renshuu.map.getBounds();
				var visible = $.renshuu.streetView.getVisible();

				console.log('streetView visible_changed. visible: ' + visible + ', posS: ' + posS + ', posM: ' + posM);

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

			$.renshuu.map.setStreetView($.renshuu.streetView);

			$(window).resize(function () {
				google.maps.event.trigger($.renshuu.streetView, 'resize');
			});
		},

		/**
		 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#StreetViewService
		 * getPanoramaByLocation(latlng:LatLng, radius:number, callback:function (StreetViewPanoramaData, StreetViewStatus):void))
		 */
		getPanorama: function (pos, radius) {
			if (!radius) {
				radius = 100; // Metres
			}
			$.renshuu.streetService.getPanoramaByLocation(pos, radius, function (data, status) {
				console.log('getPanorama. status: ' + status);
			});
		},

		/**
		 * Set the icon next to the radio buttons in the location form
		 */
		updateGeocodeSelectionIcon: function () {
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

		/**
		 *
		 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#Marker
		 */
		clearMarkers: function (list) {
			var len = list.length;
			for (var i = 0; i < len; ++i) {
				var marker = list[i];
				// "If map is set to null, the marker will be removed."
				marker.setMap(null);
			}
			list = [];
		},

		/**
		 *
		 * @see
		 */
		createTrainingMarker: function (data) {
			var icon = $.renshuu.pins.getLetter(data.training.art.title.substr(0, 1), '0E3621', '05050D');
			var pos = new google.maps.LatLng(data.location.latitude, data.location.longitude);
			var marker = $.renshuu.markers.createMarker(pos, data.training.art.title + ' / ' + data.location.title, icon, false);

			google.maps.event.addListener(marker, 'click', function (event) {
				// This event is fired when the marker icon was clicked.
				var pos = marker.getPosition();
				console.log('training marker. click - ' + marker.title + ', pos: ' + pos);
				// Show the blockUi over map with the details
				$.renshuu.markers.showInfo(marker);
			});

			var len = $.renshuu.trainingMarkers.push(marker);
			$.renshuu.trainingMarkersData[len - 1] = data;
		},

		/**
		 *
		 * @see
		 */
		createLocationMarker: function (data) {
			var icon = $.renshuu.pins.getBubble('glyphish_flag', data.location.title, '0E3621', '05050D');
			var pos = new google.maps.LatLng(data.location.latitude, data.location.longitude);
			var marker = $.renshuu.markers.createMarker(pos, data.location.title, icon, false);

			google.maps.event.addListener(marker, 'click', function (event) {
				// This event is fired when the marker icon was clicked.
				var pos = marker.getPosition();
				console.log('location marker. click - ' + marker.title + ', pos: ' + pos);
				// This should now fill the address in the "training" form...
			});

			var len = $.renshuu.locationMarkers.push(marker);
			$.renshuu.locationMarkersData[len - 1] = data;
		},

		/**
		 *
		 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#GeocoderResult
		 */
		createGeocodeMarker: function (res, i) {

			for (var j in res) {
				if (res.hasOwnProperty(j)) {
					console.log('res[' + j + '] = ' + res[j]);
				}
			}


			for (var s in res.address_components) {
				var a = res.address_components[s];
				for (var c in a) {
					console.log('address_components: ' + s + ' --\> ' + c + ' = ' + a[c]);
				}
			}
			for (var g in res.geometry) {
				console.log('geometry: ' + g + ' = ' + res.geometry[g]);
			}

			var marker = $.renshuu.markers.createMarker(
				res.geometry.location,
				res.formatted_address,
				$.renshuu.pins.getLetter(i + 1),
				false
			);
			// Right click will be used for deleting...
			google.maps.event.addListener(marker, 'rightclick', function (event) {
				$.renshuu.data.removeGeoMarker(marker);
			});
			google.maps.event.addListener(marker, 'click', function (event) {
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

		/**
		 * Create a simple marker with common settings and listeners.
		 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#MarkerOptions
		 */
		createMarker: function (pos, title, icon, drag) {
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
				icon: icon,
				animation: google.maps.Animation.DROP
			});

			// Marker double click shows that spot in street view
			google.maps.event.addListener(marker, 'dblclick', function (event) {
				// This event is fired when the marker icon was double clicked.
				console.log('marker. dblclick - ' + marker.title);
				console.log('showInStreetView: ' + $.renshuu.markers.showInStreetView);
				if ($.renshuu.markers.showInStreetView) {
					$.renshuu.showStreetView(marker.getPosition());
				}
			});
			google.maps.event.addListener(marker, 'mouseout', function (event) {
				// This event is fired when the mouse leaves the area of the marker icon.
			});
			google.maps.event.addListener(marker, 'mouseover', function (event) {
				// This event is fired when the mouse enters the area of the marker icon.
			});
			/*
			google.maps.event.addListener(marker, 'position_changed', function () {
				// This event is fired when the marker position property changes.
				console.log('marker. position_changed - ' + marker.title);
			});
			*/
			google.maps.event.addListener(marker, 'rightclick', function (event) {
				// This event is fired when the marker is right clicked on.
			});

			return marker;
		},

		/**
		 *
		 * @see http://malsup.com/jquery/block/
		 */
		showInfo: function (marker) {
			var inx = $.renshuu.trainingMarkers.indexOf(marker);
			console.log('showInfo. marker.title: '+ marker.title + ', inx: ' + inx);
			var data;
			if (inx !== -1) {
				data = $.renshuu.trainingMarkersData[inx];
			}

			if (data) {
				console.log('showInfo. data. ' + data);
				// Get data
				var info = $.renshuu.markers.buildInfoWindow(data);
				// Create overlay
				$('#map').block();
				$('.modal-close').one('click', function () {
					$('#map').unblock();
					return false;
				});
				// Fill overlay with the data inserted to a template
				$('#modalTemplate').tmpl(info).appendTo('div.blockMsg');
			}
		},

		/**
		 *
		 * @see
		 */
		buildInfoWindow: function (data) {
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

			// Had too many checks for existing variables,
			// which should be taken care of at the backend.
			var info = {};

			if (data.training && data.training.art && data.training.id) {
				info = {
					trainingId: data.training.id,
					trainingTitle: (data.training.title ? data.training.title : null),
					trainingStime: data.training.starttime ? data.training.starttime : null,
					trainingEtime: data.training.endtime ? data.training.endtime : null,
					weekDay: ($.renshuu.weekdays.length > data.training.weekday ? $.renshuu.weekdays[data.training.weekday] : ''),
					artId: (data.training.art.id ? data.training.art.id : null),
					artTitle: (data.training.art.title ? data.training.art.title : null),
					personId: (data.person && data.person.id) ? data.person.id : null,
					personTitle: (data.person && data.person.title) ? data.person.title : null,
					personContact: (data.person && data.person.contact) ? data.person.contact : null,
					locationId: (data.location && data.location.id) ? data.location.id : null,
					locationTitle: (data.location && data.location.title) ? data.location.title : null,
					locationUrl: (data.location && data.location.url) ? data.location.url : null,
					locationLat: (data.location && data.location.latitude) ? data.location.latitude : null,
					locationLng: (data.location && data.location.longitude) ? data.location.longitude : null,
					locationAddr: (data.location && data.location.address) ? data.location.address : null,
					langSave: $.renshuu.lang.modal.savetolist,
					langRemove: $.renshuu.lang.modal.removefromlist
				};
			}

			console.debug('buildInfoWindow. info. ' + info);
			//$(info).appendTo('body');
			return info;
		}
	};

	$.renshuu.data = {
		/**
		 *
		 * @see http://en.wikipedia.org/wiki/Geographic_coordinate_conversion
		 */
		deg2dms: function (degfloat, isLatitude) {
			var letter = isLatitude ? 'NS' : 'EW';

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
				min++;
				secfloat = 0;
			}
			if (min == 60) {
				deg++;
				min = 0;
			}
			//W 87°43'41"

			return (deg + '° ' + min + "' " + secfloat + '" ' + letter);
		},

		/**
		 * Geocode an address based on a given text or latitude and longitude.
		 * data {
		 *    address: "",
		 *    bounds: LatLngBounds,
		 *    language: "",
		 *    location: LatLng,
		 *    region: ""
		 *  }
		 * callBack(key, results, status)
		 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#Geocoder
		 */
		geocodePosition: function (data, callBack) {
			if (!callBack) {
				callBack = $.renshuu.data.addGeoMarkers;
			}
			if (!data.language) {
				data.language = 'ja';
			}
			$.renshuu.geocoder.geocode(
				data,
				function (results, status) {
					//console.log('geocodePosition. results: ' + results + ', status: ' + status);
					if (results && status == google.maps.GeocoderStatus.OK) {
						var key = data.address ? data.address : data.location.toString();
						//console.log('geocodePosition. key: ' + key);
						callBack.apply(this, [key, results, status]);
					}
				}
			);
		},

		/**
		 * Based on the geocode results, add max three markers.
		 * @param key		Must be a string, either location or address, used in geocode request.
		 * @param results	An array of google.maps.GeocoderResult,
		 * @param status	A constant from google.maps.GeocoderStatus...
		 *   ERROR			 	There was a problem contacting the Google servers.
         *   INVALID_REQUEST 	This GeocoderRequest was invalid.
         *   OK 				The response contains a valid GeocoderResponse.
         *   OVER_QUERY_LIMIT 	The webpage has gone over the requests limit in too short a period of time.
         *   REQUEST_DENIED 	The webpage is not allowed to use the geocoder.
         *   UNKNOWN_ERROR 		A geocoding request could not be processed due to a server error. The request may succeed if you try again.
         *   ZERO_RESULTS 		No result was found for this GeocoderRequest.
		 *
		 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#GeocoderResult
		 * {
		 *   address_components: [
		 *     long_name: "",
		 *     short_name: "",
		 *     types: []
		 *   ],
		 *   geometry: {
		 *     bounds: LatLngBounds,
		 *     location: LatLng,
		 *     location_type: GeocoderLocationType,
		 *     viewport: LatLngBounds
		 *   },
		 *   types: [],
		 *   formatted_address: "" (not documented)
		 * }
		 */
		addGeoMarkers: function (key, results, status) {
			console.log('addGeoMarkers. key: ' + key + ', status: ' + status + ', results: ' + results);
			var lenG = $.renshuu.geocodeMarkers.length;
			var markers = [];
			var len = Math.min(3, results.length); // Max three results
			console.log('addGeoMarkers. len: ' + len);

			for (var i = 0; i < len; ++i) {
				// Should check that each address has only one marker.
				markers.push($.renshuu.markers.createGeocodeMarker(results[i], i));

				console.log('addGeoMarkers. i: ' + i);

			}
			// { key:"address or lat/lng that was tried to be geocoded", markers: [] }
			$.renshuu.geocodeMarkers.push({
				key: key,
				markers: markers
			});
			//$('input[name=address]').val(results[0].formatted_address);
				//$('input[name=address]').val('Cannot determine address at this location.');

		},

		/**
		 * Removes one marker from the list of geocode result markers.
		 * If it was the last one in that patch, then the whole patch will be removed.
		 * @see
		 */
		removeGeoMarker: function (marker) {
			// { key:"address or lat/lng that was tried to be geocoded", markers: [] }
			var i = $.renshuu.geocodeMarkers.length;
			while (0 < i) {
				--i;
				var markers = $.renshuu.geocodeMarkers[i].markers;
				var inx = $.renshuu.geocodeMarkers.indexOf(marker);
				console.log('rightclicking thus removing marker with title: ' + marker.getTitle() + ', inx: ' + inx + ", i: " + i);
				if (inx !== -1) {
					markers.splice(inx, 1);
				}
				if (markers.length == 0) {
					$.renshuu.geocodeMarkers.splice(i, 1);
				}
			}
			marker.setMap(null);
		},

		/**
		 *
		 * @see
		 */
		removeAllGeoMarkers: function () {
			// { key:"address or lat/lng that was tried to be geocoded", markers: [] }
			var lenG = $.renshuu.geocodeMarkers.length;
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
		/**
		 *
		 * @see
		 */
		updateZoomCookie: function () {
			var zoom = $.renshuu.map.getZoom();
			$.cookie(
				'mapZoom',
				zoom,
				$.renshuu.cookieSettings
			);
			$.renshuu.zoom = zoom;
		},
		/**
		 *
		 * @see
		 */
		updateCenterCookie: function () {
			var center = $.renshuu.map.getCenter();
			$.cookie(
				'mapCenter',
				center.lat() + ',' + center.lng(),
				$.renshuu.cookieSettings
			);
		},

		/**
		 *
		 * @see
		 */
		initiate: function () {
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
		bounds_changed: function () {
			// This event is fired when the viewport bounds have changed
			if (location.hash == '#location' || location.hash == '#training') {
				$.renshuu.updateLocations();
			}
		},
		center_changed: function () {
			// This event is fired when the map center property changes.
			$.renshuu.callbacks.updateCenterCookie();
		},
		maptypeid_changed: function () {
			// This event is fired when the mapTypeId property changes.
		},
		mousemove: function (event) {
			// This event is fired whenever the user's mouse moves over the map container.
		},
		mouseout: function (event) {
			// This event is fired when the user's mouse exits the map container.
		},
		mouseover: function (event) {
			// This event is fired when the user's mouse enters the map container.
		},
		projection_changed: function () {
			// This event is fired when the projection has changed.
		},
		rightclick: function (event) {
			// This event is fired when the DOM contextmenu event is fired on the map container.
		},
		zoom_changed: function () {
			// This event is fired when the map zoom property changes.
			$.renshuu.callbacks.updateZoomCookie();
		}
	};

	$.renshuu.pins = {
		/**
		 * MarkerImage(url:string, size?:Size, origin?:Point, anchor?:Point, scaledSize?:Size)
		 * @see http://code.google.com/apis/chart/docs/gallery/dynamic_icons.html#icon_list
		 */
		getMarkerImage: function (image, size, origin, anchor) {
			console.log('getMarkerImage. image: ' + image + ', size: ' + size + ', origin: ' + origin + ' , anchor: ' + anchor);
			return new google.maps.MarkerImage(
				'http://chart.apis.google.com/chart?' + image, size, origin, anchor, size
			);
		},

		/**
		 *
		 * @see http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=fire|ADDE63
		 */
		getIcon: function (icon, color) { // 21, 34
			if (!icon) {
				icon = 'fire';
			}
			if (!color) {
				color = 'ADDE63';
			}
			return $.renshuu.pins.getMarkerImage(
				'chst=d_map_pin_icon&chld=' + icon + '|' + color
			);
		},

		/**
		 *
		 * @see http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=場|ADDE63|05050D
		 */
		getLetter: function (letter, fill, color) {
			if (!letter) {
				letter = '場';
			}
			if (!fill) {
				fill = 'ADDE63';
			}
			if (!color) {
				color = '05050D';
			}
			return $.renshuu.pins.getMarkerImage(
				'chst=d_map_pin_letter&chld=' + encodeURI(letter) + '|' + fill + '|' + color
			);
		},

		/**
		 * Type can be only one of the two [pin_sright, pin_sleft], othervise size mismatches.
		 * @see
		 */
		getPinStar: function (icon, fill, star, type) {
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

		/**
		 *
		 * @see
		 */
		getBubble: function (icon, text, fill, color, type) {
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

		gYellowIcon: function () { return $.renshuu.pins.getIcon('glyphish_target', 'F9FBF7'); },
		gRedIcon: function () { return $.renshuu.pins.getIcon('star', 'CC2233'); },
		gBlueIcon: function () { return $.renshuu.pins.getIcon('snow', '2233CC'); }
	};


	$.renshuu.forms = {

		// Save the earlierly fetched form elements with callbacks once set.
		cache: {},

		types: ['art', 'location', 'training', 'person', 'user', 'login', 'register'],

		/**
		 * Seven types available: art, location, training, person, user, login, register
		 * @see
		 */
		getForm: function (type) {
			if ($.renshuu.forms.cache[type])
			{
				$.renshuu.forms.showForm(type);
			}
			else
			{
				$.post($.renshuu.ajaxpoint.form + type, function (data, status) {
					//console.dir(data);
					if (data.response && data.response.form)
					{
						$.renshuu.forms.setForm(data.response.form, type);
						$.renshuu.forms.showForm(type);
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

		/**
		 *
		 * @see
		 */
		showForm: function (type) {
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

		/**
		 * User data binding
		 * @see
		 */
		fillUserData: function () {
			var userData = $.renshuu.userData;
			if (userData) {
				$('#profile_form input[name=email]').val(userData.email);
				$('#profile_form input[name=title]').val(userData.name);
				$('#profile_form input[name=email]').val(userData.email);
			}
		}
	};


})(jQuery);
