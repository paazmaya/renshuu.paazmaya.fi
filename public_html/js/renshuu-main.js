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
 * Firebug console functions if they do not exist.
 * http://getfirebug.com/wiki/index.php/Console_API
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


var renshuuMain = {
	animSpeed: 200,
	keepAlive: 1000 * 60 * 5, // Every 5 minutes a keepalive call


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
		user: 'womanman'
	},

	/**
	 * Icon used as a background for the geocode direction
	 */
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
	 */
	ready: function () {
		//console.group('ready');
		if (typeof(localStorage) == 'undefined' ) {
			console.log('Your browser does not support HTML5 localStorage. Try upgrading.');
		}

		// How about a existing value for the filter settings?
		var filterArts = localStorage.getItem('filterArts');
		var filterWeekdays = localStorage.getItem('filterWeekdays');
		var tabLeft = localStorage.getItem('tabLeft');
		var tabRight = localStorage.getItem('tabRight');
		
		console.log('tabRight : ' + tabRight);
		console.dir(localStorage);
		/*
		if (typeof filterArts !== 'undefined') {
			renshuuMain.filterSettings.arts = filterArts.split('.');
			console.log('filterArts storage item existed. renshuuMain.filterSettings.arts: ' + renshuuMain.filterSettings.arts);
		}
		if () {
			renshuuMain.filterSettings.weekdays = filterWeekdays.split('.');
			console.log('filterWeekdays storage item existed. renshuuMain.filterSettings.weekdays: ' + renshuuMain.filterSettings.weekdays);
		}
		if () {
			renshuuMain.showTabContent($('#left .icon-list a[data-tab-content="' + tabLeft + '"]'));
		}
		if () {
			renshuuMain.showTabContent($('#right .icon-list a[data-tab-content="' + tabRight + '"]'));
		}
		*/


		// Triggers on individual change of the checkboxes
		$('#filtering input:checkbox').live('change', function () {
			var name = $(this).attr('name');
			var check = $(this).is(':checked');
			console.log('change. name: ' + name + ', check: ' + check);

			renshuuMain.updateFilters();
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
				renshuuMain.updateFilters();
			//}
			return false;
		});

		// Open external links in a new window. Perhaps copyright is the only one...
		$('a[href^="http://"]').live('click', function () {
			var href = $(this).attr('href');
			var now = new Date();
			window.open(href, now.getMilliseconds());
			return false;
		});


		
		// Change tab content
		$('.icon-list a').on('click', function () {
			renshuuMain.showTabContent($(this));
			return false;
		}).on('mouseover', function() {
			var title = $(this).attr('title');
		}).on('mouseout', function() {
		});
		
		
		
		
		// Toggle the visibility of each box
		$('.header p a').click(function () {
			var rel = $(this).attr('rel');
			var con = $(this).parent('p').parent('div').next('.content').children('.stuff');
			console.log('rel: ' + rel + ', con.length: ' + con.length);
			con.toggle(renshuuMain.animSpeed);
			return false;
		});
		


		$('.modal-tools a[rel=savetolist]').live('click', function () {
			var href = $(this).attr('href');
			var id = href.split('-').pop();
			console.log('savetolist click. href: ' + href + ', id: ' + id);
			renshuuMain.addSavedList(id);
			$('.modal-tools a[rel=removefromlist][href=' + href + ']').show();
			$(this).hide();
			return false;
		});
		$('.modal-tools a[rel=removefromlist]').live('click', function () {
			var href = $(this).attr('href');
			var id = href.split('-').pop();
			console.log('removefromlist click. href: ' + href + ', id: ' + id);
			renshuuMain.removeSavedList(id);
			$('.modal-tools a[rel=savetolist][href=' + href + ']').show();
			$(this).hide();
			return false;
		});
		$('#savedlist a[rel=remove]').live('click', function () {
			var href = $(this).attr('href');
			var id = href.split('-').pop();
			console.log('#savedlist a[remove] click. href: ' + href + ', id: ' + id);
			renshuuMain.removeSavedList(id);
			return false;
		});
		$('p.login a').live('click', function () {
			var href = $(this).attr('href').substr(1);
			console.log('href: ' + href);
			renshuuMain.openAuthModal(href);
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
			renshuuMain.updateGeocodeSelectionIcon();
		});

		// Special care for the export settings form, in order to update its preview
		$('#export_form input, #export_form select').live('change', function (){
			renshuuMain.updateExportPreview();
		});
		// Initial load...
		//renshuuMain.updateExportPreview();

		// Dragging of the modal window.
		$('h2.summary').live('mousedown', function () {
		});
		$('h2.summary').live('mouseup', function () {
		});

		// https://github.com/jquery/jquery-datalink
		/*
		// this could handle all the above...
		$('#filter_form').link(renshuuMain.filterSettings, {
			arts: [],
			weekdays: [0, 1, 2, 3, 4, 5, 6]
		});
		*/


		//renshuuMain.applyFilters();


		// Finally, set the keepalive call
		setInterval(function () {
			$.get('/ajax/keepalive', function (data) {
				//console.log(data);
			}, 'json');
		}, renshuuMain.keepAlive);

		
		//console.groupEnd();
	},
	

	/**
	 * Each tab has an individual content.
	 * key Which tab
	 * side	left/right
	 */
	showTabContent: function ($elem) {
		console.group('showTabContent');
		var key = $elem.attr('href').substr(1);
		var title = $elem.attr('title');
		var tab = $elem.data('tabContent');
		console.log('key: ' + key + ', title: ' + title + ', tab: ' + tab);

		// Remove and add "current" class
		$elem.parentsUntil('.icon-list').find('a').removeClass('current');
		$elem.addClass('current');
		
		// Set title
		$elem.closest('.tab-title p').text(title);

		// Hide all that is visible
		$elem.closest('.tab-content > div:visible').hide();
		
		// Show the requested one
		$('#' + tab).show();
		
		// Save current view
		localStorage.setItem('tabRight', $('#right .tab-content > div:visible').attr('id'));
		localStorage.setItem('tabLeft', $('#left .tab-content > div:visible').attr('id'));
		
		
		
		if (key == 'filters') {
			renshuuMain.applyFilters();
		}
		else if (key == 'location') {
			renshuuMain.updateGeocodeSelectionIcon();
			// begin to show location markers...
		}
		if (renshuuForms.types.indexOf(key) !== -1) {
			renshuuForms.getForm(key);
		}

		if (typeof renshuuMap.locationMarker !== 'undefined') {
			if (key == 'location') {
				var pos = renshuuMain.map.getCenter();
				renshuuMap.locationMarker.setPosition(pos);
				renshuuMap.locationMarker.setVisible(true);
				console.log('locationMarker set visible and to pos: ' + pos);
			}
			else {
				renshuuMap.locationMarker.setVisible(false);
			}
			console.log('locationMarker is now visible: ' + renshuuMap.locationMarker.getVisible());
		}
		console.groupEnd();
	},

	/**
	 * Add a training to the list of saved trainings if it is not there yet.
	 * @see
	 */
	addSavedList: function (id) {
		console.group('addSavedList');
		var inx = renshuuMain.savedList.indexOf(id);
		var data = null;
		console.log('id: ' + id + ', inx: ' + inx);
		if (inx === -1) {
			renshuuMain.savedList.push(id);
			var len = renshuuMain.trainingMarkersData.length;
			var savedlen = renshuuMain.savedListData.length; // only for debugging
			for (var i = 0; i < len; ++i) {
				data = renshuuMain.trainingMarkersData[i];
				if (data && data.training.id == id) {
					console.log('found matching data for addition, i: ' + i);
					renshuuMain.savedListData.push(data);
					break;
				}
			}
			console.log('savedListData length before and after adding try: ' + savedlen + ' > ' + renshuuMain.savedListData.length);

			// Now add it to DOM... Should this be made as a table or a list? table.
			// Use template "savedTemplate", but this is used only one way as a template.
			// Removal is done via regular DOM removal actions.
			if (data !== null) {
				var saved = {
					id: id,
					artTitle: data.training.art.title,
					weekDayInt: data.training.weekday,
					weekDay: (renshuuMain.weekdays.length > data.training.weekday ?
						renshuuMain.weekdays[data.training.weekday] : ""),
					startTime: data.training.starttime,
					endTime: data.training.endtime,
					removeTitle: renshuuMain.lang.list.removeitem
				};
				$('#savedTemplate').tmpl(saved).prependTo('#savedlist tbody');
			}
		}
		console.groupEnd();
	},

	/**
	 * Remove from list, as a counter part of adding.
	 * @see
	 */
	removeSavedList: function (id) {
		console.group('removeSavedList');
		var inx = renshuuMain.savedList.indexOf(id);
		console.log('id: ' + id + ', inx: ' + inx);
		if (inx !== -1) {
			renshuuMain.savedList.splice(inx, 1);
			var len = renshuuMain.savedListData.length;
			for (var i = 0; i < len; ++i) {
				var data = renshuuMain.savedListData[i];
				if (data.training.id == id) {
					console.log('found matching data for removal, i: ' + i);
					renshuuMain.savedListData.splice(i, 1);
					break;
				}
			}
			console.log('savedListData length before and after removal try: ' + len + ' > ' + renshuuMain.savedListData.length);

			// Now remove it from DOM
			$('#bottom tbody tr[rel=' + id + ']').remove();
		}
		console.groupEnd();
	},

	/**
	 * Update filters data according to current checkbox selection.
	 * @see
	 */
	updateFilters: function () {
		console.group('updateFilters');
		var sets = ['arts', 'weekdays'];
		var len = sets.length;
		var lens = [];
		console.log('len: ' + len + ', sets: ' + sets);
		for (var i = 0; i < len; ++i) {
			var target = sets[i];
			var list = [];
			$('#' + target + ' input:checkbox').each(function (inx, elem) {
				var id = $(this).attr('name').split('_').pop();
				console.log('inx: ' + inx + ', name: ' + $(this).attr('name') + ', id: ' + id + ', checked: ' + $(this).is(':checked'));
				if ($(this).is(':checked')) {
					list.push(id);
				}
			});
			lens.push(list.length);
			renshuuMain.filterSettings[target] = list;
			console.log('target: ' + target + ' = ' + list);
		}

		// Make sure any of the selections was not empty
		if (lens.indexOf(0) == -1) {
			renshuuMain.updateTrainings();
		}

		// Storage is updated every time
		localStorage.setItem(
			'filterArts',
			renshuuMain.filterSettings.arts.join('.')
		);
		localStorage.setItem(
			'filterWeekdays',
			renshuuMain.filterSettings.weekdays.join('.')
		);
		console.groupEnd();
	},

	/**
	 * This applies the current filter settings to the html in the dom
	 * @see
	 */
	applyFilters: function () {
		console.group('applyFilters');
		var sets = ['arts', 'weekdays']; // for in object gives extra data, thus defining these here
		var len = sets.length; // Should be 2
		for (var i = 0; i < len; ++i) {
			var target = sets[i];
			var list = renshuuMain.filterSettings[target];
			console.log('target: ' + target + ', list: ' + list);
			if (list) {
				$('#' + target + ' input:checkbox').each(function (i, elem) {
					var rel = $(this).attr('name').split('_').pop();
					var inx = list.indexOf(rel);
					console.log('i: ' + i + ', rel: ' + rel + ', inx: ' + inx);
					if (inx === -1) {
						$(this).removeAttr('checked');
					}
					else {
						$(this).attr('checked', 'checked');
					}
				});
			}
		}
		console.groupEnd();
	},

	/**
	 * @see http://www.jlpt.jp/samples/forlearners.html
	 */
	updateTrainings: function () {
		console.group('updateTrainings');
		var bounds = renshuuMain.map.getBounds();
		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();
		var para = {
			area: {
				northeast: [ne.lat(), ne.lng()],
				southwest: [sw.lat(), sw.lng()]
			},
			filter: renshuuMain.filterSettings
		};

		renshuuMarkers.clearMarkers(renshuuMain.trainingMarkers);
		renshuuMain.trainingMarkersData = [];

		$.post('/ajax/get/', para, function (data, status) {
			//console.dir(data);
			if (data.response && data.response.result) {
				var res = data.response.result;
				var len = res.length;
				for (var i = 0; i < len; ++i) {
					renshuuMarkers.createTrainingMarker(res[i]);
				}
			}
			else {
				console.log('Seems AJAX failed. ' + status);
			}
		}, 'json');
		console.groupEnd();
	},

	/**
	 * @see http://code.google.com/apis/maps/documentation/staticmaps/
	 */
	updateExportPreview: function () {
		console.group('updateExportPreview');
		var url = 'http://maps.google.com/maps/api/staticmap?';
		var values = ['sensor=false'];
		var fields = ['maptype', 'language', 'format', 'zoom', 'size'];
		var items = $('#export_form input, #export_form select');
		var len = fields.length;
		// Should there be additional checks for allowed values...
		for (var i = 0; i < len; ++i) {
			var field = fields[i];
			var val = '';
			if (items.filter('select[name=' + field + ']').length > 0) {
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
		url += '&markers=color:' + $('#export_form input[name=color]').val() +
			'|label:' + $('#export_form input[name=label]').val() + '|' +
			renshuuMap.hikone.lat() + ',' +renshuuMap.hikone.lng();

		console.log('url: ' + url);

		// perhaps there could be some animation to show that something happened...
		$('#exportpreview').attr('src', url);
		console.groupEnd();
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
	buildInfoWindow: function (data) {
		console.group('buildInfoWindow');
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
				weekDay: (renshuuMain.weekdays.length > data.training.weekday ? renshuuMain.weekdays[data.training.weekday] : ''),
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
				langSave: renshuuMain.lang.modal.savetolist,
				langRemove: renshuuMain.lang.modal.removefromlist
			};
		}

		console.debug('info. ' + info);
		//$(info).appendTo('body');
		console.groupEnd();
		return info;
	}
};
