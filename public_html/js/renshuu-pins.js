/**
 * Renshuu Pins, as used in Google Maps
 */
var renshuuPins = {
	
	
	
	/**
	 *
	 * @see http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=fire|ADDE63
	 */
	getIcon: function (icon, color) { // 21, 34
		if (!icon) {
			icon = 'fire';
		}
		if (!color) {
			color = 'ADDE63';
		}
		return renshuuMarkers.getMarkerImage(
			'chst=d_map_pin_icon&chld=' + icon + '|' + color
		);
	},

	/**
	 *
	 * @see http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=場|ADDE63|05050D
	 */
	getLetter: function (letter, fill, color) {
		if (!letter) {
			letter = '場';
		}
		if (!fill) {
			fill = 'ADDE63';
		}
		if (!color) {
			color = '05050D';
		}
		return renshuuMarkers.getMarkerImage(
			'chst=d_map_pin_letter&chld=' + encodeURI(letter) + '|' + fill + '|' + color
		);
	},

	/**
	 * Type can be only one of the two [pin_sright, pin_sleft], othervise size mismatches.
	 * @see
	 */
	getPinStar: function (icon, fill, star, type) {
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
		return renshuuMarkers.getMarkerImage(
			'chst=d_map_xpin_icon&chld=' + type + '|' + icon + '|' + fill + '|' + star, size, origin, anchor
		);
	},

	/**
	 * http://chart.googleapis.com/chart?chst=d_bubble_text_small&chld=bbtl|Himeji%20shiritsu%20sogo%20sports%20kaigan|F9FBF7|5E0202
	 * http://chart.googleapis.com/chart?chst=d_bubble_text_small_withshadow&chld=bbtl|Himeji%20shiritsu%20sogo%20sports%20kaigan|F9FBF7|5E0202
	 * @see http://code.google.com/apis/chart/infographics/docs/overview.html
	 */
	getBubble: function (icon, text, fill, color, type) {
		if (!icon) {
			icon = 'd_bubble_text_small';
		}
		if (!text) {
			text = 'Select+position';
		}
		if (!fill) {
			fill = 'F9FBF7';
		}
		if (!color) {
			color = '5E0202';
		}
		if (!type) {
			type = 'bbtl';
		}
		var size = new google.maps.Size(41, 42);
		var origin = new google.maps.Point(0, 0);
		var anchor = new google.maps.Point(0, 0);
		
		return renshuuMarkers.getMarkerImage(
			'chst=' + icon + '&chld=' + type + '|' + encodeURI(text) + '|' +
			fill + '|' + color, size, origin, anchor
		);
	},

	gYellowIcon: function () { return renshuuMap.getIcon('glyphish_target', 'F9FBF7'); },
	gRedIcon: function () { return renshuuMap.getIcon('star', 'CC2233'); },
	gBlueIcon: function () { return renshuuMap.getIcon('snow', '2233CC'); }

	
	
};