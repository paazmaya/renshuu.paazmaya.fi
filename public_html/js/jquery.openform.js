/**
* Juga Paazmaya <olavic@gmail.com>
* Open a hidden form either inline or as modal window, which then is submitted as ajax to the "action" url.
*
* $(form#id).openForm();
*/
(function($, undefined){
	$.fn.openForm = function(params) {
		var settings = $.extend(
			{},
			{
				modal: false, // Use modal, as oppose to inline
				insertIn: '' // Insert the form to the first element matching this query, while using inline
			},
			params
		);
		
		this.child('input[type=submit]').click(function() {
			
			return false;
		});
		return $(this);
	};
})(jQuery);