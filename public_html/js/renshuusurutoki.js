




(function($) {

	var hoplaa = new Date();

	$.reshuuSuruToki = {
		ajaxpoint: { get: '/ajax/get/', set: '/ajax/set/' },
		geocoder: null,
		map: null, // http://code.google.com/apis/maps/documentation/javascript/reference.html
		streetview: null, //StreetViewPanorama
		
		// Default filter settings
		filterSettings: {
			arts: [],
			weekdays: []
		},
		
		geocodeMarkers: [],
		trainingMarkers: [],
		
		getViewBounds: function() {
			var bounds = $.reshuuSuruToki.map.getBounds();
			$.reshuuSuruToki.data.getPoints(bounds);
			return bounds;
		},
		
		init: function(map_element, street_element, map_options, street_options) {
			$.reshuuSuruToki.geocoder = new google.maps.Geocoder();
			
			var hikone = new google.maps.LatLng(35.27655600992416, 136.25263971710206);
			var zoom = 8;
			// http://code.google.com/apis/maps/documentation/javascript/reference.html#MapOptions
			var opts = {
				center: hikone,
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
				zoom: zoom
			};
			
			opts = $.extend(true, {}, opts, map_options);
			$.reshuuSuruToki.map = new google.maps.Map(map_element, opts);
		
			$.reshuuSuruToki.streetview = new google.maps.StreetViewPanorama(street_element, street_options);
			
			
			google.maps.event.addListener($.reshuuSuruToki.streetview, 'closeclick', function(event) {
			});
			google.maps.event.addListener($.reshuuSuruToki.streetview, 'visible_changed', function() {
				if ($.reshuuSuruToki.streetview.getVisible()) {
					$(street_element).slideDown();
				}
				else {
					$(street_element).slideUp();
				}
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
	
		clearMarkers: function(list) {
			var len = list.length;
			for (var i = 0; i < len; ++i) {
				var marker = list[i];
				marker.setMap(null);
			}
			list = [];
		},
		
		createMarker: function(pos, title, icon, drag) {
			// http://code.google.com/apis/maps/documentation/javascript/reference.html#MarkerOptions
			if (!icon) {
				icon = $.reshuuSuruToki.pins.getIcon();
			}
			var marker = new google.maps.Marker({
				position: pos,
				title: title,
				map: $.reshuuSuruToki.map,
				draggable: drag,
				icon: icon
			});
			
			
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
			
			google.maps.event.addListener(marker, 'click', function(event) {
				// This event is fired when the marker icon was clicked.
			});
			google.maps.event.addListener(marker, 'clickable_changed', function() {
				// This event is fired when the marker's clickable property changes.
			});
			google.maps.event.addListener(marker, 'cursor_changed', function() {
				// This event is fired when the marker's cursor property changes.
			});
			google.maps.event.addListener(marker, 'dblclick', function(event) {
				// This event is fired when the marker icon was double clicked.
			});
			google.maps.event.addListener(marker, 'drag', function(event) {
				// This event is repeatedly fired while the user drags the marker.
			});
			google.maps.event.addListener(marker, 'dragend', function(event) {
				// This event is fired when the user stops dragging the marker.
			});
			google.maps.event.addListener(marker, 'draggable_changed', function() {
				// This event is fired when the marker's draggable property changes.
			});
			google.maps.event.addListener(marker, 'dragstart', function(event) {
				// This event is fired when the user starts dragging the marker.
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
			google.maps.event.addListener(marker, 'mouseout', function(event) {
				// This event is fired when the mouse leaves the area of the marker icon.
			});
			google.maps.event.addListener(marker, 'mouseover', function(event) {
				// This event is fired when the mouse enters the area of the marker icon.
			});
			google.maps.event.addListener(marker, 'mouseup', function(event) {
				// This event is fired for the DOM mouseup on the marker.
			});
			google.maps.event.addListener(marker, 'position_changed', function() {
				// This event is fired when the marker position property changes.
			});
			google.maps.event.addListener(marker, 'rightclick', function(event) {
				// This event is fired when the marker is right clicked on.
			});
			google.maps.event.addListener(marker, 'shadow_changed', function() {
				// This event is fired when the marker's shadow property changes.
			});
			google.maps.event.addListener(marker, 'shape_changed', function() {
				// This event is fired when the marker's shape property changes.
			});
			google.maps.event.addListener(marker, 'title_changed', function() {
				// This event is fired when the marker title property changes.
			});
			google.maps.event.addListener(marker, 'visible_changed', function() {
				// This event is fired when the marker's visible property changes.
			});
			google.maps.event.addListener(marker, 'zindex_changed', function() {
				// This event is fired when the marker's zIndex property changes.
			});
			
			return marker;
		},
		
		createTrainingMarker: function(data) {
			
		}
	};
	
	$.reshuuSuruToki.data = {
		
		getPoints: function(bounds) {
			// http://code.google.com/apis/maps/documentation/javascript/reference.html#LatLngBounds
			var ne = bounds.getNorthEast();
			var sw = bounds.getSouthWest();
			//console.log("bounds: " + bounds.toString());
			console.log("ne: " + ne.toString());
			console.log("sw: " + sw.toString());
			
			var para = {
				area: {
					northeast: [ne.lat(), ne.lng()],
					southwest: [sw.lat(), sw.lng()]
				},
				filter: $.reshuuSuruToki.filterSettings
			};

			$.post($.reshuuSuruToki.ajaxpoint.get, para, function(data, status) {
				var len = data.results.length;
				for (var i = 0; i < len; ++i) {
					createTrainingMarker(data.results[i]);
				}				
			}, 'json');
		},
			
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
							// http://code.google.com/apis/maps/documentation/javascript/3.0/reference.html#GeocoderResult
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
		},
		click: function(event) {
			// This event is fired when the user clicks on the map (but not when they click on a marker or infowindow).
			console.log('click. ' + event.latLng);
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
		}
	};
	
	$.reshuuSuruToki.pins = {
		getMarkerImage: function(image) {
			return new google.maps.MarkerImage(image);
		},
		getIcon: function(icon, color) { // 21, 34
			// http://code.google.com/apis/chart/docs/gallery/dynamic_icons.html#icon_list
			if (!icon) {
				icon = 'fire';
			}
			if (!color) {
				color = 'ADDE63';
			}
			return $.reshuuSuruToki.pins.getMarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=' + icon + '|' + color + '&ext=.png');
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
			return $.reshuuSuruToki.pins.getMarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + encodeURI(letter) + '|' + fill + '|' + color + '&ext=.png');
		},
		
		gYellowIcon: function() { return $.reshuuSuruToki.pins.getIcon('glyphish_target', 'FF00CC'); },
		gRedIcon: function() { return $.reshuuSuruToki.pins.getIcon('star', 'CC2233'); },
		gBlueIcon: function() { return $.reshuuSuruToki.pins.getIcon('snow', '2233CC'); }
	};
	
	
})(jQuery);