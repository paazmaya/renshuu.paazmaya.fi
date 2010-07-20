/**
 * jQuery goMap
 *
 * @url		http://www.pittss.lv/jquery/gomap/
 * @author	Jevgenijs Shtrauss <pittss@gmail.com>
 * @version	1.0.1
 */

(function($) {
	var geocoder = new google.maps.Geocoder();

	$.fn.goMap = function(options) {
		var opts = $.extend({}, $.goMap.defaults, options);

		return this.each(function()	{
			$.goMap.selector 	 = this;
			$.goMap.opts		 = opts;
			$.goMap.markers		 = [];
			$.goMap.centerLatLng = null;
			$.goMap.init(opts);
		});
	};

	$.goMap = {
		defaults: {
			address:				'', // Street, City, Country
			latitude:				56.9,
			longitude:				24.1,
			zoom:					4,
			delay:					500,
			hideByClick:			true,
		    navigationControl: 		true, // Show or hide navigation control
			navigationControlOptions: {
				position:			'TOP_LEFT', // TOP, TOP_LEFT, TOP_RIGHT, BOTTOM, BOTTOM_LEFT, BOTTOM_RIGHT, LEFT, RIGHT
				style:				'DEFAULT' // DEFAULT, ANDROID, SMALL, ZOOM_PAN
			},
		    mapTypeControl: 		true, // Show or hide map control
			mapTypeControlOptions:	{
				position: 			'TOP_RIGHT', // TOP, TOP_LEFT, TOP_RIGHT, BOTTOM, BOTTOM_LEFT, BOTTOM_RIGHT, LEFT, RIGHT
				style: 				'DEFAULT' // DEFAULT, DROPDOWN_MENU, HORIZONTAL_BAR
			},
		    scaleControl: 			false, // Show or hide scale
			scrollwheel:			true, // Mouse scroll whell
		    directions: 			false,
		    directionsResult: 		null,
			disableDoubleClickZoom:	false,
			markers:				[],
			maptype:				'HYBRID', // Map type - HYBRID, ROADMAP, SATELLITE, TERRAIN
			html_prepend:			'<div class=gomapMarker>',
			html_append:			'</div>',
			addMarker:				false
		},

		map:		  null,
		markers:	  [],
		selector: 	  null,
		opts:		  null,
		centerLatLng: null,

		init: function(opts) {

			if (opts.address)
				$.goMap.geocode(opts.address, true);

			else if (opts.latitude != this.defaults.latitude && opts.longitude != this.defaults.longitude)
				this.centerLatLng = new google.maps.LatLng(opts.latitude,opts.longitude);

			else if ($.isArray(opts.markers) && opts.markers.length > 0) {
				if (opts.markers[0].address)
					$.goMap.geocode(opts.markers[0].address, true);
				else
					this.centerLatLng = new google.maps.LatLng(opts.markers[0].latitude,opts.markers[0].longitude);
			}
			else
				this.centerLatLng = new google.maps.LatLng(opts.latitude,opts.longitude);

			var myOptions = {
				center:			   		this.centerLatLng,
				disableDoubleClickZoom:	opts.disableDoubleClickZoom,
		        mapTypeControl:	   		opts.mapTypeControl,
				mapTypeControlOptions:  {
					position: 			eval('google.maps.ControlPosition.' + opts.mapTypeControlOptions.position.toUpperCase()),
					style:				eval('google.maps.MapTypeControlStyle.' + opts.mapTypeControlOptions.style.toUpperCase())
				},
				mapTypeId:		   		eval('google.maps.MapTypeId.' + opts.maptype.toUpperCase()),
        		navigationControl: 		opts.navigationControl,
				navigationControlOptions: {
					position: 			eval('google.maps.ControlPosition.' + opts.navigationControlOptions.position.toUpperCase()),
					style:				eval('google.maps.NavigationControlStyle.' + opts.navigationControlOptions.style.toUpperCase())
				},
		        scaleControl:	   		opts.scaleControl,
		        scrollwheel:	   		opts.scrollwheel,
				zoom:			   		opts.zoom
			};

			$.goMap.map = new google.maps.Map(this.selector, myOptions);

			for (var j = 0; j < opts.markers.length; j++)
				this.createMarker(opts.markers[j]);

			if (opts.addMarker == true || opts.addMarker == 'multi') {
				google.maps.event.addListener($.goMap.map, 'click', function(event) {

					var options = {
						position:event.latLng,
						draggable:true
					};
					var marker = $.goMap.createMarker(options);

					google.maps.event.addListener(marker, 'dblclick', function(event) {
						marker.setMap(null);
						$.goMap.removeMarker(marker);
					});

				});
			}
			else if (opts.addMarker == 'single') {
				google.maps.event.addListener($.goMap.map, 'click', function(event) {
					if(!$.goMap.singleMarker) {
						var options = {
							position:event.latLng,
							draggable:true
						};
						var marker = $.goMap.createMarker(options);

						$.goMap.singleMarker = true;

						google.maps.event.addListener(marker, 'dblclick', function(event) {
							marker.setMap(null);
							$.goMap.removeMarker(marker);
							$.goMap.singleMarker = false;
						});
					}
				});
			}
		},

		geocode: function(address, setCenter, options) {
			setTimeout(function() {
				geocoder.geocode({'address': address}, function(results, status) {
			        if (status == google.maps.GeocoderStatus.OK && setCenter)
						$.goMap.map.setCenter(results[0].geometry.location);

					else if (status == google.maps.GeocoderStatus.OK) {
						options.position = results[0].geometry.location;
						var cmarker = new google.maps.Marker(options);

						if (options.html) {
							if (!options.html.content && !options.html.ajax && !options.html.id)
								options.html = { content:options.html };
							else if (!options.html.content)
								options.html.content = null;

							$.goMap.setInfo(cmarker, options.html);
						}
						$.goMap.addMarker(cmarker);
						return cmarker;
					}
       			});
			}, this.opts.delay);
		},

		setInfo: function(marker, html) {
			html.content    = this.opts.html_prepend + html.content + this.opts.html_append;
			var infowindow  = new google.maps.InfoWindow(html);
			infowindow.show = false;

			if (html.popup) {
				$.goMap.openWindow(infowindow, marker, html);
				infowindow.show = true;
			}

			google.maps.event.addListener(marker, 'click', function() {
				if (infowindow.show && $.goMap.opts.hideByClick) {
					infowindow.close();
					infowindow.show = false;
				}
				else {
					$.goMap.openWindow(infowindow, marker, html);
					infowindow.show = true;
				}
			});

			google.maps.event.addListener(marker, 'visible_changed', function() {
				if(!marker.getVisible())
					infowindow.close();
			});
		},

		openWindow: function(infowindow, marker, html) {
			if (html.ajax) {
				infowindow.open(this.map, marker);
				$.ajax({
					url: html.ajax,
					success: function(html) {
						infowindow.setContent(html);
					}
				});
			}
			else if (html.id) {
				infowindow.setContent($(html.id).html());
				infowindow.open(this.map, marker);
			}
			else
				infowindow.open(this.map, marker);
		},

		getMarkers: function(type) {
			var array = [];
			switch(type) {
				case "json":
					for (var i in this.markers) {
						var temp = "'" + i + "': '" + this.markers[i].getPosition().toUrlValue() + "'";
						array.push(temp);
					}
					return "{'markers':{" + array.join(",") + "}}";
					break;
				case "data":
					for (var i in this.markers) {
						var temp = "marker[" + i + "]=" + this.markers[i].getPosition().toUrlValue();
						array.push(temp);
					}
					return array.join("&");
					break;

				default:
					for (var i in this.markers) {
						var temp = this.markers[i].getPosition().toUrlValue();
						array.push(temp);
					}
					return array;
					break;
			}

		},

		getMarkerCount: function() {
			return $.goMap.markers.length;
		},

		addMarker: function(marker) {
				$.goMap.markers.push(marker);
		},

		addMarkers: function(markers) {
				$.goMap.markers.concat(markers);
		},

		removeMarker: function(marker) {
			var index = $.inArray(marker, $.goMap.markers), current;
			if (index > -1) {
				current = $.goMap.markers.splice(index,1);
				current[0].setVisible(false);
				current[0].setMap(null);
			}
			return marker;
		},

		clearMarkers: function() {
			for (var i in $.goMap.markers) {
				$.goMap.markers[i].setVisible(false);
				$.goMap.markers[i].setMap(null);
			}
			$.goMap.singleMarker = false;
			$.goMap.markers = [];
		},

		getVisibleMarkers: function() {
			var array = [];
			for (var i in $.goMap.markers) {
				if ($.goMap.isVisible($.goMap.markers[i].getPosition()))
					array.push($.goMap.markers[i]);
			}
			return array;
		},

		isVisible: function(latlng) {
			$.goMap.map.getBounds.contains(latlng);
		},

		createMarker: function(marker) {

			var options = { map:this.map };

			if (marker.visible == false)
				options.visible = marker.visible;

			if (marker.title)
				options.title = marker.title;

			if (marker.draggable)
				options.draggable = marker.draggable;

			if (marker.icon && marker.icon.image) {
				options.icon = marker.icon.image;
				if (marker.icon.shadow)
					options.shadow = marker.icon.shadow;
			}
			else if (marker.icon)
				options.icon = marker.icon;

			else if (this.opts.icon && this.opts.icon.image) {
				options.icon = this.opts.icon.image;
				if (this.opts.icon.shadow)
					options.shadow = this.opts.icon.shadow;
			}
			else if (this.opts.icon)
				options.icon = this.opts.icon;

			if (marker.address) {
				if (marker.html)
					options.html = marker.html;

				$.goMap.geocode(marker.address, false, options);
			}
			else if (marker.latitude && marker.longitude || marker.position) {
				if (marker.position)
					options.position = marker.position;
				else
					options.position = new google.maps.LatLng(marker.latitude, marker.longitude);

				var cmarker = new google.maps.Marker(options);

				if (marker.html) {
					if (!marker.html.content && !marker.html.ajax && !marker.html.id)
						marker.html = { content:marker.html };
					else if (!marker.html.content)
						marker.html.content = null;

					$.goMap.setInfo(cmarker, marker.html);
				}
				$.goMap.addMarker(cmarker);
				return cmarker;
			}
		}
	}
})(jQuery);