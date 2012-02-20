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
	 *
	 * @see
	 */
	createLocationMarker: function (data) {
		console.group('createLocationMarker');
		var icon = renshuuPins.getBubble('d_bubble_text_small', data.location.title, 'F9FBF7', '5E0202');
		var pos = new google.maps.LatLng(data.location.latitude, data.location.longitude);
		var marker = renshuuMarkers.createMarker(pos, data.location.title, icon, false);

		google.maps.event.addListener(marker, 'click', function (event) {
			// This event is fired when the marker icon was clicked.
			var pos = marker.getPosition();
			console.log('location marker. click - ' + marker.title + ', pos: ' + pos);
			// This should now fill the address in the "training" form...
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

		var marker = renshuuMarkers.createMarker(
			res.geometry.location,
			res.formatted_address,
			renshuuPins.getLetter(i + 1),
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
			console.log('clicking geocode marker. title: ' + title + ', pos: ' + pos);
			
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
			icon = renshuuMap.getIcon();
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
		google.maps.event.addListener(marker, 'mouseout', function (event) {
			// This event is fired when the mouse leaves the area of the marker icon.
		});
		google.maps.event.addListener(marker, 'mouseover', function (event) {
			// This event is fired when the mouse enters the area of the marker icon.
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
		console.group('createTrainingMarker');
		var icon = renshuuPins.getLetter(data.training.art.title.substr(0, 1), '0E3621', '05050D');
		var pos = new google.maps.LatLng(data.location.latitude, data.location.longitude);
		var marker = renshuuMarkers.createMarker(pos, data.training.art.title + ' / ' + data.location.title, icon, false);

		google.maps.event.addListener(marker, 'click', function (event) {
			// This event is fired when the marker icon was clicked.
			var pos = marker.getPosition();
			console.log('training marker. click - ' + marker.title + ', pos: ' + pos);
			// Show the blockUi over map with the details
			renshuuMap.showInfo(marker);
		});

		var len = renshuuMarkers.trainingMarkers.push(marker);
		renshuuMarkers.trainingMarkersData[len - 1] = data;
		console.groupEnd();
	},
	
	/**
	 * Show or hide the training markerks based on renshuuMain.showTrainings.
	 */
	setTrainingMarkersVisibility: function () {
		var visible = renshuuMain.showTrainings;
		var len = renshuuMarkers.trainingMarkers.length;
		for (var i = 0; i < len; i++) {
			var marker = renshuuMarkers.trainingMarkers[i];
			if (marker !== null) {
				marker.setVisible(visible);
			}
		}
	},

	/**
	 * MarkerImage(url:string, size?:Size, origin?:Point, anchor?:Point, scaledSize?:Size)
	 * @see http://code.google.com/apis/chart/docs/gallery/dynamic_icons.html#icon_list
	 */
	getMarkerImage: function (image, size, origin, anchor) {
		console.log('getMarkerImage. image: ' + image + ', size: ' + size + ', origin: ' + origin + ' , anchor: ' + anchor);
		return new google.maps.MarkerImage(
			'http://chart.googleapis.com/chart?' + image, null, origin, anchor
		);
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
				weekDay: (renshuuMain.weekdays.length > data.training.weekday ? renshuuMain.weekdays[data.training.weekday] : ''), // todo: get weekday string from backend
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
				locationAddr: (data.location && data.location.address) ? data.location.address : null
			};
		}

		console.debug('info. ' + info);
		//$(info).appendTo('body');
		console.groupEnd();
		return info;
	}


};
