<--- --------------------------------------------------------------------------------------- ----
	
	Blog Entry:
	jQuery Plugin: Tracing Your Selector Paths
	
	Author:
	Ben Nadel / Kinky Solutions
	
	Link:
	http://www.bennadel.com/index.cfm?event=blog.view&id=1710
	
	Date Posted:
	Sep 15, 2009 at 2:25 PM
	
---- --------------------------------------------------------------------------------------- --->


// Create a closure and a self-executing method so that the
// trace method can create variable dependencies without
// putting things in the global name space.
(function( $ ){
 
	// This is the original selector sent to the tracer.
	var originalSelector = null;
 
	// This is the collection of selector parts that the parser
	// was able to break out of the original selector.
	var selectorMaps = [];
 
	// This is the current depth of the tracing.
	var traceDepth = 0;
 
	// This is the timeout reference being used to get from one
	// selector text to the next.
	var traceTimeout = null;
 
	// This is the amount of time that the trace will pause
	// between steps (this can be overriden later on when the
	// trace method(s) are called.
	var defaultPause = (2 * 1000);
 
	// This is the pause value that the actual trace will use.
	var tracePause = defaultPause;
 
 
	// ------------------------------------------------------ //
	// ------------------------------------------------------ //
 
 
	// I check to make sure the styles needed by the tracer
	// have been injected into the document if they are not
	// already there.
	var checkForStyles = function(){
		var tracerStyle = $( "#jquery-tracer-style" );
 
		// Check to see if the node was found.
		if (!tracerStyle.size()){
 
			// The node was not found, so we have to inject it
			// into the head.
			$( "head" ).append("\
				<style id=\"jquery-tracer-style\">\n\
				.jqst0 { background-color: #F0F0F0; }\n\
				.jqst1 { background-color: #D0D0D0; }\n\
				.jqst2 { background-color: #B0B0B0; }\n\
				.jqst3 { background-color: #909090; }\n\
				.jqst4 { background-color: #707070; }\n\
				.jqst5 { background-color: #505050; }\n\
				.jqst6 { background-color: #303030; }\n\
				.jqst7 { background-color: #151515; }\n\
				.jqstX { background-color: gold; }\n\
				</style>"
				);
 
		}
	};
 
 
	// This removes all tracer styles from the document.
	var removeStyles = function(){
		// Loop over each style class and remove it from any
		// matching nodes.
		for ( var i = 0 ; i <= 7 ; i++ ){
 
			// Remove the styles from class-matching nodes.
			$( ".jqst" + i ).removeClass( "jqst" + i );
 
		}
 
		// Remove any final styles.
		$( ".jqstX" ).removeClass( "jqstX" );
	};
 
 
	// I clean the given selector, preparing it for parsing.
	var cleanSelector = function( selector ){
		// First, let's just trim it.
		selector = $.trim( selector );
 
		// Replace multiple spaces with a single space.
		selector = selector.replace(
			new RegExp( " +", "g" ),
			" "
			);
 
		// Join the special descendent selector to the seelctor
		// that it references (this will make parsing easier).
		selector = selector.replace(
			new RegExp( "([>~]) +", "g" ),
			"$1"
			);
 
		// Return the scrubbed selector.
		return( selector );
	};
 
 
	// I get the top-level selectors from the given selector
	// string. By that, I mean that I return sets of selectors
	// that are separated by commas (,) in a single selector.
	var getTopLevelSelectors = function( selector ){
		// Get the selectors separated by commas.
		var topLevelSelectors = selector.match(
			new RegExp(
				"([^,'\"]+('[^']*'|\"[^\"]*\")?)+",
				"gi"
				)
			);
 
		// Return the array of top level selectors.
		return( topLevelSelectors );
	};
 
 
	// I parse the selector into it's given step-wise parts. The
	// return value will be an array of top-level selectors that
	// has each been broken down into an array of path steps.
	var parseSelector = function( selector ){
		// Get the top level selectors.
		var topLevelSelectors = getTopLevelSelectors(
			cleanSelector( selector )
			);
 
		// Create an array to hold the individual paths of
		// top-level selectors. For each top level selector,
		// parse its path into individual step-wise parts.
		var selectorMaps = [];
 
		// Get a body node - this will be the root context of each
		// selector path.
		var jBody = $( document.body );
 
		// Iterate over each top level selector.
		$.each(
			topLevelSelectors,
			function( index, topLevelSelector ){
 
				selectorMaps.push({
					context: jBody,
					selectors: $.trim( topLevelSelector ).match(
						new RegExp(
							"("+
								"[^\\s'\"(]+" +
								"(" +
									"'[^']*'" + "|" +
									"\"[^\"]*\"" + "|" +
									"\\(" +
										"(" +
											"[^)'\"]*" +
											"('[^']*'|\"[^\"]*\")?" +
										")*" +
									"\\)" +
								")?" +
							")+",
							"gi"
							)
						)
					});
			}
			);
 
		// Return the collection of top level selector paths
		// that have been broken down into parts.
		return( selectorMaps );
	};
 
 
	// I reset the tracer environment for a new trace.
	var reset = function(){
		// Remove all the style.
		removeStyles();
 
		// Reset properties.
		originalSelector = null;
		selectorMaps = [];
		traceDepth = 0;
		clearTimeout( traceTimeout );
		traceTimeout = null;
	};
 
 
	// I perform the trace at the current depth. I rely on the
	// globally defined variables to perform the trace.
	var executeTrace = function(){
		var map = null;
		var keepTracing = false;
 
		// Loop over each map to highlight the next trace in our
		// breadth-first trace algorithm.
		for (
			var mapIndex = 0 ;
			mapIndex < selectorMaps.length ;
			mapIndex++
			){
 
			// Get a handle on the current path.
			map = selectorMaps[ mapIndex ];
 
			// Check to see if there is an element at this depth
			// in the current path.
			if (map.selectors.length > traceDepth){
 
				// Update the context for this map.
				map.context = map.context.find(
					map.selectors[ traceDepth ]
					);
 
				// Apply classes to the new context.
				map.context.addClass( "jqst" + traceDepth );
 
				// Check to see if this particular map has any
				// more steps in it. If it does, then flag the
				// tracing for continuation. If it does not,
				// then let's add the final step class.
				if (map.selectors.length > (traceDepth + 1)){
 
					// More steps.
					keepTracing = true;
 
				} else {
 
					// This is the final step, flag the the
					// current context as final.
					map.context.addClass( "jqstX" );
 
				}
			}
 
		}
 
		// Increase the trace depth.
		traceDepth++;
 
		// Check to see if we should keep tracing.
		if (keepTracing){
 
			// Set a timeout for the next trace.
			traceTimeout = setTimeout(
				executeTrace,
				tracePause
				);
 
		}
	};
 
 
	// Add the trace method to the jQuery method.
	$.trace = function( selector, pause ){
		var selector = selector;
 
		// Before we begin, check to make sure that the classes
		// we need have been injected into the DOM.
		checkForStyles();
 
		// Reset the testing environment.
		reset();
 
		// Store the original selector.
		originalSelector = selector;
 
		// Store the selector tree.
		selectorMaps = parseSelector( selector );
 
		// Set up the tracing pause time.
		tracePause = (pause || defaultPause);
 
		// Execute the trace.
		executeTrace();
	};
 
 
	// Add a trace method as a plugin.
	$.fn.trace = function( pause ){
		// Simply pass the original selector off to the
		// core trace method.
		$.trace( this.selector, pause );
 
		// Return the current stack.
		return( this );
	}
 
})( jQuery );