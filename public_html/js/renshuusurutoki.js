/** Firebug console functions if they do not exist **/
if (!("console" in window) || !("firebug" in console)) {
	var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
	window.console = {};
	for (var i = 0; i < names.length; i++) {
		window.console[names[i]] = function() {};
	}
}


$(document).ready(function() {
	$.reshuuSuruToki.ready();
});

(function($) {

	$.reshuuSuruToki = {
		animSpeed: 200,
		zoom: 8,
		ajaxpoint: { get: '/ajax/get/', set: '/ajax/set/', form: '/ajax/form/' },
		geocoder: null,
		map: null, // http://code.google.com/apis/maps/documentation/javascript/reference.html
		streetview: null, //StreetViewPanorama
		hikone: null,
		
		// Default filter settings
		filterSettings: {
			arts: [],
			weekdays: []
		},
		
		geocodeMarkers: [],
		trainingMarkers: [],
		streetMarker: null, // The actual position where current Street View is at.
		
		ready: function() {
		
			$.reshuuSuruToki.hikone = new google.maps.LatLng(35.27655600992416, 136.25263971710206);
			
			// Toggle the visibility of each box
			$('.header a').click(function() {
				var rel = $(this).attr('rel');
				var con = $(this).parent('p').parent('div').next('.content').children('.stuff');
				console.log('rel: ' + rel + ', con.length: ' + con.length);
				con.toggle($.reshuuSuruToki.animSpeed);
				return false;
			});
			
			// Tools tabs, used when logged in, forms and such..
			$('#example').bind('tabsselect', function(event, ui) {

				// Objects available in the function context:
				ui.tab     // anchor element of the selected (clicked) tab
				ui.panel   // element, that contains the selected/clicked tab contents
				ui.index   // zero-based index of the selected (clicked) tab

			});
			var $tabs = $('#example').tabs();
			var selected = $tabs.tabs('option', 'selected'); // => 0
	
			// Set up the Google Map v3 and the Street View
			$.reshuuSuruToki.init(
				$('#map').get(0), 
				$('#street').get(0),
				{
					center: $.reshuuSuruToki.hikone
				},
				{
					enableCloseButton: true,
					visible: true
				}
			);
			
			// Handler for the ability to toggle streetview viewing while marker click.
			$('input:checkbox[name=markerstreet]').change(function() {
				$.reshuuSuruToki.markers.showInStreetView = $(this).is(':checked');
				console.log('markerstreet change. ' + $.reshuuSuruToki.markers.showInStreetView);
			});
			
			// Triggers on individual change of the checkboxes
			$('#filters input:checkbox').change(function () {
				/*
				var name = $(this).attr('name');
				var check = $(this).is(':checked');
				console.log('change. name: ' + name + ', check: ' + check);
				*/				
				$.reshuuSuruToki.updateFilters();
			});
	
			// Triggers on a click to any of the shortcuts for selection manipulation
			$('#filters .stuff p[class^=rel_] a').click(function () {
				var action = $(this).attr('rel');
				console.log('action: ' + action);
				//var target = $(this).parent('p').attr('class');
				var target = $(this).parent('p').next('ul').attr('id');
				
				console.log('action: ' + action + ', target: ' + target);
				
				$('#' + target + ' input:checkbox').each(function(i, elem) {
					//console.log('each. i: ' + i + ', name: ' + $(this).attr('name') + ', checked: ' + $(this).is(':checked'));
					
					switch(action) {
						case 'all' : $(this).attr('checked', 'checked'); break;
						case 'none' : $(this).removeAttr('checked'); break;
						case 'inverse' : 
							if ($(this).is(':checked')) {
								$(this).removeAttr('checked');
							}
							else {
								$(this).attr('checked', 'checked'); 
							}
							break;
					}
				});
				
				$.reshuuSuruToki.updateFilters();
				return false;
			});
			
			// http://benalman.com/projects/jquery-hashchange-plugin/
			$(window).hashchange(function() {
				// console.log( location.hash );
			});
	
	
			var roundedCorners = {
				tl: { radius: 20 },
				tr: { radius: 20 },
				bl: { radius: 0 },
				br: { radius: 0 },
				antiAlias: true,
				autoPad: true,
				validTags: ["fieldset"]
			};
			$('fieldset').corner(roundedCorners);
			
			
			// http://code.google.com/p/jquerytimepicker/
			$('input[name=starttime]').timePicker();
		
			// http://www.jnathanson.com/index.cfm?page=jquery/clockpick/ClockPick
			$('input[name=endtime]').clockpick();
			
		},
		
		// Update filters according to current checkbox selection.
		updateFilters: function() {
			var sets = ['arts', 'weekdays'];
			var lens = [];
			for (var inx in sets) {
				var target = sets[inx];
				var list = [];
				$('#' + target + ' input:checkbox').each(function(i, elem) {
					var id = $(this).attr('name').split('_').pop();
					//console.log('updateFilters. i: ' + i + ', name: ' + $(this).attr('name') + ', id: ' + id + ', checked: ' + $(this).is(':checked'));
					if ($(this).is(':checked')) {
						list.push(id);
					}
				});
				lens.push(list.length);
				$.reshuuSuruToki.filterSettings[target] = list;
				console.log(target + ' = ' + list);
			}
			
			// Make sure any of the selections was not empty
			if (lens.indexOf(0) == -1) {
				$.reshuuSuruToki.updateLocations();
			}
		},
		
		updateLocations: function() {
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
		
		// Show the given position in the Street View. Once visibility set, the opening is taken care of by its event handler.
		showStreetView: function(position) {
			$.reshuuSuruToki.streetview.setPosition(position);
			$.reshuuSuruToki.streetview.setVisible(true);
			//$('#street:hidden').slideDown($.reshuuSuruToki.animSpeed);
		},
		
		init: function(map_element, street_element, map_options, street_options) {
			$.reshuuSuruToki.geocoder = new google.maps.Geocoder();
			
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
				$.reshuuSuruToki.map.getCenter(), 'Street View', $.reshuuSuruToki.pins.getPinStar('glyphish_eye'), true, false
			);
			
			// Markerdraggin overrides the Street View position and makes it visible if hidden.
			google.maps.event.addListener($.reshuuSuruToki.streetMarker, 'dragend', function() {
				$.reshuuSuruToki.streetview.setPosition($.reshuuSuruToki.streetMarker.getPosition());
				if (!$.reshuuSuruToki.streetview.getVisible()) {
					$.reshuuSuruToki.streetview.setVisible(true);
				}
			});
			
			google.maps.event.addListener($.reshuuSuruToki.streetview, 'position_changed', function() {
				$.reshuuSuruToki.streetMarker.setPosition($.reshuuSuruToki.streetview.getPosition());
			});
			
			// When Street View is set visible, the position for it should have been set before, thus its position is the one that is used for the marker.
			google.maps.event.addListener($.reshuuSuruToki.streetview, 'visible_changed', function() {
				var posS = $.reshuuSuruToki.streetview.getPosition();
				var posM = $.reshuuSuruToki.streetMarker.getPosition();
				var bounds = $.reshuuSuruToki.streetview.map.getBounds();
				
				if ($.reshuuSuruToki.streetview.getVisible()) {
					$(street_element).slideDown();
				}
				else {
					$(street_element).slideUp();
				}
				if (!bounds.contains(posS)) {
					posS = $.reshuuSuruToki.map.getCenter();
				}
				$.reshuuSuruToki.streetMarker.setPosition(posS);
				$.reshuuSuruToki.streetMarker.setVisible($.reshuuSuruToki.streetview.getVisible());
			});
			
			$.reshuuSuruToki.callbacks.initiate();
		
			$(window).resize(function() {
				google.maps.event.trigger($.reshuuSuruToki.map, 'resize');
				google.maps.event.trigger($.reshuuSuruToki.streetview, 'resize');
			});
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
		person: {}
	}
	*/
	$.reshuuSuruToki.markers = {
		
		// As per marker click, show its position in Street View
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
			var icon = $.reshuuSuruToki.pins.getLetter(data.training.art.title.substr(0, 1), '0E3621', '100212');
			var pos = new google.maps.LatLng(data.location.latitude, data.location.longitude);
			var marker = $.reshuuSuruToki.markers.createMarker(pos, data.location.title, icon, false);
			
			$.reshuuSuruToki.trainingMarkers.push(marker);
		},
		
		createMarker: function(pos, title, icon, drag, click) {
			// http://code.google.com/apis/maps/documentation/javascript/reference.html#MarkerOptions
			if (!icon) {
				icon = $.reshuuSuruToki.pins.getIcon();
			}
			if (drag == null) {
				drag = false;
			}
			if (click == null) {
				click = true;
			}
			var marker = new google.maps.Marker({
				position: pos,
				title: title,
				map: $.reshuuSuruToki.map,
				draggable: drag,
				icon: icon
			});
			
			/*
			if (drag) {
				google.maps.event.addListener(marker, 'drag', function() {
					updateMarkerStatus('Dragging...');
					updateMarkerPosition(marker.getPosition());
				});
				google.maps.event.addListener(marker, 'dragend', function() {
					marker.setOptions({icon: $.reshuuSuruToki.pins.gYellowIcon()});
					updateMarkerStatus('Drag ended');
					$.reshuuSuruToki.data.geocodePosition(marker.getPosition());

					$.reshuuSuruToki.streetview.setPosition(marker.getPosition());
					$.reshuuSuruToki.streetview.setVisible(true);
				});
			}
			*/
			
			if (click) {
				google.maps.event.addListener(marker, 'click', function(event) {
					// This event is fired when the marker icon was clicked.
					console.log('marker. click - ' + marker.title);
					console.log('showInStreetView: ' + $.reshuuSuruToki.markers.showInStreetView);
					if ($.reshuuSuruToki.markers.showInStreetView) {
						$.reshuuSuruToki.showStreetView(marker.getPosition());
					}
				});
			}
			google.maps.event.addListener(marker, 'clickable_changed', function() {
				// This event is fired when the marker's clickable property changes.
			});
			google.maps.event.addListener(marker, 'cursor_changed', function() {
				// This event is fired when the marker's cursor property changes.
			});
			google.maps.event.addListener(marker, 'dblclick', function(event) {
				// This event is fired when the marker icon was double clicked.
				console.log('marker. dblclick - ' + marker.title);
			});
			if (drag) {
				google.maps.event.addListener(marker, 'drag', function(event) {
					// This event is repeatedly fired while the user drags the marker.
				});
				google.maps.event.addListener(marker, 'dragend', function(event) {
					// This event is fired when the user stops dragging the marker.
				});
				google.maps.event.addListener(marker, 'dragstart', function(event) {
					// This event is fired when the user starts dragging the marker.
				});
			}
			/*
			google.maps.event.addListener(marker, 'draggable_changed', function() {
				// This event is fired when the marker's draggable property changes.
			});
			google.maps.event.addListener(marker, 'flat_changed', function() {
				// This event is fired when the marker's flat property changes.
			});
			google.maps.event.addListener(marker, 'icon_changed', function() {
				// This event is fired when the marker icon property changes.
			});
			google.maps.event.addListener(marker, 'mousedown', function(event) {
				// This event is fired when the DOM mousedown event is fired on the marker icon.
			});
			*/
			google.maps.event.addListener(marker, 'mouseout', function(event) {
				// This event is fired when the mouse leaves the area of the marker icon.
			});
			google.maps.event.addListener(marker, 'mouseover', function(event) {
				// This event is fired when the mouse enters the area of the marker icon.
			});
			/*
			google.maps.event.addListener(marker, 'mouseup', function(event) {
				// This event is fired for the DOM mouseup on the marker.
			});
			google.maps.event.addListener(marker, 'position_changed', function() {
				// This event is fired when the marker position property changes.
				console.log('marker. position_changed - ' + marker.title);
			});
			*/
			google.maps.event.addListener(marker, 'rightclick', function(event) {
				// This event is fired when the marker is right clicked on.
			});
			/*
			google.maps.event.addListener(marker, 'shadow_changed', function() {
				// This event is fired when the marker's shadow property changes.
			});
			google.maps.event.addListener(marker, 'shape_changed', function() {
				// This event is fired when the marker's shape property changes.
			});
			google.maps.event.addListener(marker, 'title_changed', function() {
				// This event is fired when the marker title property changes.
			});
			*/
			google.maps.event.addListener(marker, 'visible_changed', function() {
				// This event is fired when the marker's visible property changes.
				console.log('marker. visible_changed - ' + marker.title);
			});
			/*
			google.maps.event.addListener(marker, 'zindex_changed', function() {
				// This event is fired when the marker's zIndex property changes.
			});
			*/
			
			return marker;
		}
	};
	
	$.reshuuSuruToki.data = {
					
		geocodePosition: function(pos) {
			// http://code.google.com/apis/maps/documentation/javascript/reference.html#Geocoder
			// Clear earlier geocode markers
			$.reshuuSuruToki.geocodeMarkers = [];
			$.reshuuSuruToki.geocoder.geocode(
				{ location: pos, language: 'ja' },
				function(results, status) {
					if (results) {
						var len = results.length;
						for (var i = 0; i < len; ++i) {
							// http://code.google.com/apis/maps/documentation/javascript/reference.html#GeocoderResult
							var res = results[i];
							var marker = $.reshuuSuruToki.markers.createMarker(res.geometry.location, res.formatted_address, $.reshuuSuruToki.pins.getLetter(i + 1), false);
							$.reshuuSuruToki.geocodeMarkers.push(marker);
							
							console.log('---- result ' + i);
							for (var j in res) {
								console.log(j + ' = ' + res[j]);
							}
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
						}
						updateMarkerAddress(results[0].formatted_address);
					}
					else {
						updateMarkerAddress('Cannot determine address at this location.');
					}
				}
			);
		}
	};
		
	$.reshuuSuruToki.callbacks = {
		updateHashUrl: function() {
	
			var center = $.reshuuSuruToki.map.getCenter();
			var zoom = $.reshuuSuruToki.map.getZoom();
			console.log('center / zoom changed. zoom: ' + zoom + ', center: ' + center);
			document.location = '/#/zoom/' + zoom + '/lat/' + center.lat() + '/lng/' + center.lng();
		},
			
		initiate: function() {
			var callbacks = $.reshuuSuruToki.callbacks;
			var map = $.reshuuSuruToki.map;
			google.maps.event.addListener(map, 'bounds_changed', callbacks.bounds_changed);
			google.maps.event.addListener(map, 'center_changed', callbacks.center_changed);
			google.maps.event.addListener(map, 'click', callbacks.click);
			google.maps.event.addListener(map, 'dblclick', callbacks.dblclick);
			google.maps.event.addListener(map, 'drag', callbacks.drag);
			google.maps.event.addListener(map, 'dragend', callbacks.dragend);
			google.maps.event.addListener(map, 'dragstart', callbacks.dragstart);
			google.maps.event.addListener(map, 'idle', callbacks.idle);
			google.maps.event.addListener(map, 'maptypeid_changed', callbacks.maptypeid_changed);
			google.maps.event.addListener(map, 'mousemove', callbacks.mousemove);
			google.maps.event.addListener(map, 'mouseout', callbacks.mouseout);
			google.maps.event.addListener(map, 'mouseover', callbacks.mouseover);
			google.maps.event.addListener(map, 'projection_changed', callbacks.projection_changed);
			google.maps.event.addListener(map, 'rightclick', callbacks.rightclick);
			google.maps.event.addListener(map, 'tilesloaded', callbacks.tilesloaded);
			google.maps.event.addListener(map, 'zoom_changed', callbacks.zoom_changed);
		},
		bounds_changed: function() {
			// This event is fired when the viewport bounds have changed
		},
		center_changed: function() {
			// This event is fired when the map center property changes.
			$.reshuuSuruToki.callbacks.updateHashUrl();
		},
		click: function(event) {
			// This event is fired when the user clicks on the map (but not when they click on a marker or infowindow).
			console.log('map click. ' + event.latLng);
		},
		dblclick: function(event) {
			// This event is fired when the user double-clicks on the map. Note that the click event will also fire, right before this one.
		},
		drag: function() {
			// This event is repeatedly fired while the user drags the map.
		},
		dragend: function() {
			// This event is fired when the user stops dragging the map.
		},
		dragstart: function() {
			// This event is fired when the user starts dragging the map.
		},
		idle: function() {
			// This event is fired when the map becomes idle after panning or zooming.
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
		tilesloaded: function() {
			// This event is fired when the visible tiles have finished loading.
		},
		zoom_changed: function() {
			// This event is fired when the map zoom property changes.
			$.reshuuSuruToki.callbacks.updateHashUrl();
		}
	};
	
	$.reshuuSuruToki.pins = {
		getMarkerImage: function(image) {
			return new google.maps.MarkerImage('http://chart.apis.google.com/chart?' + image);
		},
		
		getIcon: function(icon, color) { // 21, 34
			// http://code.google.com/apis/chart/docs/gallery/dynamic_icons.html#icon_list
			if (!icon) {
				icon = 'fire';
			}
			if (!color) {
				color = 'ADDE63';
			}
			return $.reshuuSuruToki.pins.getMarkerImage('chst=d_map_pin_icon&chld=' + icon + '|' + color + '&ext=.png');
		},
		
		getLetter: function(letter, fill, color) {
			if (!letter) {
				letter = '場';
			}
			if (!fill) {
				fill = 'ADDE63';
			}
			if (!color) {
				color = '000000';
			}
			return $.reshuuSuruToki.pins.getMarkerImage('chst=d_map_pin_letter&chld=' + encodeURI(letter) + '|' + fill + '|' + color + '&ext=.png');
		},
		
		getPinStar: function(icon, fill, star) {
			if (!icon) {
				icon = 'glyphish_compass';
			}
			if (!fill) {
				fill = 'F1EFFF';
			}
			if (!star) {
				star = '279BE3';
			}
			// http://chart.apis.google.com/chart?chst=d_map_xpin_icon&chld=pin_star|glyphish_compass|F1EFFF|ADDE63
			// http://chart.apis.google.com/chart?||
			return $.reshuuSuruToki.pins.getMarkerImage('chst=d_map_xpin_icon&chld=pin_star|' + icon + '|' + fill + '|' + star);
		},
		
		gYellowIcon: function() { return $.reshuuSuruToki.pins.getIcon('glyphish_target', 'F1EFFF'); },
		gRedIcon: function() { return $.reshuuSuruToki.pins.getIcon('star', 'CC2233'); },
		gBlueIcon: function() { return $.reshuuSuruToki.pins.getIcon('snow', '2233CC'); }
	};
	
	
	$.reshuuSuruToki.forms = {
	
		showForm: function() {
		
			$("input[name=art]")
				.autoSuggest(
					data.arts, {
						startText: 'Type an art name',
						selectedItemProp: 'name',
						selectedValuesProp: 'id',
						searchObjProps: 'name',
						queryParam: '',
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
				)
				.change(
					function() {
						console.log('change - ' + $(this).attr('name') + ': ' + $(this).val());
					}
				);
			$("#training_form input[name=location]")
				.autoSuggest(
					data.items, {
						startText: 'Type a location name',
						selectedItemProp: 'name',
						searchObjProps: 'name'
					}
				)
				.change(
					function() {
						console.log($(this).attr('name') + ': ' + $(this).val());
					}
				);
			//$("input[name=art]").autoSuggest(ajaxpoint.get + $(this).attr('name'), {minChars: 2, matchCase: true});


			
/*
			$('input[name=duration]').after($('<span>', {name: 'durationslider'}));
			$('span[name=durationslider]').slider({
				range: 'min',
				max: 600,
				step: 5,
				value: 120,
				slide: function(event, ui) {
					$('input[name=duration]').val(ui.value);
				}
			});
			$('input[name=duration]').val($('span[name=durationslider]').slider('value'));
*/

			$('#new_location').click(function() {
				openModal('#location_form');
				return false;
			});
			
			
			// http://fredibach.ch/jquery-plugins/inputnotes.php
			$('input[name=title]').inputNotes({
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
		},
		
		// http://www.ericmmartin.com/projects/simplemodal/
		openModal: function(id) {
			$.modal($(id), {
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
				closeClass: 'modal_close',
				modal: false
			});
			$(id).children('input[type=button][name=send]').click(function() {
			});
			
		}
	};
	
	
})(jQuery);