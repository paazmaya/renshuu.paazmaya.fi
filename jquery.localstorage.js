/* 
The jQuery local storage plugin. Amaze your friends! Save data using nothing but javascript! I know that it's not that hard to just type out the normal javascript, but if you've already got jQuery loaded, it's so much quicker to just type .saveData() and .loadData().

Custom variables and their definitions:

key				A unique key used to store and retrive specific data.									both
errorfunc		The function that should be run in case the browser doesn't support localStorage.		both
def				What the saved data should default to if there is nothing provided.						save only
html			Wether the output should be .html() or .text() (true for .html).						load only

*/
(function($){
		  
	$.fn.saveit = function(options){
		
		//Default the saved data key to 'data', so people can just be like .saveData() and not worry about stuff.
		//Use deff to say what the plugin should save in case there is nothing to save in the selected element.
		//Also, have an errorfunc in case things go belly up and they can't use local storage.
		var defaults = {
				key: 'data',
				def: 'null',
				errorfunc: function(){
					alert("Sorry, your browser doesn't support local storage.");
				}
			},
			settings = $.extend({}, defaults, options);	
			
		this.each(function(){
			var $this = $(this);
			if($this.val()){
				//Check if there's a val() straight up.
				var html = $this.val();
			} else if($this.html()) {
				//Now check if it's just a regular element.
				var html = $this.html();
			} else {
				//Otherwise, default to def.
				var html = settings.def;
			}
			if(localStorage){
				if(html){
					//Do the deed
					localStorage.setItem(settings.key, html);
				}
			} else {
				//Resort to the errorfunc if localStorage isn't supported.
				return settings.errorfunc(settings.errorparams);
			}
		});
		//Chainability
		return this;
		
	}
	
	$.fn.loadit = function(options){
		//Again, default to 'data' so people can be all .loadData(), cus people are busy nowadays and don't have time to type this stuff out.
		//Also, define an 'html' boolean, which decides wether this is output as html or just text.
		var defaults = {
				key: 'data',
				errorfunc: function(){
					alert("Sorry, your browser doesn't support local storage");
				},
				html: true
			},
			settings = $.extend({}, defaults, options);	
		
		this.each(function(){
			var $this = $(this);
			//Is localStorage supported?
			if(localStorage){
				//Find our saved data
				var data = localStorage.getItem(settings.key);
				//If we picked html :
				if(data){
					if(settings.html){
						//If it's a form element
						if($this.is('textarea') || $this.is('input')){
							//Output as val
							$this.val(data);
						} else {
							//Otherwise, output as html
							$this.html(data);
						}
					} else {
						//Otherwise, output as text.
						$this.text(data);	
					}
				} else {
					return false;	
				}
			} else {
				//If localStorage isn't supported, run the errorfunc.
				return settings.errorfunc(settings.errorparams);	
			}
		});
		//Chainability
		return this;
	}
	
})(jQuery);