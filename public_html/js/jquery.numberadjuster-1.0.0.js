/**
* Juga Paazmaya <olavic@gmail.com>
* Change the numeric value with a keyboard shortcut and/or mousewheel.
*
* $(input).numberadjuster();
*/
(function($, undefined){
	$.fn.numberadjuster = function(params) {
		var settings = $.extend(
			{},
			{
				modal: false, // Use modal, as oppose to inline
				insertIn: '' // Insert the form to the first element matching this query, while using inline
			},
			params
		);

		return $(this);
	};
})(jQuery);