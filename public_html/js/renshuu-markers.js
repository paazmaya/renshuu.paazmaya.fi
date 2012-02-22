/**
 * Renshuu Markers, as used in Google Maps
 */

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
var renshuuMarkers = {
	
	
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
		console.group('addGeoMarkers');
		console.log('key: ' + key + ', status: ' + status + ', results: ' + results);
		var lenG = renshuuMarkers.geocodeMarkers.length;
		var markers = [];
		var len = Math.min(3, results.length); // Max three results
		console.log('len: ' + len);

		for (var i = 0; i < len; ++i) {
			// Should check that each address has only one marker.
			markers.push(renshuuMarkers.createGeocodeMarker(results[i], i));

			console.log('i: ' + i);

		}
		// { key:"address or lat/lng that was tried to be geocoded", markers: [] }
		renshuuMarkers.geocodeMarkers.push({
			key: key,
			markers: markers
		});
		//$('input[name="address"]').val(results[0].formatted_address);
		//$('input[name="address"]').val('Cannot determine address at this location.');

		console.groupEnd();
	},

	/**
	 * Removes one marker from the list of geocode result markers.
	 * If it was the last one in that patch, then the whole patch will be removed.
	 * @see
	 */
	removeGeoMarker: function (marker) {
		console.group('removeGeoMarker');
		// { key:"address or lat/lng that was tried to be geocoded", markers: [] }
		var i = renshuuMarkers.geocodeMarkers.length;
		while (0 < i) {
			--i;
			var markers = renshuuMarkers.geocodeMarkers[i].markers;
			var inx = renshuuMarkers.geocodeMarkers.indexOf(marker);
			console.log('rightclicking thus removing marker with title: ' + marker.getTitle() + ', inx: ' + inx + ", i: " + i);
			if (inx !== -1) {
				markers.splice(inx, 1);
			}
			if (markers.length == 0) {
				renshuuMarkers.geocodeMarkers.splice(i, 1);
			}
		}
		marker.setMap(null);
		console.groupEnd();
	},

	/**
	 *
	 * @see
	 */
	removeAllGeoMarkers: function () {
		// { key:"address or lat/lng that was tried to be geocoded", markers: [] }
		var len = renshuuMarkers.geocodeMarkers.length;
		while (len > 0) {
			len--;
			var marker = renshuuMarkers.geocodeMarkers[len];
			renshuuMarkers.geocodeMarkers.splice(len, 1);
			if (typeof marker !== 'undefined') {
				marker.setMap(null);
			}
		}
		renshuuMarkers.geocodeMarkers = [];
	},
	
	
	/**
	 * Create a marker for existing location.
	 * Clicking will set it as selected option in training form, if it is visible.
	 */
	createLocationMarker: function (data) {
		console.group('createLocationMarker');
		
		// http://chart.googleapis.com/chart?chst=d_bubble_text_small&chld=bbtl|Himeji%20shiritsu%20sogo%20sports%20kaigan|F9FBF7|5E0202
		var icon = renshuuMarkers.getMarkerImage(
			'd_bubble_text_small', 
			'bbtl|' + data.location.title + '|F9FBF7|5E0202',
			new google.maps.Point(0, 0)
		);
		
		var pos = new google.maps.LatLng(data.location.latitude, data.location.longitude);
		var marker = renshuuMarkers.createMarker(pos, data.location.title, icon, false);

		google.maps.event.addListener(marker, 'click', function (event) {
			// This event is fired when the marker icon was clicked.
			var pos = marker.getPosition();
			var inx = renshuuMarkers.locationMarkers.indexOf(marker);
			var data = renshuuMarkers.locationMarkersData[inx];
			console.log('location marker. click - ' + marker.title + ', pos: ' + pos + ', inx: ' + inx);
			console.dir(data);
			
			// This should now fill the address in the "training" form...
			if (renshuuMain.tabForms == 'training') {
				console.log('setting select location val to be data.location.id: ' + data.location.id);
				$('select[name="location"]').val(data.location.id);
			}
		});

		var len = renshuuMarkers.locationMarkers.push(marker);
		renshuuMarkers.locationMarkersData[len - 1] = data;
		console.groupEnd();
	},
	
	

	/**
	 *
	 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#GeocoderResult
	 */
	createGeocodeMarker: function (res, i) {
		console.group('createGeocodeMarker');

		for (var j in res) {
			if (res.hasOwnProperty(j)) {
				console.log('res[' + j + '] = ' + res[j]);
			}
		}


		for (var s in res.address_components) {
			var a = res.address_components[s];
			for (var c in a) {
				console.log('res.address_components: ' + s + ' --\> ' + c + ' = ' + a[c]);
			}
		}
		for (var g in res.geometry) {
			console.log('res.geometry: ' + g + ' = ' + res.geometry[g]);
		}

		// http://chart.googleapis.com/chart?chst=d_bubble_text_small&chld=bbtr|6|ADDE63|05050D
		var marker = renshuuMarkers.createMarker(
			res.geometry.location,
			res.formatted_address,
			renshuuMarkers.getMarkerImage(
				'd_bubble_text_small',
				'bbtr|' + (i + 1) + '|ADDE63|05050D', 
				new google.maps.Point(42, 0)
			),
			false
		);
		// Right click will be used for deleting...
		google.maps.event.addListener(marker, 'rightclick', function (event) {
			renshuuMarkers.removeGeoMarker(marker);
		});
		google.maps.event.addListener(marker, 'click', function (event) {
			// This event is fired when the marker is right clicked on.
			var title = marker.getTitle();
			var pos = marker.getPosition();
			console.log('geocode marker click. title: ' + title + ', pos: ' + pos);
			
			$('#location_form input[name="address"]').val(title);
			$('#location_form input[name="latitude"]').val(pos.lat());
			$('#location_form input[name="longitude"]').val(pos.lng());
			
			if (renshuuMap.geocodeBasedOn == 'position') {
			}
			else if (renshuuMap.geocodeBasedOn == 'address') {
			}
		});

		console.groupEnd();
		return marker;
	},
	
	
	
	/**
	 * Create a simple marker with common settings and listeners.
	 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#MarkerOptions
	 */
	createMarker: function (pos, title, icon, drag) {
		console.group('createMarker');
		if (!icon) {
			// http://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=fire|ADDE63
			icon = renshuuMarkers.getMarkerImage('d_map_pin_icon', 'fire|ADDE63');
		}
		if (drag === null) {
			drag = false;
		}
		console.log('pos: ' + pos + ', title: ' + title + ', drag: ' + drag);
		var marker = new google.maps.Marker({
			position: pos,
			title: title,
			map: renshuuMap.map,
			draggable: drag,
			icon: icon,
			animation: google.maps.Animation.DROP
		});

		// Marker double click shows that spot in street view
		google.maps.event.addListener(marker, 'dblclick', function (event) {
			// This event is fired when the marker icon was double clicked.
			console.log('marker. dblclick - ' + marker.title);
			console.log('showInStreetView: ' + renshuuMap.showInStreetView);
			if (renshuuMap.showInStreetView) {
				renshuuMap.showStreetView(marker.getPosition());
			}
		});
		google.maps.event.addListener(marker, 'mouseover', function (event) {
			// This event is fired when the mouse enters the area of the marker icon.
			marker.setZIndex(marker.getZIndex() + 10);
		});
		google.maps.event.addListener(marker, 'rightclick', function (event) {
			// This event is fired when the marker is right clicked on.
		});

		console.groupEnd();
		return marker;
	},
	
	
	/**
	 *
	 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#Marker
	 */
	clearMarkers: function (list) {
		var len = list.length;
		for (var i = 0; i < len; ++i) {
			var marker = list[i];
			if (typeof marker !== 'undefined' && marker != null) {
				// API docs say: "If map is set to null, the marker will be removed."
				marker.setMap(null);
			}
		}
		list = [];
	},

	/**
	 * Create a marker for a training. Clicking it opens a blockui info window.
	 */
	createTrainingMarker: function (data) {
		console.group('createTrainingMarker');
		
		// http://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=glyphish_group|bb|Ryukyu Kobujutsu|129EF7|05050D
		var icon = renshuuMarkers.getMarkerImage(
			'd_bubble_icon_text_small', 
			'glyphish_group|bb|' + data.training.art.title + '|129EF7|05050D',
			new google.maps.Point(0, 42)
		);
		
		var pos = new google.maps.LatLng(data.location.latitude, data.location.longitude);
		var marker = renshuuMarkers.createMarker(pos, data.training.art.title + ' / ' + data.location.title, icon, false);
		
		// Visibility based on current checkbox state
		marker.setVisible(renshuuMain.showTrainings);

		google.maps.event.addListener(marker, 'click', function (event) {
			// This event is fired when the marker icon was clicked.
			var pos = marker.getPosition();
			console.log('training marker. click - ' + marker.title + ', pos: ' + pos);
			// Show the blockUi over map with the details
			renshuuMarkers.showInfo(marker);
		});

		var len = renshuuMarkers.trainingMarkers.push(marker);
		renshuuMarkers.trainingMarkersData[len - 1] = data;
		console.groupEnd();
	},
	

	/**
	 * Marker data from the backend.
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
	 * @see http://malsup.com/jquery/block/
	 */
	showInfo: function (marker) {
		console.group('showInfo');
		var inx = renshuuMarkers.trainingMarkers.indexOf(marker);
		console.log('marker.title: '+ marker.title + ', inx: ' + inx);
		var data;
		if (inx !== -1) {
			data = renshuuMarkers.trainingMarkersData[inx];
		}
		console.dir(data);

		if (data) {
			$('#map').block();
			$('.modal-close').one('click', function () {
				$('#map').unblock();
				return false;
			});
			
			// Fill overlay with the data inserted to a template
			$('div.blockMsg').html($('#trainingTemplate').render(data));
		}
		console.groupEnd();
	},
	
	/**
	 * Show or hide the training markerks based on renshuuMain.showTrainings.
	 */
	setTrainingMarkersVisibility: function () {
		var visible = renshuuMain.showTrainings;
		var len = renshuuMarkers.trainingMarkers.length;
		console.log('setTrainingMarkersVisibility. visible: ' + visible + ', len: ' + len);
		for (var i = 0; i < len; i++) {
			var marker = renshuuMarkers.trainingMarkers[i];
			console.log('setTrainingMarkersVisibility. marker.title: ' + marker.title);
			if (typeof marker !== 'undefined' && marker !== null) {
				marker.setVisible(visible);
			}
		}
	},

	/**
	 * MarkerImage(url:string, size?:Size, origin?:Point, anchor?:Point, scaledSize?:Size)
	 * @see http://code.google.com/apis/chart/docs/gallery/dynamic_icons.html#icon_list
	 */
	getMarkerImage: function (chst, chld, anchor) {
		var img = 'http://chart.googleapis.com/chart?chst=' + chst + '&chld=' + encodeURI(chld);
		console.log('getMarkerImage. img: ' + img + ' , anchor: ' + anchor);
		return new google.maps.MarkerImage(img, null, null, anchor);
	}


};
