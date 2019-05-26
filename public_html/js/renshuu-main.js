/*jslint devel: true, windows: true, maxlen: 140 */
// http://jslint.com/

// http://jshint.com/

// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
'use strict';

// http://javascriptweblog.wordpress.com/2010/07/26/no-more-ifs-alternatives-to-statement-branching-in-javascript/

/**
 * Please keep reading:
 *  http://code.google.com/p/gmaps-api-issues/wiki/JavascriptMapsAPIv3Changelog
 */

/**
 * Firebug console functions if they do not exist.
 * http://getfirebug.com/wiki/index.php/Console_API
 */


var renshuuMain = {
  animSpeed: 200,
  keepAlive: 1000 * 60 * 5, // Every 5 minutes a keepalive call


  /**
	 * Default filter settings. Make sure the values are always single strings.
	 */
  filterSettings: {
    arts: [],
    weekdays: ['0', '1', '2', '3', '4', '5', '6'] // all weekdays are selected by default
  },

  /**
	 * Should the training markers which are found via filtered search be shown?
	 */
  showTrainings: 1,

  /**
	 * Icon used as a background for the geocode direction
	 */
  geocodeClass: {
    none: 'denied',
    address: 'arrow3_s',
    position: 'arrow3_n'
  },

  /**
	 * Which tabs are visible
	 */
  tabLeft: '',
  tabForms: '',

  /**
	 * List of trainings which are saved for the purpose of exporting them as a list later on.
	 * Only the id of the training is saved, rest of the data is available in trainingMarkersData...
	 * and is copied to savedListData.
	 */
  savedList: [],
  savedListData: [],

  /**
	 * The current locale, filled from the bottom of index.php... Something like ja_JP or sl_SI
	 */
  locale: null,

  /**
	 * This language collection will be populated from the bottom of index.php...
	 */
  lang: null,

  /**
	 * Weekday names as per current language. Sunday is at zero index.
	 */
  weekdays: [],

  /**
	 * Email address of the user logged in.
	 * Fetched from body data.
	 */
  userEmail: '',

  /**
	 * Nameof the user logged in.
	 * Fetched from body data.
	 */
  userName: '',

  /**
	 * Please trigger this once document is ready, thus DOM has been loaded.
	 */
  ready: function () {
    const data = $('body').data();
    renshuuMain.userEmail = data.email;
    renshuuMain.userName = data.username;
    renshuuMap.streetViewEnabled = data.streetViewEnabled;

    console.group('ready');
    if (typeof localStorage === 'undefined') {
      console.log('Your browser does not support HTML5 localStorage. Try upgrading. Your browser, that is.');
    }


    // Intiate Maps
    renshuuMap.init();

    // How about a existing value for the filter settings?
    const filterArts = localStorage.getItem('filterArts');
    const filterWeekdays = localStorage.getItem('filterWeekdays');
    const tabLeft = localStorage.getItem('tabLeft');
    const tabForms = localStorage.getItem('tabForms');
    const showTrainings = localStorage.getItem('showTrainings');

    if (typeof filterArts !== 'undefined') {
      renshuuMain.filterSettings.arts = filterArts.split('.');
      console.log('filterArts storage item existed. renshuuMain.filterSettings.arts: ' + renshuuMain.filterSettings.arts);
    }
    if (typeof filterWeekdays !== 'undefined') {
      renshuuMain.filterSettings.weekdays = filterWeekdays.split('.');
      console.log('filterWeekdays storage item existed. renshuuMain.filterSettings.weekdays: ' + renshuuMain.filterSettings.weekdays);
    }
    if (typeof tabLeft !== 'undefined') {
      console.log('tabLeft : ' + tabLeft);
      renshuuMain.showTabContent($('#left .icon-list a[href="#' + tabLeft + '"]'));
    }
    if (typeof tabForms !== 'undefined') {
      console.log('tabForms : ' + tabForms);
      renshuuMain.showTabContent($('#forms .icon-list a[href="#' + tabForms + '"]'));
    }
    if (typeof showTrainings !== 'undefined') {
      console.log('showTrainings : ' + showTrainings);
      renshuuMain.showTrainings = parseInt(showTrainings) == 1 ? true : false;
      $('#session input:checkbox').attr('checked', renshuuMain.showTrainings ? 'checked' : null);
    }


    $('#session input:checkbox').on('change', function () {
      const name = $(this).attr('name');
      const check = $(this).is(':checked');
      console.log('change. name: ' + name + ', check: ' + check);

      renshuuMain.showTrainings = check;
      localStorage.setItem('showTrainings', renshuuMain.showTrainings ? 1 : 0);

      renshuuMarkers.setTrainingMarkersVisibility();
    });

    // Triggers on individual change of the checkboxes
    $(document).on('change', '.filters input:checkbox', function () {
      const name = $(this).attr('name');
      const check = $(this).is(':checked');
      console.log('change. name: ' + name + ', check: ' + check);

      renshuuMain.updateFilters();
    });

    // Triggers on a click to any of the shortcuts for selection manipulation
    $('.shortcuts a').on('click', function (event) {
      event.preventDefault();
      const action = $(this).attr('href').substr(1);

      let target = $(this).parent('p').attr('class').split(' ');
      target = target.pop(); // assume the last class

      console.log('action: ' + action + ', target: ' + target);

      // Only update filters if anything changed.
      //var changed = false;

      $('#' + target + ' input:checkbox').each(function (i, elem) {
        //console.log('each. i: ' + i + ', name: ' + $(this).attr('name') + ', checked: ' + $(this).is(':checked'));
        const checked = $(this).is(':checked');
        switch (action) {
        case 'all': $(this).attr('checked', 'checked'); break;
        case 'none': $(this).removeAttr('checked'); break;
        case 'inverse': $(this).attr('checked', checked ? null : 'checked'); break;
        }
      });
      //if (changed) {
      renshuuMain.updateFilters();
      //}
    });

    // Open external links in a new window. Perhaps copyright is the only one...
    $(document).on('click', 'a[href^="http://"]', function (event) {
      event.preventDefault();
      const href = $(this).attr('href');
      const now = new Date();
      window.open(href, now.getMilliseconds());
    });


    // Change tab content
    $('.icon-list a').on('click', function (event) {
      event.preventDefault();
      renshuuMain.showTabContent($(this));
    }).on('mouseover', function() {
      const title = $(this).attr('title');
      const $tab = $(this).parents('.bottom-tabs').find('.tab-title p');
      $tab.data('title', $tab.text()).text(title);
    }).on('mouseout', function() {
      const $tab = $(this).parents('.bottom-tabs').find('.tab-title p');
      $tab.text($tab.data('title'));
      $tab.data('title', null);
    });


    // Once a info windowfor a training is open, this handles the links on the bottom of it
    $(document).on('click', '.modal-tools a', function (event) {
      event.preventDefault();
      const href = $(this).attr('href').substr(1).split('-');
      const id = href.pop();
      const action = href.shift();
      console.log('modal-tools a click. action: ' + action + ', id: ' + id);
      if (action == 'savetolist') {
        renshuuMain.addSavedList(id);
        $('.modal-tools a[href|="#removefromlist"]').show();
        $(this).hide();
      }
      else {
        renshuuMain.removeSavedList(id);
        $('.modal-tools a[href|="#savetolist"]').show();
        $(this).hide();
      }
    });

    $(document).on('click', '#savedlist a[href|="#remove"]', function (event) {
      event.preventDefault();
      const href = $(this).attr('href');
      const id = href.split('-').pop();
      console.log('#savedlist a click. href: ' + href + ', id: ' + id);
      renshuuMain.removeSavedList(id);
    });

    // Get any possible existing data for saved list
    $.post('/ajax/get/savelist', function (received, status) {
      // data should be directly usable for the template...
      const len = received.savelist.length;
      for (let i = 0; i < len; i++) {
        const data = received.savelist[i];
        const inx = renshuuMain.savedList.push(data.training.id);
        renshuuMain.savedListData[inx] = data;
        $('#savedlist tbody').prepend($('#savedTemplate').render(data));
      }
    });

    // Update DOM based on localStorage memory
    renshuuMain.applyFiltersToHtml();

    // Finally, set the keepalive call
    setInterval(function () {
      renshuuMain.aliveKeeper();
    }, renshuuMain.keepAlive);


    console.groupEnd();

    // Handlers for forms
    renshuuForms.init();

    // Fetch trainings available for current settings. Uses map, thus after map init
    var one = setInterval(function () {
      renshuuMain.updateTrainings();
      clearInterval(one);
    }, 2200); // assume 2.2 sec is enough...
  },

  /**
	 * Keep alive call
	 */
  aliveKeeper: function () {
    $.get('/ajax/keepalive', function (data) {
      //
    }, 'json');
  },

  /**
	 * Each tab has an individual content.
	 * key Which tab
	 * side	left/forms
   * @param {jQuery} $elem
	 */
  showTabContent: function ($elem) {
    const href = $elem.attr('href');

    // No point of continuing further...
    if (typeof href === 'undefined') {
      return false;
    }

    const key = href.substr(1);
    const title = $elem.attr('title');
    const description = $elem.children('img').attr('alt');
    console.log('key: ' + key + ', title: ' + title + ', description: ' + description);

    const $tabs = $elem.parents('.bottom-tabs');

    // Remove and add "current" class
    $tabs.find('.icon-list a').removeClass('current');
    $elem.addClass('current');

    // Set title
    const p = $tabs.find('.tab-title p');
    p.text(title);
    p.data('title', title); // used on hover

    // Hide all that is visible
    $tabs.find('.tab-content > div:visible').hide();

    // Show the requested one
    $('#' + key).show();

    // Save current view
    renshuuMain.tabLeft = $('#left .tab-content > div:visible').attr('id');
    renshuuMain.tabForms = $('#forms .tab-content > div:visible').attr('id');
    localStorage.setItem('tabForms', renshuuMain.tabForms);
    localStorage.setItem('tabLeft', renshuuMain.tabLeft);

    // Now handle any special cases
    if (typeof renshuuMarkers.locationMarker !== 'undefined') {
      if (key == 'location') {
        const pos = renshuuMap.map.getCenter();
        renshuuMarkers.locationMarker.setPosition(pos);
        renshuuMarkers.locationMarker.setVisible(true);
        console.log('locationMarker set visible and to pos: ' + pos);
      }
      else {
        renshuuMarkers.locationMarker.setVisible(false);
      }

      console.log('locationMarker is now visible: ' + renshuuMarkers.locationMarker.getVisible());
    }
    if (key == 'street' && renshuuMap.streetViewEnabled) {
      renshuuMap.streetView.setVisible(true);
    }
  },

  /**
	 *
   * @param {string} key
	 */
  applyKey: function (key) {
    if (key == 'filters') {
      renshuuMain.applyFiltersToHtml();
    }
    else if (key == 'location') {
      renshuuForms.updateGeocodeSelectionIcon();
      // begin to show location markers...
    }

  },

  /**
	 * Add a training to the list of saved trainings if it is not there yet.
   * @param {} id
	 * @see
	 */
  addSavedList: function (id) {
    console.group('addSavedList');
    const inx = renshuuMain.savedList.indexOf(id); // check for existense
    console.log('id: ' + id + ', inx: ' + inx);
    if (inx === -1) {
      const data = null;
      renshuuMain.savedList.push(id);
      const len = renshuuMarkers.trainingMarkersData.length;
      const savedlen = renshuuMain.savedListData.length; // only for debugging
      renshuuMarkers.trainingMarkersData.some(function (data) {
        if (data.training.id == id) {
          renshuuMain.savedListData.push(data);
          console.dir(data);

          return true;
        }
      });
      console.log('savedListData length before and after adding try: ' + savedlen + ' > ' + renshuuMain.savedListData.length);

      // Now add it to DOM... Should this be made as a table or a list? table.
      // Use template "savedTemplate", but this is used only one way as a template.
      // Removal is done via regular DOM removal actions.
      if (typeof data !== 'undefined') {
        data.weekDay = renshuuMain.weekdays[data.training.weekday];
        $('#savedlist tbody').prepend($('#savedTemplate').render(data));

        // Finally send an update to the backend for saving this item
        const post = {
          action: 'save',
          training: id
        };
        $.post('/ajax/set/savelist', post, function (received, status) {
          // nothing might be there...
        });
      }
    }
    console.groupEnd();
  },

  /**
	 * Remove from list, as a counter part of adding.
   * @param {} id
	 * @see
	 */
  removeSavedList: function (id) {
    console.group('removeSavedList');
    const inx = renshuuMain.savedList.indexOf(id);
    console.log('id: ' + id + ', inx: ' + inx);
    if (inx !== -1) {
      renshuuMain.savedList.splice(inx, 1);
      const len = renshuuMain.savedListData.length; // before length, remove once tested
      renshuuMarkers.savedListData.some(function (data) {
        if (data.training.id == id) {
          renshuuMain.savedListData.splice(i, 1);

          return true;
        }
      });
      console.log('savedListData length before and after removal try: ' + len + ' > ' + renshuuMain.savedListData.length);

      // Now remove it from DOM
      $('#saved-' + id).remove();

      // Finally send an update to the backend for removing this item
      const post = {
        action: 'delete',
        training: id
      };
      $.post('/ajax/set/savelist', post, function (received, status) {
        // the inserted id will be in returning data...
      });
    }
    console.groupEnd();
  },

  /**
	 * Update filters data according to current checkbox selection.
	 * @see
	 */
  updateFilters: function () {
    console.group('updateFilters');
    const sets = ['arts', 'weekdays'];
    const len = sets.length;
    const lens = [];
    console.log('len: ' + len + ', sets: ' + sets);
    for (let i = 0; i < len; ++i) {
      const target = sets[i];
      var list = [];
      $('#' + target + ' input:checkbox').each(function (inx, elem) {
        const id = $(this).attr('name').split('_').pop();
        console.log('inx: ' + inx + ', name: ' + $(this).attr('name') + ', id: ' + id + ', checked: ' + $(this).is(':checked'));
        if ($(this).is(':checked')) {
          list.push(id);
        }
      });
      lens.push(list.length);
      renshuuMain.filterSettings[target] = list;
      console.log('target: ' + target + ' = ' + list);
    }

    // Make sure any of the selections was not empty
    if (lens.indexOf(0) == -1) {
      renshuuMain.updateTrainings();
    }

    // Storage is updated every time
    localStorage.setItem(
      'filterArts',
      renshuuMain.filterSettings.arts.join('.')
    );
    localStorage.setItem(
      'filterWeekdays',
      renshuuMain.filterSettings.weekdays.join('.')
    );
    console.groupEnd();
  },

  /**
	 * This applies the current filter settings to the html in the dom
	 * @see
	 */
  applyFiltersToHtml: function () {
    console.group('applyFiltersToHtml');
    for (const item in renshuuMain.filterSettings) {
      if (Reflect.has(renshuuMain.filterSettings, item)) {
        var list = renshuuMain.filterSettings[item];
        console.log('item: ' + item + ', list: ' + list);

        $('#filter_' + item + ' input:checkbox').each(function (i, elem) {
          const rel = $(this).attr('name').split('_').pop();
          const inx = list.indexOf(rel);
          $(this).attr('checked', inx !== -1 ? 'checked' : null);
        });
      }
    }
    console.groupEnd();
  },

  /**
	 * @see http://www.jlpt.jp/samples/forlearners.html
	 */
  updateTrainings: function () {
    console.group('updateTrainings');
    if (typeof renshuuMap.map === 'undefined') {
      return false;
    }
    const bounds = renshuuMap.map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const para = {
      area: {
        northeast: [ne.lat(), ne.lng()],
        southwest: [sw.lat(), sw.lng()]
      },
      filter: renshuuMain.filterSettings
    };

    renshuuMarkers.clearMarkers(renshuuMarkers.trainingMarkers);
    renshuuMarkers.trainingMarkersData = [];

    $.post('/ajax/get', para, function (data, status) {
      if (data && data.result) {
        const res = data.result;
        const len = res.length;
        for (let i = 0; i < len; ++i) {
          renshuuMarkers.createTrainingMarker(res[i]);
        }
      }
      else {
        console.log('Seems AJAX failed. ' + status);
      }
    }, 'json');
    console.groupEnd();
  }
};
