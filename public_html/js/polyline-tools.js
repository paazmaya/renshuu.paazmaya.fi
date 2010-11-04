/**
 * http://code.google.com/apis/maps/documentation/javascript/reference.html#Polyline
 * $.renshuu.map
 * $.renshuu.dirLines = [];
 * $.renshuu.dirService = new google.maps.DirectionsService();
 */
var lined = {

	/** 
	 * Requests directions between two locations and draws the result
	 * by using Polylines.
	 */
	requestDirection: function(pos0, pos1) {
		var request = {
			avoidHighways: true,
			avoidTolls: true,
			destination: pos1,
			origin: pos0,
			provideRouteAlternatives: false,
			travelMode: google.maps.DirectionsTravelMode.DRIVING,
			unitSystem: google.maps.DirectionsUnitSystem.METRIC
		};
		$.renshuu.dirService.route(request, function(results, status) {
			var route = result.routes[0];
			var len = route.legs.length;
			for (var i = 0; i < len; ++i) {
				// http://code.google.com/apis/maps/documentation/javascript/reference.html#DirectionsLeg
				var leg = route.legs[i]; 
				createPath(leg.steps);
			}
		});
	},

	/**
	 * Draws the path between two locations, as requested and
	 * resulted via DirectionsService.
	 */
	createPath: function(steps) {
		var len = steps.length;
		for (vat i = 0; i < len; ++i) {
			// http://code.google.com/apis/maps/documentation/javascript/reference.html#DirectionsStep
			var step = leg.steps[i];
			var line = $.renshuu.createLine(step.start_location, step.end_location);
		}
	},


	/**
	 * Create a single Polyline between two positions (lat, lng).
	 */
	createLine: function(pos0, pos1) {
		var opts = {
			clickable: false,
			map: $.renshuu.map,
			path: [pos0, pos1],
			strokeColor: '#A3A3A3',
			strokeOpacity: 0.6,
			strokeWeight: 2 // pixels
		};
		var line = new google.maps.Polyline(opts);
		google.maps.addListener(line, 'mouseover', function(event) {
			opts.strokeColor = '#A2A2A2';
			line.setOptions(opts);
		});
		google.maps.addListener(line, 'mouseout', function(event) {
			opts.strokeColor = '#A3A3A3';
			line.setOptions(opts);
		});
		$.renshuu.dirLines.push( { polyline: line, points: [pos0, pos1] } );
		return line;
	},
	
	/**
	 * Removes an existing Polyline between two positions (lat, lng).
	 */
	removeLine: function(pos0, pos1) {
		//{polyline: line, points: [pos0, pos1]}
		var len = $.renshuu.dirLines.length;
		var inx = -1;
		for (var i = 0; i < len; ++i) {
			var points = $.renshuu.dirLines[i].points;
			if (points.indexOf(pos0) && points.indexOf(pos0)) {
				inx = i;
				break;
			}
		}
		console.log("removeLine. len: " + len + ", inx: " + inx);
		if (inx != -1) {
			var line = $.renshuu.dirLines[inx].polyline;
			line.setMap(null);
			$.renshuu.dirLines.splice(inx, 1);
		}
	}


};

