/**
 * Renshuu Map (Google Maps v3.7)
 */
var renshuuMap = {
	
	/**
	 * Default map zoom,
	 * overwritten on every zoom change event and/or by local storage
	 */
	zoom: 8,
	
	/**
	 * Center position, if any
	 */
	centre: null,

	/**
	 * Default map center will be in the most beautiful castle of Japan,
	 * based on personal opinion.
	 * Hikone Castle & Town.
	 * @see http://www.flickr.com/photos/rekishinotabi/sets/72157618241282853/
	 */
	hikone: null,

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
	 * Memorised in LocalStorage.
	 */
	streetEnable: false,

	/**
	 * http://code.google.com/apis/maps/documentation/javascript/reference.html#DirectionsService
	 * The service for getting directions between two locations.
	 */
	dirService: null,
	
	
	init: function() {
		
		// Setup the default center if nothing is found from localStorage
		renshuuMap.hikone = new google.maps.LatLng(35.27655600992416, 136.25263971710206);
		
		// Set up the directions service
		renshuuMap.dirService = new google.maps.DirectionsService();
		
		// Check for localStorage items
		renshuuMap.loadMapZoom();
		renshuuMap.loadMapCenter();

		// Set up the Google Map v3
		renshuuMap.mapInit($('#map').get(0), {
			center: renshuuMap.hikone,
			zoom: renshuuMap.zoom
		});

		
		// Handler for the ability to toggle streetView viewing while marker click.
		if (localStorage.getItem('showInStreetView')) {
			$('input:checkbox[name=markerstreet]').attr('checked', 'checked');
			renshuuMap.showInStreetView = true;
		}

		// and the Street View
		if (renshuuMap.streetEnable) {
			renshuuMap.streetInit($('#street').get(0), {enableCloseButton: true, visible: true});
		}

		// Toggle "street view position update based on the map position" setting.
		if (renshuuMap.streetEnable) {
			$('input:checkbox[name=markerstreet]').change(function () {
				renshuuMap.showInStreetView = $(this).is(':checked');
				console.log('markerstreet checkbox change. renshuuMap.showInStreetView: ' + renshuuMap.showInStreetView);
				localStorage.setItem(
					'showInStreetView',
					renshuuMap.showInStreetView
				);
			});
		}
		if (renshuuMap.streetEnable) {
			$('#mapping .header a[rel=street]').click(function () {
				var visible = renshuuMap.streetView.getVisible();
				renshuuMap.streetView.setVisible(!visible);
				return false;
			});
		}

	},
	
	
	/**
	 * Read the zoom level from the local storage
	 * @see
	 */
	loadMapZoom: function () {
		if (localStorage.getItem('mapZoom')) {
			var zoom = parseInt(localStorage.getItem('mapZoom'), 10);
			if (zoom > -1 && zoom < 20) {
				renshuuMap.zoom = zoom;
			}
			console.log('mapZoom storage item existed. zoom: ' + zoom);
		}
	},
	
	/**
	 * Save the zoom level in the local storage
	 * @see
	 */
	saveMapZoom: function () {
		var zoom = renshuuMap.map.getZoom();
		localStorage.setItem('mapZoom', zoom);
		renshuuMap.zoom = zoom; // why is this here?
	},
	
	/**
	 * Read the center location from the local storage
	 * @see
	 */
	loadMapCenter: function () {
		var centre = renshuuMap.hikone; // default
		if (localStorage.getItem('mapCenter')) {
			var arr = localStorage.getItem('mapCenter').split(',');
			if (arr && arr.length > 1) {
				centre = new google.maps.LatLng(parseFloat(arr[0]), parseFloat(arr[1]));
			}
			console.log('mapCenter storage item existed. arr: ' + arr);
		}
		renshuuMap.centre = centre;
	},
	
	/**
	 * Save the center location in the local storage
	 * @see
	 */
	saveMapCenter: function () {
		var c = renshuuMap.map.getCenter();
		localStorage.setItem('mapCenter', c.lat() + ',' + c.lng());
	},
	
	
	/**
	 * If current tab view is in the location or training,
	 * show training place locations.
	 * As opposed to trainings.
	 */
	updateLocations: function () {
		console.group('updateLocations');
		var bounds = renshuuMap.map.getBounds();
		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();
		var para = {
			area: {
				northeast: [ne.lat(), ne.lng()],
				southwest: [sw.lat(), sw.lng()]
			}
		};
		renshuuMarkers.clearMarkers(renshuuMap.locationMarkers);
		renshuuMarkers.locationMarkersData = [];

		$.post('/ajax/get/location', para, function (data, status) {
			console.dir(data);
			if (data.response && data.response.result) {
				var res = data.response.result;
				var len = res.length;
				for (var i = 0; i < len; ++i) {
					renshuuMarkers.createLocationMarker(res[i]);
				}
			}
			else {
				console.log('Seems AJAX failed. ' + status);
			}
		}, 'json');
		console.groupEnd();
	},

	
	/**
	 *
	 * @see
	 */
	initiate: function () {
		var map = renshuuMap.map;
		google.maps.event.addListener(map, 'bounds_changed', renshuuMap.bounds_changed);
		google.maps.event.addListener(map, 'center_changed', renshuuMap.center_changed);
		//google.maps.event.addListener(map, 'maptypeid_changed', renshuuMap.maptypeid_changed);
		//google.maps.event.addListener(map, 'mousemove', renshuuMap.mousemove);
		//google.maps.event.addListener(map, 'mouseout', renshuuMap.mouseout);
		//google.maps.event.addListener(map, 'mouseover', renshuuMap.mouseover);
		//google.maps.event.addListener(map, 'rightclick', renshuuMap.rightclick);
		google.maps.event.addListener(map, 'zoom_changed', renshuuMap.zoom_changed);
	},
	bounds_changed: function () {
		// This event is fired when the viewport bounds have changed
		if (location.hash == '#location' || location.hash == '#training') {
			renshuuMap.updateLocations();
		}
	},
	center_changed: function () {
		// This event is fired when the map center property changes.
		renshuuMap.saveMapCenter();
	},
	/*
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
	*/
	zoom_changed: function () {
		// This event is fired when the map zoom property changes.
		renshuuMap.saveMapZoom();
	},

	/**
	 * Draw route between two spots, while using directions service.
	 */
	drawRoute: function (pos1, pos2) {
		console.group('drawRoute');
		var reg = {
			avoidHighways: true,
			destination: pos2,
			origin: pos1,
			provideRouteAlternatives: false,
			travelMode: google.maps.DirectionsTravelMode.WALKING
		};
		// This request should not be made too often..
		// Check for renshuuMap.dirRequestInterval
		renshuuMap.dirService.route(reg, function (result, status) {
			console.log('route status: ' + status);
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
						renshuuMap.drawPath(step.start_location, step.end_location); //, step.distance.text);
					}
				}
			}
		});
		console.groupEnd();
	},

	/**
	 * Draw a path between two positions by using tools in Google Maps.
	 * pos1 and pos2 are type of google.maps.LatLng
	 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#LatLng
	 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#Polyline
	 */
	drawPath: function (pos1, pos2, color) {
		console.group('drawPath');
		var opts = {
			clickable: false,
			geodesic: true,
			map: renshuuMap.map,
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
		console.groupEnd();
	},

	/**
	 * Show the given position in the Street View.
	 * Once visibility set, the opening is taken care of by its event handler.
	 */
	showStreetView: function (position) {
		console.group('showStreetView');
		renshuuMap.streetView.setPosition(position);
		renshuuMap.streetView.setVisible(true);
		console.groupEnd();
	},
		
		

	/**
	 * Initiate the following tools in Google Maps:
	 * - Maps
	 * - Geocoder
	 */
	mapInit: function (elem, map_options) {
		console.group('mapInit');
		renshuuMap.geocoder = new google.maps.Geocoder();

		// http://code.google.com/apis/maps/documentation/javascript/reference.html#MapOptions
		var opts = {
			center: renshuuMap.hikone,
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
			zoom: renshuuMap.zoom
		};

		opts = $.extend(true, {}, opts, map_options);
		renshuuMap.map = new google.maps.Map(elem, opts);

		//var icon = renshuuPins.getBubble('glyphish_paperclip', 'Select+position');
		var icon = renshuuPins.getPinStar('glyphish_paperclip', '5E0202', '05050D', 'pin_sright');
		//var icon = 'http://chart.apis.google.com/chart?chst=d_bubble_icon_text_small&chld=glyphish_paperclip|bbtl|Select+position|B7B529|05050D';
		console.log('Setting up locationMarker with opts.center: ' + opts.center.toString() + ', icon: ' + icon);
		renshuuMarkers.locationMarker = renshuuMarkers.createMarker(
			opts.center, 'Choose position', icon, true
		);

		google.maps.event.addListener(renshuuMarkers.locationMarker, 'drag', function (event) {
			// update position info in the form
			var pos = renshuuMarkers.locationMarker.getPosition();
			$('input[name=latitude]').val(pos.lat());
			$('input[name=longitude]').val(pos.lng());
		});
		google.maps.event.addListener(renshuuMarkers.locationMarker, 'dragstart', function (event) {
			// This event is fired when the user starts dragging the marker.
		});
		google.maps.event.addListener(renshuuMarkers.locationMarker, 'dragend', function (event) {
			// geocode current position if the form setting allows.
			// propably should geocode anyway, and only until a click on those appearing marker the address would be filled...
			if ($('input[name=geocode][value=position]').is(':checked')) {
				var pos = renshuuMarkers.locationMarker.getPosition();

				// Clear earlier geocode markers
				renshuuMarkers.removeAllGeoMarkers();

				renshuuMarkers.geocodePosition(
					{ location: pos },
					renshuuMarkers.addGeoMarkers
				);
			}
		});
		renshuuMarkers.locationMarker.setVisible(false);

		renshuuMap.initiate();

		$(window).resize(function () {
			google.maps.event.trigger(renshuuMap.map, 'resize');
		});
		console.groupEnd();
	},

	/**
	 * Initiate the following tools related to Google Street View:
	 * - StreetViewPanorama
	 * - StreetViewService
	 */
	streetInit: function (street_element, street_options) {
		console.group('streetInit');
		renshuuMap.streetService = new google.maps.StreetViewService();
		renshuuMap.streetView = new google.maps.StreetViewPanorama(street_element, street_options);


		// Check local storage for street marker position.


		// The marker which can be dragged on a spot which is should be revealed in Street View
		renshuuMarkers.streetMarker = renshuuMarkers.createMarker(
			renshuuMap.map.getCenter(), 'Street View', renshuuPins.getPinStar('glyphish_eye'), true
		);

		// Marker draggin overrides the Street View position and makes it visible if hidden.
		google.maps.event.addListener(renshuuMarkers.streetMarker, 'dragend', function () {
			var pos = renshuuMarkers.streetMarker.getPosition();
			console.log('streetMarker dragend. pos: ' + pos);
			renshuuMap.streetView.setPosition(pos);
			if (!renshuuMap.streetView.getVisible()) {
				renshuuMap.streetView.setVisible(true);
			}
		});

		// This is a bit tricky as the position changes twice in a row
		// when it is first set by the marker position and then by itself
		google.maps.event.addListener(renshuuMap.streetView, 'position_changed', function () {
			var posS = renshuuMap.streetView.getPosition();
			var posM = renshuuMarkers.streetMarker.getPosition();
			console.log('streetView position_changed. posS: ' + posS + ', posM: ' + posM);
			if (posS && !posS.equals(posM)) {
				console.log('streetView position_change positions do not equal, thus setting marker to streetView position.');
				renshuuMarkers.streetMarker.setPosition(posS);
			}
		});

		// When Street View is set visible, the position for it should have been set before, thus its position is the one that is used for the marker.
		google.maps.event.addListener(renshuuMap.streetView, 'visible_changed', function () {
			var posS = renshuuMap.streetView.getPosition();
			var posM = renshuuMarkers.streetMarker.getPosition();
			var bounds = renshuuMap.map.getBounds();
			var visible = renshuuMap.streetView.getVisible();

			console.log('streetView visible_changed. visible: ' + visible + ', posS: ' + posS + ', posM: ' + posM);

			if (visible) {
				$(street_element).slideDown();
			}
			else {
				$(street_element).slideUp();
			}
			/*
			if (!bounds.contains(posS)) {
				posS = renshuuMap.map.getCenter();
			}
			*/
			if (posS === undefined) {
				posS = renshuuMap.map.getCenter();
			}
			renshuuMarkers.streetMarker.setPosition(posS);
			renshuuMarkers.streetMarker.setVisible(visible);
			//$('#street:hidden').slideDown(renshuuMap.animSpeed);
		});

		renshuuMap.map.setStreetView(renshuuMap.streetView);

		$(window).resize(function () {
			google.maps.event.trigger(renshuuMap.streetView, 'resize');
		});
		console.groupEnd();
	},

	/**
	 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#StreetViewService
	 * getPanoramaByLocation(latlng:LatLng, radius:number, callback:function (StreetViewPanoramaData, StreetViewStatus):void))
	 */
	getPanorama: function (pos, radius) {
		console.group('getPanorama');
		if (!radius) {
			radius = 100; // Metres
		}
		renshuuMap.streetService.getPanoramaByLocation(pos, radius, function (data, status) {
			console.log('status: ' + status);
		});
		console.groupEnd();
	},
	
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
		console.group('geocodePosition');
		if (!callBack) {
			callBack = renshuuMarkers.addGeoMarkers;
		}
		if (!data.language) {
			data.language = 'ja';
		}
		renshuuMap.geocoder.geocode(
			data,
			function (results, status) {
				console.log('results: ' + results + ', status: ' + status);
				if (results && status == google.maps.GeocoderStatus.OK) {
					var key = data.address ? data.address : data.location.toString();
					console.log('key: ' + key);
					callBack.apply(this, [key, results, status]);
				}
			}
		);
		console.groupEnd();
	},



	/**
	 *
	 * @see http://malsup.com/jquery/block/
	 */
	showInfo: function (marker) {
		console.group('showInfo');
		var inx = renshuuMap.trainingMarkers.indexOf(marker);
		console.log('marker.title: '+ marker.title + ', inx: ' + inx);
		var data;
		if (inx !== -1) {
			data = renshuuMap.trainingMarkersData[inx];
		}

		if (data) {
			console.log('data. ' + data);
			// Get data
			var info = renshuuMap.buildInfoWindow(data);
			// Create overlay
			/*
			$('#map').block();
			$('.modal-close').one('click', function () {
				$('#map').unblock();
				return false;
			});
			*/
			// Fill overlay with the data inserted to a template
			$('#modalTemplate').tmpl(info).appendTo('div.blockMsg');
		}
		console.groupEnd();
	},

	
	
	
	
};
 
 
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			