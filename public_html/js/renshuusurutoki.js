/*jslint devel: true, windows: true, maxlen: 140 */
// http://jslint.com/

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

(function($) {
	/**
	 * Get the inner and outer html data,
	 * that is the selected element itself including.
	 */
	$.fn.outerHtml = function() {
		var outer = null;
		if (this.length) {
			var div = $('<div style="display:none"><' + '/div>');
			var clone = $(this[0].cloneNode(false)).html(this.html()).appendTo(div);
			outer = div.html();
			div.remove();
		}
		return outer;
	};
})(jQuery);

$(document).ready(function() {
	$.reshuuSuruToki.ready();
});

(function($) {

	$.reshuuSuruToki = {
		animSpeed: 200,

		// default map zoom, overwritten on every zoom change event and/or by cookie
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

		// http://code.google.com/apis/maps/documentation/javascript/reference.html
		map: null,

		streetview: null, //StreetViewPanorama
		streetService: null,

		// default map center will be in the most beautiful castle of Japan
		hikone: null,

		tabContentElement: '#tabcontent',
		filtersHtml: null,

		// Default filter settings
		filterSettings: {
			arts: [],
			weekdays: [0, 1, 2, 3, 4, 5, 6] // all weekdays are selected by default
		},

		// Icons (css rules) to use for named menu items, prepended with "icon-"
		menuicons: {
			filters: 'equalizer',
			location: 'addressbook',
			art: 'smirk',
			profile: 'womanman',
			login: 'lock'
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

		ready: function() {
			// http://www.flickr.com/photos/rekishinotabi/sets/72157618241282853/
			$.reshuuSuruToki.hikone = new google.maps.LatLng(35.27655600992416, 136.25263971710206);

			// Check for a cookie in case the center would be some other.
			var centre = $.reshuuSuruToki.hikone;
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
					$.reshuuSuruToki.zoom = zoom;
				}
				console.log('mapZoom cookie existed. zoom: ' + zoom);
			}

			// Handler for the ability to toggle streetview viewing while marker click.
			if ($.cookie('showInStreetView')) {
				$('input:checkbox[name=markerstreet]').attr('checked', 'checked');
				$.reshuuSuruToki.markers.showInStreetView = true;
			}

			// Fill the array with current language weekday names.
			$.reshuuSuruToki.data.getWeekdays();

			// Set up the Google Map v3 and the Street View
			$.reshuuSuruToki.mapInit(
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

			$('input:checkbox[name=markerstreet]').change(function() {
				$.reshuuSuruToki.markers.showInStreetView = $(this).is(':checked');
				console.log('markerstreet change. ' + $.reshuuSuruToki.markers.showInStreetView);
				$.cookie(
					'showInStreetView',
					$.reshuuSuruToki.markers.showInStreetView,
					$.reshuuSuruToki.cookieSettings
				);
			});

			// Triggers on individual change of the checkboxes
			$('#filtering input:checkbox').live('change', function () {
				var name = $(this).attr('name');
				var check = $(this).is(':checked');
				console.log('change. name: ' + name + ', check: ' + check);

				$.reshuuSuruToki.updateFilters();
			});

			// Triggers on a click to any of the shortcuts for selection manipulation
			$('#filtering p[class^=rel_] a').live('click', function () {
				var action = $(this).attr('rel');
				var target = $(this).parent('p').attr('class');
				target = target.substr(target.indexOf('_') + 1);

				console.log('action: ' + action + ', target: ' + target);

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
					$.reshuuSuruToki.updateFilters();
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
				con.toggle($.reshuuSuruToki.animSpeed);
				return false;
			});
			// Navigation to forms is done via tabs at the right
			$('#navigation a').live('click', function () {
				var href = $(this).attr('href');
				var key = href.substr(href.indexOf('#') + 1);
				console.log('#navigation a -- live click. key: ' + key);
				$.reshuuSuruToki.showTabContent(key);
				return false;
			});

			$('#mapping .header a[rel=street]').click(function() {
				var visible = $.reshuuSuruToki.streetview.getVisible();
				$.reshuuSuruToki.streetview.setVisible(!visible);
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
				$.reshuuSuruToki.addSavedList(id);
				$('.modal-tools a[rel=removefromlist][href=' + href + ']').show();
				$(this).hide();
				return false;
			});
			$('.modal-tools a[rel=removefromlist]').live('click', function() {
				var href = $(this).attr('href');
				var id = href.split('-').pop();
				console.log('removefromlist click. href: ' + href + ', id: ' + id);
				$.reshuuSuruToki.removeSavedList(id);
				$('.modal-tools a[rel=savetolist][href=' + href + ']').show();
				$(this).hide();
				return false;
			});
			$('#savedlist a[rel=remove]').live('click', function() {
				var href = $(this).attr('href');
				var id = href.split('-').pop();
				console.log('#savedlist a[remove] click. href: ' + href + ', id: ' + id);
				$.reshuuSuruToki.removeSavedList(id);
				return false;
			});

			// Note that either "insert" = 0 or "update" = id must be set in the root data...
			$('form').live('submit', function() {
				// http://api.jquery.com/serializeArray/
				var serialized = $(this).serializeArray();
				var len = serialized.length;
				var items = {};
				for (var i = 0; i < len; ++i) {
					items[serialized[i].name] = serialized[i].value;
				}
				var data = { items: items };
				var rel = $(this).attr('rel').split('-'); // insert-0 or update-8
				data[rel[0]] = rel[1];
				console.log('form submit. data: ' + data);

				$.post($(this).attr('action'), data, function(data, status) {
					console.log('form submit. status: ' + status);
					var out = {};
					if (data.result) {
						out.id = data.result.id;
						out.message = data.result.title;
					}
					// data.id, data.message, data.class
					$.reshuuSuruToki.forms.showFormFeedback(out);
				}, 'json');
				return false;
			});

			$('form input:button[name=send]').live('click', function() {
				$(this).parents('form').first().submit();
			});
			
			$('form input:button[name=clear]').live('click', function() {
				$(this).parents('form').first().reset();
			});
			
			// Change icon based on geocode direction
			$('#location_form input:radio[name=geocode]').live('change', function() {
				$.reshuuSuruToki.updateGeocodeSelectionIcon();
			});

			// Special care for the export settings form, in order to update its preview
			$('#export_form input, #export_form select').live('change', function(){
				$.reshuuSuruToki.updateExportPreview();
			});

			// Dragging of the modal window.
			$('h2.summary').live('mousedown', function() {
			});
			$('h2.summary').live('mouseup', function() {
			});

			// http://github.com/nje/jquery-datalink
			/*
			$('#filter_form').link($.reshuuSuruToki.filterSettings, {
				arts: [],
				weekdays: [0, 1, 2, 3, 4, 5, 6]
			});
			*/


			// How about a cookie for the filter settings?
			if ($.cookie('filterArts')) {
				$.reshuuSuruToki.filterSettings.arts = $.cookie('filterArts').split('.');
				console.log('$.cookie filterArts existed. $.reshuuSuruToki.filterSettings.arts: ' + $.reshuuSuruToki.filterSettings.arts);
			}
			if ($.cookie('filterWeekdays')) {
				$.reshuuSuruToki.filterSettings.weekdays = $.cookie('filterWeekdays').split('.');
				console.log('$.cookie filterWeekdays existed. $.reshuuSuruToki.filterSettings.weekdays: ' + $.reshuuSuruToki.filterSettings.weekdays);
			}
			$.reshuuSuruToki.applyFilters();

			// Save the initial filtering form.
			$.reshuuSuruToki.filtersHtml = $('#filtering').outerHtml();
			//console.log('initial $.reshuuSuruToki.filtersHtml: ' + $.reshuuSuruToki.filtersHtml);

			// If the current hash is something that would make filters invisible, store them now
			console.log('on dom ready. location.hash: ' + location.hash + ', location.pathname: ' + location.pathname);
			if (location.hash !== '') {
				var found = false;
				var key = location.hash.substr(1);
				console.log('key: ' + key);
				// Check if the current hash exists in the list of forms if it was not the filter view.
				if (key == 'filters' || $.reshuuSuruToki.forms.types.indexOf(key) !== -1) {
					$.reshuuSuruToki.showTabContent(key);
				}
			}

		},

		showTabContent: function (key) {
			document.location = '#' + key;

			// Remove and add "selected" class
			$('#navigation li').removeClass('selected');
			$('#navigation li:has(a[href=#' + key + '])').addClass('selected');

			// Set icon. Initially the classes are: header icon icon-equalizer. This is the only reference to the id #right.
			// $('#navigation').parent('.header')... ?
			$('#right .header').attr('class', 'header icon icon-' + $.reshuuSuruToki.menuicons[key]);

			if (key == 'filters') {
				$($.reshuuSuruToki.tabContentElement).html($.reshuuSuruToki.filtersHtml);
				$.reshuuSuruToki.applyFilters();
			}
			else if (key == 'location') {
				// begin to show location markers...
			}
			if ($.reshuuSuruToki.forms.types.indexOf(key) !== -1) {
				$.reshuuSuruToki.forms.getForm(key);
			}

			if ($.reshuuSuruToki.locationMarker !== null) {
				if (key == 'location') {
					var pos = $.reshuuSuruToki.map.getCenter();
					$.reshuuSuruToki.locationMarker.setPosition(pos);
					$.reshuuSuruToki.locationMarker.setVisible(true);
					console.log('locationMarker set visible and to pos: ' + pos);
				}
				else {
					$.reshuuSuruToki.locationMarker.setVisible(false);
				}
				console.log('locationMarker is now visible: ' + $.reshuuSuruToki.locationMarker.getVisible());
			}
		},

		// Add a training to the list of saved trainings if it is not there yet.
		addSavedList: function (id) {
			var inx = $.reshuuSuruToki.savedList.indexOf(id);
			var data = null;
			console.log('addSavedList. id: ' + id + ', inx: ' + inx);
			if (inx === -1) {
				$.reshuuSuruToki.savedList.push(id);
				var len = $.reshuuSuruToki.trainingMarkersData.length;
				var savedlen = $.reshuuSuruToki.savedListData.length; // only for debugging
				for (var i = 0; i < len; ++i) {
					data = $.reshuuSuruToki.trainingMarkersData[i];
					if (data.training.id == id) {
						console.log('addSavedList. found matching data for addition, i: ' + i);
						$.reshuuSuruToki.savedListData.push(data);
						break;
					}
				}
				console.log('addSavedList. savedListData length before and after adding try: ' + savedlen + ' > ' + $.reshuuSuruToki.savedListData.length);

				// Now add it to DOM... Should this be made as a table or a list? table.
				if (data !== null) {
					var tr = '<tr rel="' + id + '"><td>' + data.training.art.title + '</td><td>';
					if ($.reshuuSuruToki.data.weekdays.length > data.training.weekday) {
						tr += $.reshuuSuruToki.data.weekdays[data.training.weekday];
					}
					tr += '</td><td>' + data.training.starttime + ' - ' +
						data.training.endtime + '</td><td><a href="#remove-' + id + '" rel="remove" title="' +
						data.training.weekday + '"><img src="/img/sanscons/png/green/32x32/close.png" alt="" /></tr>';
					console.log('inserting tr: ' + tr);
					$('#savedlist tbody').prepend(tr);
				}
			}
		},

		// Remove from list, as a counter part of adding.
		removeSavedList: function (id) {
			var inx = $.reshuuSuruToki.savedList.indexOf(id);
			console.log('removeSavedList. id: ' + id + ', inx: ' + inx);
			if (inx !== -1) {
				$.reshuuSuruToki.savedList.splice(inx, 1);
				var len = $.reshuuSuruToki.savedListData.length;
				for (var i = 0; i < len; ++i) {
					var data = $.reshuuSuruToki.savedListData[i];
					if (data.training.id == id) {
						console.log('removeSavedList. found matching data for removal, i: ' + i);
						$.reshuuSuruToki.savedListData.splice(i, 1);
						break;
					}
				}
				console.log('removeSavedList. savedListData length before and after removal try: ' + len + ' > ' + $.reshuuSuruToki.savedListData.length);

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
				$.reshuuSuruToki.filterSettings[target] = list;
				console.log('updateFilters. target: ' + target + ' = ' + list);
			}

			// Make sure any of the selections was not empty
			if (lens.indexOf(0) == -1) {
				$.reshuuSuruToki.updateTrainings();
			}

			// Cookie is updated every time
			$.cookie(
				'filterArts',
				$.reshuuSuruToki.filterSettings.arts.join('.'),
				$.reshuuSuruToki.cookieSettings
			);
			$.cookie(
				'filterWeekdays',
				$.reshuuSuruToki.filterSettings.weekdays.join('.'),
				$.reshuuSuruToki.cookieSettings
			);
		},

		// This applies the current filter settings to the html in the dom
		applyFilters: function() {
			var sets = ['arts', 'weekdays']; // for in object gives extra data, thus defining these here
			var len = sets.length; // Should be 2
			for (var i = 0; i < len; ++i) {
				var target = sets[i];
				var list = $.reshuuSuruToki.filterSettings[target];
				console.log('applyFilters. target: ' + target + ', list: ' + list);
				if (list) {
					$('#' + target + ' input:checkbox').each(function(i, elem) {
						var rel = $(this).attr('name').split('_').pop();
						var inx = list.indexOf(rel);
						console.log('applyFilters. i: ' + i + ', rel: ' + rel + ', inx: ' + inx);
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

		// http://www.jlpt.jp/samples/forlearners.html
		updateTrainings: function() {
			var bounds = $.reshuuSuruToki.map.getBounds();
			var ne = bounds.getNorthEast();
			var sw = bounds.getSouthWest();
			var para = {
				area: {
					northeast: [ne.lat(), ne.lng()],
					southwest: [sw.lat(), sw.lng()]
				},
				filter: $.reshuuSuruToki.filterSettings
			};

			$.reshuuSuruToki.markers.clearMarkers($.reshuuSuruToki.trainingMarkers);
			$.reshuuSuruToki.trainingMarkersData = [];

			$.post($.reshuuSuruToki.ajaxpoint.get, para, function(data, status) {
				if (data.response && data.response.result) {
					var res = data.response.result;
					var len = res.length;
					for (var i = 0; i < len; ++i) {
						$.reshuuSuruToki.markers.createTrainingMarker(res[i]);
					}
				}
				else {
					console.log('Seems AJAX failed. ' + status);
				}
			}, 'json');
		},
		
		// If current tab view is in the location or training, show training place locations.
		// As opposed to trainings.
		updateLocations: function() {
			var bounds = $.reshuuSuruToki.map.getBounds();
			var ne = bounds.getNorthEast();
			var sw = bounds.getSouthWest();
			var para = {
				area: {
					northeast: [ne.lat(), ne.lng()],
					southwest: [sw.lat(), sw.lng()]
				}
			};
			$.reshuuSuruToki.markers.clearMarkers($.reshuuSuruToki.locationMarkers);
			$.reshuuSuruToki.locationMarkersData = [];
			
			$.post($.reshuuSuruToki.ajaxpoint.get + 'location', para, function(data, status) {
				if (data.response && data.response.result) {
					var res = data.response.result;
					var len = res.length;
					for (var i = 0; i < len; ++i) {
						$.reshuuSuruToki.markers.createLocationMarker(res[i]);
					}
				}
				else {
					console.log('Seems AJAX failed. ' + status);
				}
			}, 'json');
		},

		// http://code.google.com/apis/maps/documentation/staticmaps/
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
				console.log('val: ' + val);
				values.push(field + '=' + val);					
			}
			url += values.join('&');
			// marker requires special attention
			url += '&markers=color:' + $('#export_form input[name=marker]').val() +
				'|label:' + $('#export_form input[name=label]').val() + '|' +
				$.reshuuSuruToki.hikone.lat() + ',' +$.reshuuSuruToki.hikone.lng();

			console.log('updateExportPreview. url: ' + url);

			// perhaps there could be some animation to show that something happened...
			$('#exportpreview').attr('src', url);
		},

		// Show the given position in the Street View. Once visibility set, the opening is taken care of by its event handler.
		showStreetView: function(position) {
			$.reshuuSuruToki.streetview.setPosition(position);
			$.reshuuSuruToki.streetview.setVisible(true);
		},

		mapInit: function(map_element, street_element, map_options, street_options) {
			$.reshuuSuruToki.geocoder = new google.maps.Geocoder();
			$.reshuuSuruToki.streetService = new google.maps.StreetViewService();

			// http://code.google.com/apis/maps/documentation/javascript/reference.html#MapOptions
			var opts = {
				center: $.reshuuSuruToki.hikone,
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
				zoom: $.reshuuSuruToki.zoom
			};

			opts = $.extend(true, {}, opts, map_options);
			$.reshuuSuruToki.map = new google.maps.Map(map_element, opts);

			$.reshuuSuruToki.streetview = new google.maps.StreetViewPanorama(street_element, street_options);


			// The marker which can be dragged on a spot which is should be revealed in Street View
			$.reshuuSuruToki.streetMarker = $.reshuuSuruToki.markers.createMarker(
				$.reshuuSuruToki.map.getCenter(), 'Street View', $.reshuuSuruToki.pins.getPinStar('glyphish_eye'), true
			);

			// Marker draggin overrides the Street View position and makes it visible if hidden.
			google.maps.event.addListener($.reshuuSuruToki.streetMarker, 'dragend', function() {
				var pos = $.reshuuSuruToki.streetMarker.getPosition();
				console.log('streetMarker dragend. pos: ' + pos);
				$.reshuuSuruToki.streetview.setPosition(pos);
				if (!$.reshuuSuruToki.streetview.getVisible()) {
					$.reshuuSuruToki.streetview.setVisible(true);
				}
			});

			// This is a bit tricky as the position changes twice in a row
			// when it is first set by the marker position and then by itself
			google.maps.event.addListener($.reshuuSuruToki.streetview, 'position_changed', function() {
				var posS = $.reshuuSuruToki.streetview.getPosition();
				var posM = $.reshuuSuruToki.streetMarker.getPosition();
				console.log('streetview position_changed. posS: ' + posS + ', posM: ' + posM);
				if (posS && !posS.equals(posM)) {
					console.log('streetview position_change positions do not equal, thus setting marker to streetview position.');
					$.reshuuSuruToki.streetMarker.setPosition(posS);
				}
			});

			// When Street View is set visible, the position for it should have been set before, thus its position is the one that is used for the marker.
			google.maps.event.addListener($.reshuuSuruToki.streetview, 'visible_changed', function() {
				var posS = $.reshuuSuruToki.streetview.getPosition();
				var posM = $.reshuuSuruToki.streetMarker.getPosition();
				var bounds = $.reshuuSuruToki.map.getBounds();
				var visible = $.reshuuSuruToki.streetview.getVisible();

				console.log('streetview visible_changed. visible: ' + visible + ', posS: ' + posS + ', posM: ' + posM);

				if (visible) {
					$(street_element).slideDown();
				}
				else {
					$(street_element).slideUp();
				}
				/*
				if (!bounds.contains(posS)) {
					posS = $.reshuuSuruToki.map.getCenter();
				}
				*/
				if (posS === undefined) {
					posS = $.reshuuSuruToki.map.getCenter();
				}
				$.reshuuSuruToki.streetMarker.setPosition(posS);
				$.reshuuSuruToki.streetMarker.setVisible(visible);
				//$('#street:hidden').slideDown($.reshuuSuruToki.animSpeed);
			});

			$.reshuuSuruToki.map.setStreetView($.reshuuSuruToki.streetview);

			//var icon = $.reshuuSuruToki.pins.getBubble('glyphish_paperclip', 'Select+position');
			var icon = $.reshuuSuruToki.pins.getPinStar('glyphish_paperclip', '5E0202', '05050D', 'pin_sright');
			//var icon = 'http://chart.apis.google.com/chart?chst=d_bubble_icon_text_small&chld=glyphish_paperclip|bbtl|Select+position|B7B529|05050D';
			console.log('Setting up locationMarker with opts.center: ' + opts.center.toString() + ', icon: ' + icon);
			$.reshuuSuruToki.locationMarker = $.reshuuSuruToki.markers.createMarker(
				opts.center, 'Choose position', icon, true
			);

			google.maps.event.addListener($.reshuuSuruToki.locationMarker, 'drag', function(event) {
				// update position info in the form
				var pos = $.reshuuSuruToki.locationMarker.getPosition();
				$('input[name=latitude]').val(pos.lat());
				$('input[name=longitude]').val(pos.lng());
			});
			google.maps.event.addListener($.reshuuSuruToki.locationMarker, 'dragstart', function(event) {
				// This event is fired when the user starts dragging the marker.
			});
			google.maps.event.addListener($.reshuuSuruToki.locationMarker, 'dragend', function(event) {
				// geocode current position if the form setting allows.
				// propably should geocode anyway, and only until a click on those appearing marker the address would be filled...
				if ($('input[name=geocode][value=position]').is(':checked')) {
					var pos = $.reshuuSuruToki.locationMarker.getPosition();
					$.reshuuSuruToki.data.geocodePosition(pos);
				}
			});
			$.reshuuSuruToki.locationMarker.setVisible(false);

			$.reshuuSuruToki.callbacks.initiate();

			$(window).resize(function() {
				google.maps.event.trigger($.reshuuSuruToki.map, 'resize');
				google.maps.event.trigger($.reshuuSuruToki.streetview, 'resize');
			});
		},

		// http://code.google.com/apis/maps/documentation/javascript/reference.html#StreetViewService
		// getPanoramaByLocation(latlng:LatLng, radius:number, callback:function(StreetViewPanoramaData, StreetViewStatus):void))
		getPanorama: function(pos, radius) {
			if (!radius) {
				radius = 100; // Metres
			}
			$.reshuuSuruToki.streetService.getPanoramaByLocation(pos, radius, function(data, status) {
				console.log('getPanorama. status: ' + status);
			});
		},
		
		// Set the icon next to the radio buttons in the location form
		updateGeocodeSelectionIcon: function() {
			if ($('#location_form').size() > 0) {
				var val = $('#location_form input:radio[name=geocode]:checked').val();
				console.log('updateGeocodeSelectionIcon. val: ' + val);
				$('#location_form .radioset').attr('class', 'radioset').addClass('icon-' + $.reshuuSuruToki.geocodeClass[val]); // remove icon-* and add icon-*
				$.cookie(
					'locationGeocode',
					val,
					$.reshuuSuruToki.cookieSettings
				);
				$.reshuuSuruToki.geocodeBasedOn = val;
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
	$.reshuuSuruToki.markers = {

		// As per marker double click, show its position in Street View
		showInStreetView: false,

		clearMarkers: function(list) {
			var len = list.length;
			for (var i = 0; i < len; ++i) {
				var marker = list[i];
				marker.setMap(null);
			}
			list = [];
		},

		createTrainingMarker: function(data) {
			var icon = $.reshuuSuruToki.pins.getLetter(data.training.art.title.substr(0, 1), '0E3621', '05050D');
			var pos = new google.maps.LatLng(data.location.latitude, data.location.longitude);
			var marker = $.reshuuSuruToki.markers.createMarker(pos, data.training.art.title + ' / ' + data.location.title, icon, false);

			google.maps.event.addListener(marker, 'click', function(event) {
				// This event is fired when the marker icon was clicked.
				var pos = marker.getPosition();
				console.log('training marker. click - ' + marker.title + ', pos: ' + pos);
				// Open a modal window with the details
				$.reshuuSuruToki.markers.openModal(marker);
			});

			var len = $.reshuuSuruToki.trainingMarkers.push(marker);
			$.reshuuSuruToki.trainingMarkersData[len - 1] = data;
		},
		
		createLocationMarker: function(data) {
			var icon = $.reshuuSuruToki.pins.getBubble('glyphish_flag', data.location.title, '0E3621', '05050D');
			var pos = new google.maps.LatLng(data.location.latitude, data.location.longitude);
			var marker = $.reshuuSuruToki.markers.createMarker(pos, data.location.title, icon, false);

			google.maps.event.addListener(marker, 'click', function(event) {
				// This event is fired when the marker icon was clicked.
				var pos = marker.getPosition();
				console.log('location marker. click - ' + marker.title + ', pos: ' + pos);
				// This should now fill the address in the "training" form...
			});

			var len = $.reshuuSuruToki.locationMarkers.push(marker);
			$.reshuuSuruToki.locationMarkersData[len - 1] = data;
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
			var marker = $.reshuuSuruToki.markers.createMarker(
				res.geometry.location, res.formatted_address,
				$.reshuuSuruToki.pins.getLetter(i + 1), false);
			// Right click will be used for deleting...
			google.maps.event.addListener(marker, 'rightclick', function(event) {
				$.reshuuSuruToki.data.removeGeoMarker(marker);
			});
			google.maps.event.addListener(marker, 'click', function(event) {
				// This event is fired when the marker is right clicked on.
				var title = marker.getTitle();
				var pos = marker.getPosition();
				console.log('clicking geocode marker. title: ' + title + ', pos: ' + pos);
				if ($.reshuuSuruToki.geocodeBasedOn == 'position') {
					$('input[name=address]').val(title);
				}
				else if ($.reshuuSuruToki.geocodeBasedOn == 'address') {
					$('input[name=latitude]').val(pos.lat());
					$('input[name=longitude]').val(pos.lng());
				}
			});

			return marker;
		},

		createMarker: function(pos, title, icon, drag) {
			// http://code.google.com/apis/maps/documentation/javascript/reference.html#MarkerOptions
			if (!icon) {
				icon = $.reshuuSuruToki.pins.getIcon();
			}
			if (drag === null) {
				drag = false;
			}
			console.log('createMarker. pos: ' + pos + ', title: ' + title + ', drag: ' + drag);
			var marker = new google.maps.Marker({
				position: pos,
				title: title,
				map: $.reshuuSuruToki.map,
				draggable: drag,
				icon: icon
			});

			google.maps.event.addListener(marker, 'dblclick', function(event) {
				// This event is fired when the marker icon was double clicked.
				console.log('marker. dblclick - ' + marker.title);
				console.log('showInStreetView: ' + $.reshuuSuruToki.markers.showInStreetView);
				if ($.reshuuSuruToki.markers.showInStreetView) {
					$.reshuuSuruToki.showStreetView(marker.getPosition());
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

		// http://www.ericmmartin.com/projects/simplemodal/
		openModal: function(marker) {
			var inx = $.reshuuSuruToki.trainingMarkers.indexOf(marker);
			console.log('openModal. marker.title: '+ marker.title + ', inx: ' + inx);
			var data;
			if (inx !== -1) {
				data = $.reshuuSuruToki.trainingMarkersData[inx];
			}

			if (data) {
				console.log('openModal. data. ' + data);
				var info = $.reshuuSuruToki.markers.buildInfoWindow(data);
				$.modal(info, {
					/*
					onOpen: function(dialog) {
						dialog.overlay.fadeIn('slow', function() {
							dialog.container.slideDown('slow', function() {
								dialog.data.fadeIn('slow');
							});
						});
					},
					onClose: function(dialog) {
						dialog.data.fadeOut('slow', function() {
							dialog.container.hide('slow', function() {
								dialog.overlay.slideUp('slow', function() {
									$.modal.close();
								});
							});
						});
					},
					*/
					closeClass: 'modal-close',
					modal: false
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
			var info = '<div class="modal-info vevent">';
			if (data.training && data.training.art && data.training.art.id && data.training.art.title) {
				info += '<h2 class="summary" rel="art-' + data.training.art.id + '">' +
					'<a href="#training-' + data.training.id + '" class="modal-close uid icon-close" title="' +
					data.training.art.title + '">' + data.training.art.title + '</a></h2>';
			}
			if (data.training && data.training.id && data.training.weekday) {
				info += '<p class="modal-time" rel="training-' + data.training.id + '">';
				if ($.reshuuSuruToki.data.weekdays.length > data.training.weekday) {
					info += $.reshuuSuruToki.data.weekdays[data.training.weekday];
				}
				if (data.training.starttime && data.training.endtime) {
					info += '<span class="dtstart">' + data.training.starttime +
						'</span>-<span class="dtend">' + data.training.endtime + '</span>';
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
					$.reshuuSuruToki.data.deg2dms(data.location.latitude, true) + '</abbr>' +
					'<abbr class="longitude" title="' + data.location.longitude + '">' +
					$.reshuuSuruToki.data.deg2dms(data.location.longitude, false) + '</abbr></span>' +
					'</address>';
			}
			if (data.training && data.training.id) {
				info += '<p class="modal-tools">';
				info += '<a href="#training-' + data.training.id +
					'" title="Save to list" rel="savetolist">Save to list</a>';
				info += '<a href="#training-' + data.training.id + '" title="Remove from list" ' +
					'rel="removefromlist" style="display:none;">Remove from list</a>';
				info += '</p>';
			}
			info += '</div>';

			console.log('buildInfoWindow. info. ' + info);
			//$(info).appendTo('body');
			return info;
		}
	};

	$.reshuuSuruToki.data = {
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

		weekdays: [],

		// Ran when DOM is ready. Fetches the weekdays from the list in filters for current language.
		getWeekdays: function() {
			$('#weekdays li').each(function(index) {
				$.reshuuSuruToki.data.weekdays[index] = $(this).attr('title');
			});
			console.log('$.reshuuSuruToki.data.weekdays: ' + $.reshuuSuruToki.data.weekdays);
		},

		geocodePosition: function(pos) {
			// http://code.google.com/apis/maps/documentation/javascript/reference.html#Geocoder
			// Clear earlier geocode markers
			$.reshuuSuruToki.data.removeAllGeoMarkers();
			$.reshuuSuruToki.geocoder.geocode(
				{ location: pos, language: 'ja' },
				function(results, status) {
					if (results) {
						var len = Math.min(3, results.length);
						// Max three results
						for (var i = 0; i < len; ++i) {
							// http://code.google.com/apis/maps/documentation/javascript/reference.html#GeocoderResult
							var marker = $.reshuuSuruToki.markers.createGeocodeMarker(results[i], i);
							$.reshuuSuruToki.geocodeMarkers.push(marker);

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
			var inx = $.reshuuSuruToki.geocodeMarkers.indexOf(marker);
			console.log('rightclicking thus removing marker with title: ' + marker.getTitle() + ', inx: ' + inx);
			if (inx !== -1) {
				$.reshuuSuruToki.geocodeMarkers.splice(inx, 1);
			}
			marker.setMap(null);
		},

		removeAllGeoMarkers: function() {
			var len = $.reshuuSuruToki.geocodeMarkers.length;
			while (len > 0) {
				len--;
				var marker = $.reshuuSuruToki.geocodeMarkers[len];
				$.reshuuSuruToki.geocodeMarkers.splice(len, 1);
				marker.setMap(null);
			}
			$.reshuuSuruToki.geocodeMarkers = [];
		}
	};

	$.reshuuSuruToki.callbacks = {
		updateZoomCookie: function() {
			var zoom = $.reshuuSuruToki.map.getZoom();
			$.cookie(
				'mapZoom',
				zoom,
				$.reshuuSuruToki.cookieSettings
			);
			$.reshuuSuruToki.zoom = zoom;
		},
		updateCenterCookie: function() {
			var center = $.reshuuSuruToki.map.getCenter();
			$.cookie(
				'mapCenter',
				center.lat() + ',' + center.lng(),
				$.reshuuSuruToki.cookieSettings
			);
		},

		initiate: function() {
			var callbacks = $.reshuuSuruToki.callbacks;
			var map = $.reshuuSuruToki.map;
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
				$.reshuuSuruToki.updateLocations();
			}
		},
		center_changed: function() {
			// This event is fired when the map center property changes.
			$.reshuuSuruToki.callbacks.updateCenterCookie();
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
			$.reshuuSuruToki.callbacks.updateZoomCookie();
		}
	};

	// http://code.google.com/apis/chart/docs/gallery/dynamic_icons.html#icon_list
	$.reshuuSuruToki.pins = {
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
			return $.reshuuSuruToki.pins.getMarkerImage(
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
			return $.reshuuSuruToki.pins.getMarkerImage(
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
			return $.reshuuSuruToki.pins.getMarkerImage(
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
			return $.reshuuSuruToki.pins.getMarkerImage(
				'chst=d_bubble_icon_text_small&chld=' + icon + '|' + encodeURI(text) + '|' +
				type + '|' + fill + '|' + color, size, origin, anchor
			);
		},

		gYellowIcon: function() { return $.reshuuSuruToki.pins.getIcon('glyphish_target', 'F9FBF7'); },
		gRedIcon: function() { return $.reshuuSuruToki.pins.getIcon('star', 'CC2233'); },
		gBlueIcon: function() { return $.reshuuSuruToki.pins.getIcon('snow', '2233CC'); }
	};


	$.reshuuSuruToki.forms = {

		// Save the earlierly fetched form elements with callbacks once set.
		cache: {},

		types: ['art', 'location', 'training', 'person', 'profile', 'login'],

		// Six types available: art, location, training, person, profile, login
		getForm: function(type) {
			if ($.reshuuSuruToki.forms.cache[type])
			{
				$.reshuuSuruToki.forms.showForm(type);
			}
			else
			{
				$.post($.reshuuSuruToki.ajaxpoint.form + type, function(data, status) {
					if (data.response && data.response.form)
					{
						$.reshuuSuruToki.forms.setForm(data.response.form, type);
						$.reshuuSuruToki.forms.showForm(type);
					}
				}, 'json');
			}
		},

		// form contains the form element with the requested input fields.
		setForm: function(form, type) {

			// http://code.drewwilson.com/entry/autosuggest-jquery-plugin
			$(form + ' input[name=location]').autoSuggest(
				$.reshuuSuruToki.ajaxpoint.get + 'location', {
					startText: 'Type a location name',
					selectedItemProp: 'id',
					searchObjProps: 'title'
				}
			);
			$(form + ' input[name=art]').autoSuggest(
				$.reshuuSuruToki.ajaxpoint.get + 'art', {
					minChars: 2,
					matchCase: false,
					startText: 'Type an art name',
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
			$(form + ' input[name=title]').inputNotes({
				config: {
					containerTag: 'ul',
					noteTag: 'li'
				},
				minlength: {
					pattern: /^(.){0,5}$/i,
					type: 'info',
					text: 'Minimum password length is 6 characters.'
				},


				requiredfield: {
					pattern: /(^(\s)+$)|(^$)/,
					type: 'warning',
					text: 'This field is required!'
				},

				email: {
					pattern: /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+$/,
					type: 'info',
					text: 'Yes, that\'s a valid email address!'
				}
			});

			*/


			// http://code.google.com/p/jquerytimepicker/
			$(form + ' input[name=starttime]').timePicker();

			// http://www.jnathanson.com/index.cfm?page=jquery/clockpick/ClockPick
			$(form + ' input[name=endtime]').clockpick();

			$(form + ' fieldset').corner();


			$.reshuuSuruToki.forms.cache[type] = form;
		},

		showForm: function(type) {
			var form = $.reshuuSuruToki.forms.cache[type];
			$(form).attr('rel', 'insert-0'); // Always empty and ready to insert a new.
			$($.reshuuSuruToki.tabContentElement).contents().detach(); // clean but save
			$($.reshuuSuruToki.tabContentElement).html(form);
			
			// If location form is used, check the possible cookie.
			if (type == 'location' && $.cookie('locationGeocode')) {
				$('#location_form input:radio[name=geocode]').removeAttr('checked');
				$('#location_form input:radio[name=geocode][value=' + $.cookie('locationGeocode') + ']').attr('checked', 'checked');
			}
		},
		
		// After the ajax call made by any of the forms in the tab content, there will be some sort of a feedback
		showFormFeedback: function(data) {
			if (!data) {
				data = {};
			}
			if (!data.class) {
				data.class = 'error icon icon-alert';
			}
			if (!data.id) {
				data.id = '0';
			}
			if (!data.message) {
				data.message = 'Seems that some data was lost...';
			}
			// If for some strange reason this element has gone...
			if ($('#formfeedback').size() == 0) {
				var div = '<div id="formfeedback"></div>';
				$('#tabcontent').prepend(div);
			}
			var html = '<p>' + data.message + '</p>' +
				'<p><a href="#insert-0" title="">create new</a></p>' +
				'<p><a href="#update-' + data.id + '" title="">update current</a></p>';
			$('#formfeedback').attr('class', data.class).html(html);
			// Should it disappear in few seconds...
		}
	};


})(jQuery);