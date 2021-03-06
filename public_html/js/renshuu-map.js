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
	 * Center position, if any.
	 * Defaults to Hikone Castle.
	 * @see http://www.flickr.com/photos/rekishinotabi/sets/72157618241282853/
	 */
  centre: null,

  /**
	 * Google Maps Geocoder
	 */
  geocoder: null,

  /**
	 * When was the most recent geocoding done?
	 */
  lastGeocoding: 0,

  /**
	 * How much time needs to be inbetween consecutive geocodings?
	 * Milliseconds
	 */
  geocodingInterval: 1200,

  /**
	 * If this value is 'address' and a marker is clicked, its position will be place in the form.
	 */
  geocodeBasedOn: 'none',

  /**
	 * When was the most recent location marker update done?
	 */
  lastLocationUpdate: 0,

  /**
	 * How much time needs to be inbetween consecutive location marker updates?
	 * Milliseconds
	 */
  locationUpdateInterval: 1200,

  /**
	 * Google Maps v3
	 * http://code.google.com/apis/maps/documentation/javascript/reference.html
	 */
  map: null,

  /**
	 * google.maps.StreetViewPanorama
	 * http://code.google.com/apis/maps/documentation/javascript/reference.html#StreetViewPanorama
	 */
  streetView: null,

  /**
	 * Should the Google StreetView be enabled?
	 */
  streetViewEnabled: false,

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
	 * As per marker double click, show its position in Street View
	 */
  showInStreetView: true,

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
	 * When was the most recent request for direction service made?
	 */
  lastDirectionRequest: 0,

  /**
	 * The time in milliseconds between consecutive call to the directions
	 * service (google.maps.DirectionsRequest).
	 * It shall prevent of getting google.maps.DirectionsStatus.OVER_QUERY_LIMIT
	 */
  directionRequestInterval: 1000, // 1 sec

  init: function() {

    // Setup the default center if nothing is found from localStorage
    renshuuMap.centre = new google.maps.LatLng(35.27655600992416, 136.25263971710206);

    // Set up the directions service
    renshuuMap.dirService = new google.maps.DirectionsService();

    // Check for localStorage items
    renshuuMap.loadMapZoom();
    renshuuMap.loadMapCenter();

    // Set up the Google Map v3
    renshuuMap.mapInit($('#map').get(0));

    // and the Street View
    if (renshuuMap.streetViewEnabled) {
      renshuuMap.streetInit($('#street').get(0), {
        enableCloseButton: false,
        visible: false
      });
    }

    // jsrender templating
    $.views.helpers({
      deg2dms: renshuuMap.deg2dms
    });


  },


  /**
	 * Read the zoom level from the local storage
	 * @see
	 */
  loadMapZoom: function () {
    if (localStorage.getItem('mapZoom')) {
      const zoom = parseInt(localStorage.getItem('mapZoom'), 10);
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
    const zoom = renshuuMap.map.getZoom();
    localStorage.setItem('mapZoom', zoom);
    renshuuMap.zoom = zoom; // why is this here?
  },

  /**
	 * Read the center location from the local storage
	 * @see
	 */
  loadMapCenter: function () {
    if (localStorage.getItem('mapCenter')) {
      const arr = localStorage.getItem('mapCenter').split(',');
      if (arr && arr.length > 1) {
        renshuuMap.centre = new google.maps.LatLng(parseFloat(arr[0]), parseFloat(arr[1]));
      }
      console.log('mapCenter storage item existed. arr: ' + arr);
    }
  },

  /**
	 * Save the center location in the local storage
	 * @see
	 */
  saveMapCenter: function () {
    const c = renshuuMap.map.getCenter();
    localStorage.setItem('mapCenter', c.lat() + ',' + c.lng());
  },


  /**
	 * If current tab view is in the location or training,
	 * show training place locations.
	 * As opposed to trainings.
	 */
  updateLocations: function () {
    const now = $.now();
    const diff = now - renshuuMap.lastLocationUpdate;
    if (renshuuMap.locationUpdateInterval > diff) {
      console.log('skipping updateLocations. now: ' + now + ', diff: ' + diff);

      return false;
    }
    console.group('updateLocations ' + now);

    renshuuMap.lastLocationUpdate = now;

    const bounds = renshuuMap.map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const para = {
      area: {
        northeast: [ne.lat(), ne.lng()],
        southwest: [sw.lat(), sw.lng()]
      }
    };
    renshuuMarkers.clearMarkers(renshuuMarkers.locationMarkers);
    renshuuMarkers.locationMarkersData = [];

    $.post('/ajax/get/location', para, function (data, status) {
      console.dir(data);
      if (data && data.result) {
        const res = data.result;
        const len = res.length;
        for (let i = 0; i < len; ++i) {
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
	 * Draw route between two spots, while using directions service.
   * @param {object} pos1
   * @param {object} pos2
	 */
  drawRoute: function (pos1, pos2) {
    const now = $.now();
    const diff = now - renshuuMap.lastDirectionRequest;
    if (renshuuMap.directionRequestInterval > diff) {
      console.log('skipping drawRoute. now: ' + now + ', diff: ' + diff);

      return false;
    }
    console.group('drawRoute ' + now);

    renshuuMap.lastDirectionRequest = now;

    const reg = {
      avoidHighways: true,
      destination: pos2,
      origin: pos1,
      provideRouteAlternatives: false,
      travelMode: google.maps.DirectionsTravelMode.WALKING
    };

    renshuuMap.dirService.route(reg, function (result, status) {
      console.log('route status: ' + status);
      if (result && result.routes && result.routes[0]) {
        const route = result.routes[0]; // DirectionsRoute  just one if provideRouteAlternatives == false
        const lenl = route.legs.length;
        for (let i = 0; i < lenl; ++i) {
          const leg = route.legs[i]; // DirectionsLeg  http://code.google.com/apis/maps/documentation/javascript/reference.html#DirectionsLeg
          const lens = leg.steps.length;
          for (let j = 0; j < lens; ++j) {
            const step = leg.steps[j]; // DirectionsStep
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
   * @param {} pos1
   * @param {} pos2
   * @param {} color
	 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#LatLng
	 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html#Polyline
	 */
  drawPath: function (pos1, pos2, color) {
    console.group('drawPath');
    const opts = {
      clickable: false,
      geodesic: true,
      map: renshuuMap.map,
      path: [pos1, pos2],
      strokeColor: '#FFAA00', // html hex
      strokeOpacity: 0.5,
      strokeWeight: 2 // pixels
    };
    if (color) {
      opts.strokeColor = color;
    }
    const line = new google.maps.Polyline(opts);

    // Change the color slightly
    google.maps.event.addListener(line, 'mouseover', function () {
      const o = opts;
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
   * @param {} position
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
   * @param {} elem
   * @param {object} map_options
	 */
  mapInit: function (elem, map_options) {
    console.group('mapInit');
    renshuuMap.geocoder = new google.maps.Geocoder();

    // http://code.google.com/apis/maps/documentation/javascript/reference.html#MapOptions
    let opts = {
      center: renshuuMap.centre,
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

    google.maps.event.addListener(renshuuMap.map, 'bounds_changed', function () {
      if (renshuuMain.tabForms == 'location' || renshuuMain.tabForms == 'training') {
        renshuuMap.updateLocations();
      }
    });

    google.maps.event.addListener(renshuuMap.map, 'center_changed', function () {
      renshuuMap.saveMapCenter();
    });

    google.maps.event.addListener(renshuuMap.map, 'zoom_changed', function () {
      renshuuMap.saveMapZoom();
    });


    console.log('Setting up locationMarker with opts.center: ' + opts.center.toString());

    // http://chart.googleapis.com/chart?chst=d_map_xpin_icon&chld=pin_sright|glyphish_paperclip|949494|050505
    renshuuMarkers.locationMarker = renshuuMarkers.createMarker(
      opts.center,
      'Choose position',
      renshuuMarkers.getMarkerImage(
        'd_map_xpin_icon',
        'pin_sright|glyphish_paperclip|949494|050505',
        new google.maps.Point(0, 33)
      ),
      true
    );

    google.maps.event.addListener(renshuuMarkers.locationMarker, 'drag', function (event) {
      // update position info in the form
      const pos = renshuuMarkers.locationMarker.getPosition();
      $('input[name="latitude"]').val(pos.lat());
      $('input[name="longitude"]').val(pos.lng());
    });

    google.maps.event.addListener(renshuuMarkers.locationMarker, 'dragend', function (event) {
      // geocode current position if the form setting allows.
      // propably should geocode anyway, and only until a click on those appearing marker the address would be filled...
      if ($('input[name="geocode"][value="position"]').is(':checked')) {
        const pos = renshuuMarkers.locationMarker.getPosition();

        // Clear earlier geocode markers
        renshuuMarkers.removeAllGeoMarkers();

        renshuuMap.geocodePosition(
          {
            location: pos
          },
          renshuuMarkers.addGeoMarkers
        );
      }
    });
    renshuuMarkers.locationMarker.setVisible(false);

    $(window).resize(function () {
      google.maps.event.trigger(renshuuMap.map, 'resize');
    });
    console.groupEnd();
  },

  /**
	 * Initiate the following tools related to Google Street View:
	 * - StreetViewPanorama
	 * - StreetViewService
   * @param {} street_element
   * @param {object} street_options
	 */
  streetInit: function (street_element, street_options) {
    console.group('streetInit');
    renshuuMap.streetService = new google.maps.StreetViewService();
    renshuuMap.streetView = new google.maps.StreetViewPanorama(street_element, street_options);


    // Check local storage for street marker position.


    // The marker which can be dragged on a spot which is should be revealed in Street View
    // http://chart.googleapis.com/chart?chst=d_map_xpin_icon&chld=pin_sright|glyphish_eye|F9FBF7|5E0202
    renshuuMarkers.streetMarker = renshuuMarkers.createMarker(
      renshuuMap.map.getCenter(),
      'Street View',
      renshuuMarkers.getMarkerImage(
        'd_map_xpin_icon',
        'pin_sright|glyphish_eye|F9FBF7|5E0202',
        new google.maps.Point(0, 33)
      ),
      true
    );

    // Marker draggin overrides the Street View position and makes it visible if hidden.
    google.maps.event.addListener(renshuuMarkers.streetMarker, 'dragend', function () {
      const pos = renshuuMarkers.streetMarker.getPosition();
      console.log('streetMarker dragend. pos: ' + pos);
      renshuuMap.streetView.setPosition(pos);

      if (!renshuuMap.streetView.getVisible()) {
        renshuuMap.streetView.setVisible(true);
      }
    });

    // This is a bit tricky as the position changes twice in a row
    // when it is first set by the marker position and then by itself
    google.maps.event.addListener(renshuuMap.streetView, 'position_changed', function () {
      const posS = renshuuMap.streetView.getPosition();
      const posM = renshuuMarkers.streetMarker.getPosition();
      console.log('streetView position_changed. posS: ' + posS + ', posM: ' + posM);
      if (posS && !posS.equals(posM)) {
        console.log('streetView position_change positions do not equal, thus setting marker to streetView position.');
        renshuuMarkers.streetMarker.setPosition(posS);
      }
    });

    // When Street View is set visible, the position for it should have been set before, thus its position is the one that is used for the marker.
    google.maps.event.addListener(renshuuMap.streetView, 'visible_changed', function () {
      let posS = renshuuMap.streetView.getPosition();
      const posM = renshuuMarkers.streetMarker.getPosition();
      const bounds = renshuuMap.map.getBounds();
      const visible = renshuuMap.streetView.getVisible();

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
   * @param {} pos
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
    let letter = isLatitude ? 'NS' : 'EW';

    if (degfloat < 0) {
      degfloat = Math.abs(degfloat);
      letter = letter.substr(1, 1);
    }
    else {
      letter = letter.substr(0, 1);
    }

    //console.log('deg_to_dms. degfloat: ' + degfloat);

    let deg = Math.floor(degfloat);
    const minfloat = 60 * (degfloat - deg);
    //console.log('deg_to_dms. minfloat: ' + minfloat);
    let min = Math.floor(minfloat);
    //console.log('deg_to_dms. min: ' + min);
    let secfloat = 60 * (minfloat - min);
    //console.log('deg_to_dms. secfloat: ' + secfloat);
    secfloat = Math.round(secfloat);

    if (secfloat == 60) {
      min++;
      secfloat = 0;
    }
    if (min == 60) {
      deg++;
      min = 0;
    }
    //W 87°43'41"

    return deg + '° ' + min + '\' ' + secfloat + '" ' + letter;
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
    renshuuMap.geocoder.geocode(
      data,
      function (results, status) {
        renshuuMap.lastGeocoding = $.now();
        console.log('results: ' + results + ', status: ' + status);
        if (results && status == google.maps.GeocoderStatus.OK) {
          const key = data.address ? data.address : data.location.toString();
          console.log('key: ' + key);
          callBack.apply(this, [key, results, status]);
        }
      }
    );
    console.groupEnd();
  }


};

