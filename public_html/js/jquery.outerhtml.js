/**
 * jQuery.outerHtml
 */
(function ($) {
	/**
	 * Get the inner and outer html data,
	 * that is the selected element itself including.
	 */
	$.fn.outerHtml = function () {
		var outer = null;
		if (this.length) {
			var div = $('<' + 'div style="display:none"><' + '/div>');
			var clone = $(this[0].cloneNode(false)).html(this.html()).appendTo(div);
			outer = div.html();
			div.remove();
		}
		return outer;
	};
})(jQuery);
