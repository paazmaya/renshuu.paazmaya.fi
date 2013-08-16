/**
 * Renshuu Export
 */
var renshuuExport = {
	
	
	init: function () {
		
		// Special care for the export settings form, in order to update its preview
		$('#export_form input, #export_form select').live('change', function (){
			renshuuExport.updateExportPreview();
		});
		
		// Initial load...
		//renshuuExport.updateExportPreview();
	},
	
	/**
	 * @see http://code.google.com/apis/maps/documentation/staticmaps/
	 */
	updateExportPreview: function () {
		console.group('updateExportPreview');
		var url = 'http://maps.google.com/maps/api/staticmap?';
		var values = ['sensor=false'];
		var fields = ['maptype', 'language', 'format', 'zoom', 'size'];
		var items = $('#export_form input, #export_form select');
		var len = fields.length;
		// Should there be additional checks for allowed values...
    fields.forEach(function(field) {
			var val = '';
			if (items.filter('select[name="' + field + '"]').size() > 0) {
				val = items.filter('select[name="' + field + '"]').val();
			}
			else {
				val = items.filter('input[name="' + field + '"]').val();
			}
			console.log('val: ' + val);
			values.push(field + '=' + val);
		});
		url += values.join('&');
		// marker requires special attention
		url += '&markers=color:' + $('#export_form input[name="color"]').val() +
			'|label:' + $('#export_form input[name="label"]').val() + '|' +
			renshuuMap.centre.lat() + ',' +renshuuMap.centre.lng();

		console.log('url: ' + url);

		// perhaps there could be some animation to show that something happened...
		$('#exportpreview').attr('src', url);
		console.groupEnd();
	}
};

