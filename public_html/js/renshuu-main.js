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
		profile: 'womanman'
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
	 * Which tabs are visible
	 */
	tabLeft: '',
	tabRight: '',
	
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
		console.group('ready');
		if (typeof(localStorage) == 'undefined' ) {
			console.log('Your browser does not support HTML5 localStorage. Try upgrading.');
		}
		
		
		// Intiate Maps
		renshuuMap.init();

		// How about a existing value for the filter settings?
		var filterArts = localStorage.getItem('filterArts');
		var filterWeekdays = localStorage.getItem('filterWeekdays');
		var tabLeft = localStorage.getItem('tabLeft');
		var tabRight = localStorage.getItem('tabRight');
		
		if (filterArts !== null) {
			renshuuMain.filterSettings.arts = filterArts.split('.');
			console.log('filterArts storage item existed. renshuuMain.filterSettings.arts: ' + renshuuMain.filterSettings.arts);
		}
		if (filterWeekdays !== null) {
			renshuuMain.filterSettings.weekdays = filterWeekdays.split('.');
			console.log('filterWeekdays storage item existed. renshuuMain.filterSettings.weekdays: ' + renshuuMain.filterSettings.weekdays);
		}
		if (tabLeft !== null) {
			console.log('tabLeft : ' + tabLeft);
			renshuuMain.showTabContent($('#left .icon-list a[href="#' + tabLeft + '"]'));
		}
		if (tabRight !== null) {
			console.log('tabRight : ' + tabRight);
			renshuuMain.showTabContent($('#right .icon-list a[href="#' + tabRight + '"]'));
		}
		


		// Triggers on individual change of the checkboxes
		$('.filters input:checkbox').live('change', function () {
			var name = $(this).attr('name');
			var check = $(this).is(':checked');
			console.log('change. name: ' + name + ', check: ' + check);

			renshuuMain.updateFilters();
		});

		// Triggers on a click to any of the shortcuts for selection manipulation
		$('.filters p[class^=rel_] a').live('click', function () {
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
			var $tab = $(this).parents('.bottom-tabs').find('.tab-title p');
			$tab.data('title', $tab.text()).text(title);			
		}).on('mouseout', function() {
			var $tab = $(this).parents('.bottom-tabs').find('.tab-title p');
			$tab.text($tab.data('title'));
			$tab.data('title', null);
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


		renshuuMain.applyFiltersToHtml();


		// Finally, set the keepalive call
		setInterval(function () {
			$.get('/ajax/keepalive', function (data) {
				//console.log(data);
			}, 'json');
		}, renshuuMain.keepAlive);

		
		console.groupEnd();
		
		// Handlers for forms
		renshuuForms.init();
	},

	/**
	 * Each tab has an individual content.
	 * key Which tab
	 * side	left/right
	 */
	showTabContent: function ($elem) {
		var href = $elem.attr('href');
		
		// No point of continuing further...
		if (typeof href === 'undefined' ) {
			return false;
		}
		
		var key = href.substr(1);
		var title = $elem.attr('title');
		var description = $elem.children('img').attr('alt');
		console.log('key: ' + key + ', title: ' + title + ', description: ' + description);
		
		var $tabs = $elem.parents('.bottom-tabs');

		// Remove and add "current" class
		$tabs.find('.icon-list a').removeClass('current');
		$elem.addClass('current');
		
		// Set title
		var p = $tabs.find('.tab-title p');
		p.text(title);
		p.data('title', title); // used on hover

		// Hide all that is visible
		$tabs.find('.tab-content > div:visible').hide();
		
		// Show the requested one
		$('#' + key).show();
		
		// Save current view
		renshuuMain.tabLeft = $('#left .tab-content > div:visible').attr('id');
		renshuuMain.tabRight = $('#right .tab-content > div:visible').attr('id');
		localStorage.setItem('tabRight', renshuuMain.tabRight);
		localStorage.setItem('tabLeft', renshuuMain.tabLeft);
		
		// Now handle any special cases
		if (typeof renshuuMarkers.locationMarker !== 'undefined') {
			if (key == 'location') {
				var pos = renshuuMap.map.getCenter();
				renshuuMarkers.locationMarker.setPosition(pos);
				renshuuMarkers.locationMarker.setVisible(true);
				console.log('locationMarker set visible and to pos: ' + pos);
			}
			else {
				renshuuMarkers.locationMarker.setVisible(false);
			}
			
			console.log('locationMarker is now visible: ' + renshuuMarkers.locationMarker.getVisible());
		}
	},
	
	/**
	 * 
	 */
	applyKey: function (key) {
		if (key == 'filters') {
			renshuuMain.applyFiltersToHtml();
		}
		else if (key == 'location') {
			renshuuForms.updateGeocodeSelectionIcon();
			// begin to show location markers...
		}

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
			var len = renshuuMarkers.trainingMarkersData.length;
			var savedlen = renshuuMain.savedListData.length; // only for debugging
			for (var i = 0; i < len; ++i) {
				data = renshuuMarkers.trainingMarkersData[i];
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
	applyFiltersToHtml: function () {
		console.group('applyFiltersToHtml');
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
		var bounds = renshuuMap.map.getBounds();
		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();
		var para = {
			area: {
				northeast: [ne.lat(), ne.lng()],
				southwest: [sw.lat(), sw.lng()]
			},
			filter: renshuuMain.filterSettings
		};

		renshuuMarkers.clearMarkers(renshuuMarkers.trainingMarkers);
		renshuuMarkers.trainingMarkersData = [];

		$.post('/ajax/get/', para, function (data, status) {
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
	}
};
